
import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mail,
  Phone,
  Shield,
  Key,
  Smartphone,
  LogOut,
  History,
  X,
  User as UserIcon,
  AlertTriangle,
  Building,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';

export const AdminProfile: React.FC = () => {
  const { user } = useAuth();

  // Local state for form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    work_hours: '',
    role: ''
  });

  const [lastLogins] = useState([
    { id: 1, date: '17/12/2025', time: '08:12', device: 'Chrome - Windows 11', location: 'São Paulo, SP' },
    { id: 2, date: '16/12/2025', time: '14:45', device: 'Safari - iPhone 15', location: 'São Paulo, SP' },
    { id: 3, date: '16/12/2025', time: '09:02', device: 'Chrome - Windows 11', location: 'São Paulo, SP' },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '(11) 99999-9999',
        department: user.department || 'Gestão Executiva',
        work_hours: user.work_hours || '08:00 - 18:00 (Seg a Sex)',
        role: user.role === 'ADMIN' ? 'Administrador' : user.role
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await UserService.update(user.id, {
        name: formData.name,
        email: formData.email, // Added Email Update
        phone: formData.phone,
        department: formData.department,
        work_hours: formData.work_hours
      });
      alert("Dados atualizados com sucesso!");
      setIsEditModalOpen(false);
      // Page reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#437476] tracking-tight">Meu Perfil Administrativo</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-widest text-[10px]">Gestão de Credenciais e Segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary and Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#437476]"></div>
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-8 ring-slate-50 transition-transform group-hover:scale-105">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-[#437476] text-white p-3 rounded-2xl hover:bg-[#365e5f] transition-all shadow-lg border-4 border-white">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formData.name}</h3>
            <p className="text-[#437476] text-xs font-black uppercase tracking-[0.2em] mt-2 bg-[#437476]/5 py-1 px-4 rounded-full inline-block">
              {formData.role}
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-3.5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm border border-slate-200"
              >
                Editar Informações
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-3.5 bg-white text-[#437476] font-bold rounded-2xl hover:bg-[#437476]/5 transition-all flex items-center justify-center gap-2 text-sm border border-slate-100"
              >
                <Key size={16} /> Alterar Senha
              </button>
            </div>
          </div>

          {/* Security Section - WIP Style */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 shadow-sm opacity-75 relative overflow-hidden">
            <div className="absolute top-5 right-5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1 rounded">Em Desenvolvimento</div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Shield size={14} className="text-slate-400" /> Segurança da Conta
            </h4>
            <div className="space-y-6 grayscale-[0.5] pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-200 text-slate-500 rounded-xl"><Smartphone size={18} /></div>
                  <div>
                    <p className="text-sm font-black text-slate-600">Autenticação 2FA</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Não Configurado</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative p-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="p-4 bg-white/50 rounded-2xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed flex items-center gap-2">
                  <AlertTriangle size={12} /> Funcionalidade de segurança avançada em breve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Data */}
        <div className="lg:col-span-2 space-y-6">

          {/* Professional Data */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <UserIcon size={24} className="text-[#437476]" /> Dados Pessoais
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{formData.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefone / WhatsApp</label>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{formData.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 border-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departamento</label>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100">
                    <Building size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{formData.department}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário de Atendimento</label>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100">
                    <Clock size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{formData.work_hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Log */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <History size={24} className="text-[#437476]" /> Histórico de Acesso
              </h3>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#437476]">Ver todos</button>
            </div>

            <div className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4">Dispositivo</th>
                    <th className="pb-4">Localização</th>
                    <th className="pb-4 text-right">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lastLogins.map(log => (
                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="font-bold text-slate-700">{log.device}</span>
                        </div>
                      </td>
                      <td className="py-5 text-slate-500 font-medium">{log.location}</td>
                      <td className="py-5 text-right font-black text-slate-400 text-xs">
                        {log.date} <span className="text-slate-300 ml-1">{log.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-600 transition-colors px-6 py-3 rounded-full hover:bg-red-50">
              <LogOut size={16} /> Encerrar Todas as Sessões
            </button>
          </div>

        </div>
      </div>

      {/* MODAL: EDIT INFO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10 p-2 bg-white rounded-full shadow-sm"
            >
              <X size={20} />
            </button>
            <div className="px-10 py-10">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Editar Meus Dados</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Atualize suas informações de contato e profissionais.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Contato</label>
                  <input
                    type="tel"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Ex: Financeiro"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                      value={formData.work_hours}
                      onChange={e => setFormData({ ...formData, work_hours: e.target.value })}
                      placeholder="Ex: 08:00 - 18:00"
                    />
                  </div>
                </div>

                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cargo (Papel): {formData.role}</p>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-5 bg-[#437476] text-white font-black rounded-3xl hover:bg-[#365e5f] hover:-translate-y-1 transition-all shadow-xl shadow-[#437476]/30 text-sm uppercase tracking-widest active:scale-[0.98] mt-4 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
            <div className="px-10 py-12 text-center">
              <div className="w-20 h-20 bg-[#437476]/10 text-[#437476] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#437476]/5 border border-[#437476]/10">
                <Key size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Alterar Senha</h3>
              <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed">Defina uma senha forte para garantir a segurança da gestão.</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Atual</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-10">
                <button onClick={() => setIsPasswordModalOpen(false)} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[11px]">Confirmar Nova Senha</button>
                <button onClick={() => setIsPasswordModalOpen(false)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
