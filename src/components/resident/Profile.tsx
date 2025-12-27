import React, { useEffect, useState } from 'react';
import { Camera, Mail, Phone, Save, Plus, Trash2, Car, Cat, X, Key, Shield, User, Clock, AlertTriangle } from 'lucide-react';
import { ProfileService, Profile, Vehicle, Pet } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export const ResidentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Form State
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form States
  const [newVehicle, setNewVehicle] = useState({ model: '', color: '', plate: '' });
  const [newPet, setNewPet] = useState({ name: '', type: 'Cachorro', breed: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const fetchProfile = async () => {
    try {
      const data = await ProfileService.getMe();
      setProfile(data);
      setPhone(data.phone || '');
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateContact = async () => {
    setSaving(true);
    try {
      await ProfileService.updateMe({ phone });
      alert('Contato atualizado com sucesso!');
    } catch (error) {
      console.error("Error updating profile", error);
      alert('Erro ao salvar dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProfileService.addVehicle(newVehicle);
      await fetchProfile();
      setIsVehicleModalOpen(false);
      setNewVehicle({ model: '', color: '', plate: '' });
    } catch (error) {
      console.error("Error adding vehicle", error);
    }
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 7) value = value.slice(0, 7);
    if (value.length > 3) value = `${value.slice(0, 3)}-${value.slice(3)}`;
    setNewVehicle({ ...newVehicle, plate: value });
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProfileService.addPet(newPet);
      await fetchProfile();
      setIsPetModalOpen(false);
      setNewPet({ name: '', type: 'Cachorro', breed: '' });
    } catch (error) {
      console.error("Error adding pet", error);
    }
  };

  const removeVehicle = async (id: string) => {
    if (!confirm("Remover veículo?")) return;
    try {
      await ProfileService.deleteVehicle(id);
      await fetchProfile();
    } catch (error) {
      console.error("Error removing vehicle", error);
    }
  };

  const removePet = async (id: string) => {
    if (!confirm("Remover pet?")) return;
    try {
      await ProfileService.deletePet(id);
      await fetchProfile();
    } catch (error) {
      console.error("Error removing pet", error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.current) {
      alert("Por favor, informe sua senha atual.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }

    // Validation
    const hasUpperCase = /[A-Z]/.test(passwordForm.new);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new);
    const minLength = passwordForm.new.length >= 6;

    if (!minLength || !hasUpperCase || !hasSpecialChar) {
      alert("A senha deve ter:\n- Mínimo 6 caracteres\n- Letra Maiúscula\n- Caractere Especial");
      return;
    }

    setSaving(true);
    try {
      await ProfileService.updateMe({
        password: passwordForm.new,
        current_password: passwordForm.current
      });
      alert("Senha alterada com sucesso!");
      setIsPasswordModalOpen(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        alert("Senha atual incorreta.");
      } else {
        alert("Erro ao alterar senha.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando perfil...</div>;
  if (!profile) return <div className="p-8 text-center text-slate-500">Erro ao carregar perfil.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Meu Perfil de Morador</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-widest text-[10px]">Gerencie seus dados e acessos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Summary and Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl ring-8 ring-slate-50 transition-transform group-hover:scale-105 mx-auto">
                {profile.name.charAt(0)}
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{profile.name}</h3>
            <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mt-2 bg-emerald-50 py-1 px-4 rounded-full inline-block">
              BLOCO {profile.unit_block || '-'} • APTO {profile.unit_number || '-'}
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-200"
              >
                <Key size={16} /> Alterar Minha Senha
              </button>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-xl"><Phone size={20} className="text-slate-500" /></div>
              <h4 className="font-bold text-slate-700">Contato</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">E-mail Cadastrado</label>
                <p className="text-sm font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 truncate">
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Telefone / WhatsApp</label>
                <div className="flex gap-2">
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                  <button
                    onClick={handleUpdateContact}
                    disabled={saving}
                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assets */}
        <div className="lg:col-span-2 space-y-6">

          {/* Vehicles Section */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Car size={24} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Meus Veículos</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Controle de acesso à garagem</p>
                </div>
              </div>
              <button onClick={() => setIsVehicleModalOpen(true)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                <Plus size={14} /> Novo
              </button>
            </div>

            {profile.vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.vehicles.map(v => (
                  <div key={v.id} className="border border-slate-200 rounded-3xl p-5 flex flex-col hover:shadow-md transition-all group bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-700">{v.model}</h4>
                      <button onClick={() => removeVehicle(v.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-xs font-bold text-slate-500">{v.color}</span>
                      <span className="text-xs font-mono font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-lg tracking-wider border border-slate-300/50">{v.plate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum veículo cadastrado</p>
              </div>
            )}
          </div>

          {/* Pets Section */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Cat size={24} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Meus Pets</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Cadastro de animais</p>
                </div>
              </div>
              <button onClick={() => setIsPetModalOpen(true)} className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                <Plus size={14} /> Novo
              </button>
            </div>

            {profile.pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.pets.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-3xl p-5 flex flex-col hover:shadow-md transition-all group bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-black text-slate-700">{p.name}</h4>
                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider ">{p.type}</span>
                      </div>
                      <button onClick={() => removePet(p.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-slate-500">{p.breed}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum pet cadastrado</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL: CHANGE PASSWORD (COPIED FROM ADMIN) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
            <div className="px-10 py-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 border border-emerald-100">
                <Key size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Alterar Senha</h3>
              <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed">Defina uma nova senha segura para sua conta.</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  />
                </div>

                {/* Password Requirements */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Requisitos de Segurança:</p>
                  <ul className="space-y-1">
                    <li className={`text-xs font-bold flex items-center gap-2 ${passwordForm.new.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordForm.new.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      Mínimo de 6 caracteres
                    </li>
                    <li className={`text-xs font-bold flex items-center gap-2 ${/[A-Z]/.test(passwordForm.new) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(passwordForm.new) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      Letra Maiúscula
                    </li>
                    <li className={`text-xs font-bold flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      Caractere Especial (!@#...)
                    </li>
                    <li className={`text-xs font-bold flex items-center gap-2 ${passwordForm.new && passwordForm.new === passwordForm.confirm ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordForm.new && passwordForm.new === passwordForm.confirm ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      Senhas coincidem
                    </li>
                  </ul>
                </div>

              </div>

              <div className="flex flex-col gap-3 mt-10">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                  className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 uppercase tracking-widest text-[11px] disabled:opacity-50"
                >
                  {saving ? 'Atualizando...' : 'Confirmar Nova Senha'}
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={saving}
                  className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal (RETAINED FROM OLD, JUST STYLED) */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Novo Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda Civic"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Cor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prata"
                  value={newVehicle.color}
                  onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Placa</label>
                <input
                  type="text"
                  required
                  placeholder="ABC-1234"
                  value={newVehicle.plate}
                  onChange={handlePlateChange}
                  maxLength={8}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200/50 uppercase tracking-wider text-xs">
                Adicionar Veículo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Pet Modal (RETAINED FROM OLD, JUST STYLED) */}
      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Novo Pet</h3>
              <button onClick={() => setIsPetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPet} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rex"
                  value={newPet.name}
                  onChange={e => setNewPet({ ...newPet, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Tipo</label>
                <div className="relative">
                  <select
                    value={newPet.type}
                    onChange={e => setNewPet({ ...newPet, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                  >
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Raça</label>
                <input
                  type="text"
                  placeholder="Ex: Vira-lata"
                  value={newPet.breed}
                  onChange={e => setNewPet({ ...newPet, breed: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200/50 uppercase tracking-wider text-xs">
                Adicionar Pet
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};