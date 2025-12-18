
import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Building, 
  Users, 
  Calendar, 
  Bell, 
  Save, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Smartphone,
  Info,
  CheckCircle,
  X,
  Shield,
  Clock,
  DollarSign,
  History,
  Search,
  Filter,
  Monitor
} from 'lucide-react';
import { MOCK_SYSTEM_LOGS } from '../../mock';

type SettingsView = 'menu' | 'condo_data' | 'users' | 'booking_rules' | 'notifications' | 'logs';

export const AdminSettings: React.FC = () => {
    const [currentSubView, setCurrentSubView] = useState<SettingsView>('menu');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Configurações salvas com sucesso!');
        }, 800);
    };

    const renderSubView = () => {
        switch (currentSubView) {
            case 'condo_data': return <CondoDataView onBack={() => setCurrentSubView('menu')} onSave={handleSave} isSaving={isSaving} />;
            case 'users': return <UserManagementView onBack={() => setCurrentSubView('menu')} />;
            case 'booking_rules': return <BookingRulesView onBack={() => setCurrentSubView('menu')} onSave={handleSave} isSaving={isSaving} />;
            case 'notifications': return <NotificationConfigView onBack={() => setCurrentSubView('menu')} onSave={handleSave} isSaving={isSaving} />;
            case 'logs': return <LogsView onBack={() => setCurrentSubView('menu')} />;
            default: return <SettingsMenu onNavigate={setCurrentSubView} />;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                {currentSubView !== 'menu' && (
                    <button 
                        onClick={() => setCurrentSubView('menu')}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Configurações</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {currentSubView === 'menu' && 'Gerencie as diretrizes e dados do sistema.'}
                        {currentSubView === 'condo_data' && 'Dados institucionais do condomínio.'}
                        {currentSubView === 'users' && 'Gerenciamento de equipe e permissões.'}
                        {currentSubView === 'booking_rules' && 'Regras e horários para áreas comuns.'}
                        {currentSubView === 'notifications' && 'Configuração de alertas automáticos.'}
                        {currentSubView === 'logs' && 'Auditoria de ações e alterações do sistema.'}
                    </p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {renderSubView()}
            </div>
        </div>
    );
};

/* --- SUB-COMPONENTS --- */

const SettingsMenu: React.FC<{ onNavigate: (view: SettingsView) => void }> = ({ onNavigate }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {[
            { id: 'condo_data', title: 'Dados do Condomínio', desc: 'Nome, endereço e CNPJ.', icon: Building },
            { id: 'users', title: 'Gestão de Usuários Administrativos', desc: 'Adicionar ou remover administradores e porteiros.', icon: Users },
            { id: 'booking_rules', title: 'Regras de Reservas', desc: 'Definir horários, limites e valores.', icon: Calendar },
            { id: 'notifications', title: 'Notificações Automáticas', desc: 'Configurar e-mails e alertas do sistema.', icon: Bell },
            { id: 'logs', title: 'Logs do Sistema (Auditoria)', desc: 'Rastrear todas as alterações realizadas.', icon: History },
        ].map((item) => (
            <button 
                key={item.id}
                onClick={() => onNavigate(item.id as SettingsView)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-[#437476] group-hover:text-white transition-colors">
                        <item.icon size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-[#437476] transition-colors" />
            </button>
        ))}
    </div>
);

const LogsView: React.FC<{ onBack: () => void }> = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const getActionBadge = (action: string) => {
        switch(action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
            case 'LOGIN': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por administrador ou ação..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
                            <Filter size={16} /> Filtros Avançados
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Administrador</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Módulo</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4 text-right">Origem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_SYSTEM_LOGS.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                {log.adminName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{log.adminName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-tighter ${getActionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{log.module}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600 line-clamp-1 italic">"{log.description}"</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Monitor size={10}/> {log.ip}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exibindo os últimos 50 registros de auditoria</p>
                </div>
            </div>
        </div>
    );
};

const CondoDataView: React.FC<{ onBack: () => void, onSave: () => void, isSaving: boolean }> = ({ onSave, isSaving }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="bg-[#fcfbf9] rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-700">Informações Institucionais</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-slate-200 text-slate-600' : 'bg-[#437476] text-white'}`}
                >
                    {isEditing ? 'Cancelar Edição' : 'Editar Dados'}
                </button>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Nome do Condomínio</label>
                        <input type="text" defaultValue="Maison Heights" disabled={!isEditing} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">CNPJ</label>
                        <input type="text" defaultValue="12.345.678/0001-99" disabled={!isEditing} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Endereço Completo</label>
                        <input type="text" defaultValue="Rua das Palmeiras, 1500 - Jardim das Flores, São Paulo - SP" disabled={!isEditing} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">E-mail de Contato</label>
                        <input type="email" defaultValue="contato@maisonheights.com" disabled={!isEditing} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Telefone Portaria</label>
                        <input type="text" defaultValue="(11) 4002-8922" disabled={!isEditing} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]" />
                    </div>
                </div>
                {isEditing && (
                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={onSave}
                            className="flex items-center gap-2 px-8 py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all"
                        >
                            <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserManagementView: React.FC<{ onBack: () => void }> = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const mockUsers = [
        { id: 1, name: 'João Silva', email: 'joao@maison.com', role: 'Síndico', status: 'Ativo' },
        { id: 2, name: 'Maria Souza', email: 'maria@maison.com', role: 'Portaria', status: 'Ativo' },
        { id: 3, name: 'Ricardo Santos', email: 'ricardo@maison.com', role: 'Financeiro', status: 'Pendente' },
    ];

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'Síndico': return 'bg-yellow-100 text-yellow-700';
            case 'Financeiro': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Equipe Administrativa</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-bold hover:bg-[#365e5f] transition-all"
                    >
                        <UserPlus size={18} /> Novo Usuário
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Cargo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium ${user.status === 'Ativo' ? 'text-green-600' : 'text-amber-500'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-1.5 text-slate-400 hover:text-[#437476] rounded-md hover:bg-white transition-all"><Edit2 size={16}/></button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-700">Novo Administrador</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo</label>
                                <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">E-mail</label>
                                <input type="email" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Cargo</label>
                                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]">
                                    <option>Administrador</option>
                                    <option>Síndico</option>
                                    <option>Portaria</option>
                                    <option>Financeiro</option>
                                </select>
                            </div>
                            <div className="space-y-3 pt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Permissões de Acesso</p>
                                {['Ver Financeiro', 'Gerir Moradores', 'Publicar Avisos', 'Configurações do Sistema'].map(perm => (
                                    <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded border border-slate-300 group-hover:border-[#437476] transition-colors flex items-center justify-center">
                                            <Shield size={12} className="text-transparent group-hover:text-slate-100" />
                                        </div>
                                        <span className="text-sm text-slate-600">{perm}</span>
                                    </label>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all mt-4" onClick={() => setIsModalOpen(false)}>
                                Criar Convite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BookingRulesView: React.FC<{ onBack: () => void, onSave: () => void, isSaving: boolean }> = ({ onSave, isSaving }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>('Salão de Festas');

    const areas = [
        { name: 'Salão de Festas', icon: '🎉', price: 150.00, hours: '08:00 - 22:00', limit: 2 },
        { name: 'Churrasqueira', icon: '🔥', price: 80.00, hours: '10:00 - 22:00', limit: 4 },
        { name: 'Quadra de Tênis', icon: '🎾', price: 0, hours: '06:00 - 20:00', limit: 10 },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {areas.map(area => (
                    <div key={area.name}>
                        <button 
                            onClick={() => setOpenAccordion(openAccordion === area.name ? null : area.name)}
                            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{area.icon}</span>
                                <h3 className="font-bold text-slate-700">{area.name}</h3>
                            </div>
                            {openAccordion === area.name ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        {openAccordion === area.name && (
                            <div className="p-8 bg-[#fcfbf9] border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><DollarSign size={12}/> Valor da Reserva</label>
                                        <input type="number" defaultValue={area.price} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Clock size={12}/> Horário Permitido</label>
                                        <input type="text" defaultValue={area.hours} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Info size={12}/> Limite / Mês</label>
                                        <input type="number" defaultValue={area.limit} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]" />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 shadow-inner">
                                                <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">Disponível</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={onSave}
                    className="flex items-center gap-2 px-8 py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all shadow-sm"
                >
                    <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Regras'}
                </button>
            </div>
        </div>
    );
};

const NotificationConfigView: React.FC<{ onBack: () => void, onSave: () => void, isSaving: boolean }> = ({ onSave, isSaving }) => {
    const events = [
        { id: 1, label: 'Nova reserva criada', email: true, app: true },
        { id: 2, label: 'Intercorrência resolvida', email: false, app: true },
        { id: 3, label: 'Novo aviso publicado', email: true, app: true },
        { id: 4, label: 'Confirmação de pagamento', email: true, app: false },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Automação de Alertas</h3>
                </div>
                <div className="p-6 divide-y divide-slate-100">
                    {events.map(event => (
                        <div key={event.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h4 className="font-bold text-slate-700">{event.label}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Define como o morador será notificado.</p>
                            </div>
                            <div className="flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${event.email ? 'bg-indigo-50 border-indigo-500 text-indigo-500' : 'bg-white border-slate-200'}`}>
                                        <Mail size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">E-mail</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${event.app ? 'bg-emerald-50 border-emerald-500 text-emerald-500' : 'bg-white border-slate-200'}`}>
                                        <Smartphone size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Sistema</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex gap-4">
                <Info className="text-amber-500 flex-shrink-0" size={20} />
                <div className="text-xs text-amber-800 leading-relaxed">
                    <strong>Preview:</strong> Moradores recebem as notificações em tempo real. Você pode personalizar os templates de e-mail na aba "Modelos de Mensagem" (vire brevemente).
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={onSave}
                    className="flex items-center gap-2 px-8 py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all shadow-sm"
                >
                    <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                </button>
            </div>
        </div>
    );
};
