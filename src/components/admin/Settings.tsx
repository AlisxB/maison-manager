
import React, { useState, useEffect } from 'react';
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
    Plus,
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
    Monitor,
    AlertTriangle
} from 'lucide-react';


import { AdminUnits } from './Units';
import { AdminInventory } from './Inventory';
import { Package } from 'lucide-react';

import { CondominiumService, CondominiumUpdate } from '../../services/condominiumService';
import { UserService, User } from '../../services/userService';
import { CommonAreaService, CommonArea } from '../../services/commonAreaService';
import { AuditService, AuditLog } from '../../services/auditService';
import { BylawService, Bylaw } from '../../services/bylawService';
import { Book, FileText } from 'lucide-react';

type SettingsView = 'menu' | 'condo_data' | 'users' | 'booking_rules' | 'notifications' | 'logs' | 'units' | 'inventory' | 'bylaws';

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
            case 'units': return <div className="pt-4"><AdminUnits /></div>;
            case 'inventory': return <div className="pt-4"><AdminInventory /></div>;
            case 'bylaws': return <BylawsView onBack={() => setCurrentSubView('menu')} />;
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
                        {currentSubView === 'units' && 'Cadastro e listagem de blocos e unidades.'}
                        {currentSubView === 'bylaws' && 'Regras e regimentos internos do condomínio.'}
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

import { useAuth } from '../../context/AuthContext';

function SettingsMenu({ onNavigate }: { onNavigate: (view: SettingsView) => void }) {
    const { user } = useAuth();
    const userRole = user?.role || 'RESIDENTE';

    const menuItems = [
        { id: 'condo_data', title: 'Dados do Condomínio', desc: 'Nome, endereço e CNPJ.', icon: Building, allowedRoles: ['ADMIN'] },
        { id: 'units', title: 'Gestão de Unidades', desc: 'Gerenciar blocos, unidades e criar lotes.', icon: Building, allowedRoles: ['ADMIN', 'SINDICO'] },
        { id: 'inventory', title: 'Gestão de Estoque', desc: 'Controle de suprimentos e materiais.', icon: Package, allowedRoles: ['ADMIN', 'SINDICO'] },
        { id: 'users', title: 'Gestão de Usuários Administrativos', desc: 'Adicionar ou remover administradores e porteiros.', icon: Users, allowedRoles: ['ADMIN'] },
        { id: 'booking_rules', title: 'Regras de Reservas', desc: 'Definir horários, limites e valores.', icon: Calendar, allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO'] },
        { id: 'bylaws', title: 'Regimentos Internos', desc: 'Normas, convenções e multas.', icon: Book, allowedRoles: ['ADMIN', 'SINDICO', 'CONSELHO'] },
        { id: 'notifications', title: 'Notificações Automáticas', desc: 'Configurar e-mails e alertas do sistema.', icon: Bell, allowedRoles: ['ADMIN', 'SINDICO'] },
        { id: 'logs', title: 'Logs do Sistema (Auditoria)', desc: 'Rastrear todas as alterações realizadas.', icon: History, allowedRoles: ['ADMIN', 'SINDICO'] },
    ];

    const allowedItems = menuItems.filter(item => item.allowedRoles.includes(userRole));

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {allowedItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Você não tem permissão para acessar nenhuma configuração.</div>
            ) : allowedItems.map((item) => (
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
}

function LogsView({ onBack }: { onBack: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await AuditService.getLogs();
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTableName = (table: string) => {
        const map: Record<string, string> = {
            'users': 'Usuários / Equipe',
            'common_areas': 'Áreas Comuns',
            'reservations': 'Reservas',
            'readings_water': 'Leitura de Água',
            'readings_gas': 'Leitura de Gás',
            'readings_electricity': 'Leitura de Energia',
            'transactions': 'Financeiro',
            'inventory_items': 'Estoque',
            'condominiums': 'Condomínio',
            'vehicles': 'Veículos',
            'pets': 'Pets',
            'bylaws': 'Regimentos'
        };
        return map[table] || table;
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Criação</span>;
            case 'UPDATE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Edição</span>;
            case 'DELETE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">Exclusão</span>;
            case 'LOGIN': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Login</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{action}</span>;
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
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Administrador</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Módulo</th>
                                <th className="px-6 py-4">Recurso ID</th>
                                <th className="px-6 py-4 text-right">Origem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-6 text-center text-slate-400">Carregando logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="p-6 text-center text-slate-400">Nenhum log encontrado.</td></tr>
                            ) : (
                                logs.filter(l => !searchTerm || l.action.includes(searchTerm.toUpperCase()) || l.actor_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-slate-400 font-mono text-[11px]">
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                    {(log.actor_name || '?').charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700">{log.actor_name || 'Sistema'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                {getTableName(log.table_name)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-600 line-clamp-1 italic font-mono">{log.record_id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Monitor size={10} /> {log.ip_address || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exibindo os últimos {logs.length} registros de auditoria</p>
                </div>
            </div>
        </div>
    );
}

import { useCondominium } from '../../context/CondominiumContext';

function CondoDataView({ onBack, onSave, isSaving }: { onBack: () => void, onSave: () => void, isSaving: boolean }) {
    const { refreshCondo } = useCondominium();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CondominiumUpdate>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await CondominiumService.getMe();
            setFormData({
                name: data.name,
                sidebar_title: data.sidebar_title,
                login_title: data.login_title,
                address: data.address,
                contact_email: data.contact_email,
                gate_phone: data.gate_phone
            });
        } catch (error) {
            console.error("Error loading condo data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLocal = async () => {
        try {
            await CondominiumService.updateMe(formData);
            await refreshCondo(); // Update global context immediately
            onSave();
            setIsEditing(false);
        } catch (error) {
            alert("Erro ao salvar dados");
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando dados...</div>;

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
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Condomínio</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all"
                            value={formData.name || ''}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Título na Sidebar</label>
                            <input
                                type="text"
                                placeholder="Ex: Maison Manager"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all"
                                value={formData.sidebar_title || ''}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, sidebar_title: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400">Exibido no menu lateral esquerdo.</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Título no Login</label>
                            <input
                                type="text"
                                placeholder="Ex: Maison Manager"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all"
                                value={formData.login_title || ''}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, login_title: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400">Exibido na tela de autenticação.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">CNPJ (Criptografado)</label>
                        <input type="text" value={"**Criptografado pelo Sistema**"} disabled={true} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Endereço Completo</label>
                        <input
                            type="text"
                            value={formData.address || ''}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">E-mail de Contato</label>
                        <input
                            type="email"
                            value={formData.contact_email || ''}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Telefone Portaria</label>
                        <input
                            type="text"
                            value={formData.gate_phone || ''}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, gate_phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]"
                        />
                    </div>
                </div>
                {isEditing && (
                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveLocal}
                            className="flex items-center gap-2 px-8 py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all"
                        >
                            <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserManagementView({ onBack }: { onBack: () => void }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PORTEIRO', profile_type: 'STAFF' });

    // Master Admin ID (hardcoded for protection in Frontend too)
    const MASTER_ADMIN_ID = "22222222-2222-2222-2222-222222222222";

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await UserService.getAll();
            // Filter out residents, show only admin staff
            setUsers(data.filter(u => u.role !== 'RESIDENTE'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({ name: '', email: '', password: '', role: 'PORTEIRO', profile_type: 'STAFF' });
        setIsEditing(false);
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show password
            role: user.role,
            profile_type: user.profile_type
        });
        setIsEditing(true);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedUser) {
                await UserService.update(selectedUser.id, {
                    ...formData,
                    password: formData.password || undefined // Only send if changed
                });
                alert('Usuário atualizado!');
            } else {
                if (!isAdmin) {
                    alert('Apenas administradores podem criar novos usuários.');
                    return;
                }
                await UserService.create({
                    ...formData,
                    status: 'ATIVO'
                });
                alert('Usuário criado!');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar usuário.');
        }
    };

    const handleDelete = async (user: User) => {
        if (!isAdmin) return;

        if (user.id === MASTER_ADMIN_ID) {
            alert("O Administrador Master não pode ser excluído.");
            return;
        }
        if (!confirm(`Tem certeza que deseja remover ${user.name}?`)) return;

        try {
            await UserService.delete(user.id);
            fetchUsers();
            alert("Usuário removido.");
        } catch (error) {
            alert("Erro ao remover usuário.");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-yellow-100 text-yellow-700';
            case 'PORTEIRO': return 'bg-blue-100 text-blue-700';
            case 'FINANCEIRO': return 'bg-emerald-100 text-emerald-700';
            case 'SINDICO': return 'bg-purple-100 text-purple-700';
            case 'SUBSINDICO': return 'bg-purple-50 text-purple-600';
            case 'CONSELHO': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Administrador';
            case 'PORTEIRO': return 'Porteiro';
            case 'FINANCEIRO': return 'Financeiro';
            case 'SINDICO': return 'Síndico';
            case 'SUBSINDICO': return 'Subsíndico';
            case 'CONSELHO': return 'Conselho Fiscal';
            default: return role;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Equipe Administrativa</h3>
                    {isAdmin && (
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-bold hover:bg-[#365e5f] transition-all"
                        >
                            <UserPlus size={18} /> Novo Colaborador
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Colaborador</th>
                                <th className="px-6 py-4">Cargo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-6 text-center text-slate-400">Carregando equipe...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-slate-400">Nenhum colaborador encontrado.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">
                                                        {user.name}
                                                        {user.id === MASTER_ADMIN_ID && <span className="ml-2 text-[9px] bg-black text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Master</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadge(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium ${user.status === 'ATIVO' ? 'text-green-600' : 'text-amber-500'}`}>
                                                {user.status === 'ATIVO' ? 'Ativo' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(user)} className="p-1.5 text-slate-400 hover:text-[#437476] rounded-md hover:bg-white transition-all"><Edit2 size={16} /></button>
                                                {user.id !== MASTER_ADMIN_ID && isAdmin && (
                                                    <button onClick={() => handleDelete(user)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white transition-all"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">{isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                                <input required className="w-full p-2 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#437476]/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">E-mail Corporativo</label>
                                <input required type="email" className="w-full p-2 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#437476]/20" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Senha {isEditing && '(Deixe em branco para manter)'}</label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    className="w-full p-2 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#437476]/20"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditing ? '******' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Cargo / Função</label>
                                <select className="w-full p-2 border border-slate-200 rounded-lg mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#437476]/20" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="PORTEIRO">Porteiro / Segurança</option>
                                    <option value="FINANCEIRO">Financeiro</option>
                                    <option value="SINDICO">Síndico</option>
                                    <option value="SUBSINDICO">Subsíndico</option>
                                    <option value="CONSELHO">Conselho Fiscal</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-[#437476] text-white rounded-lg font-bold hover:bg-[#365e5f] transition-all">
                                    {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function BookingRulesView({ onBack, onSave, isSaving }: { onBack: () => void, onSave: () => void, isSaving: boolean }) {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [areas, setAreas] = useState<CommonArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newArea, setNewArea] = useState({ name: '', capacity: 10, price_per_hour: 0 });

    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            const data = await CommonAreaService.getAll();
            setAreas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateArea = async (id: string, updates: Partial<CommonArea>) => {
        try {
            await CommonAreaService.update(id, updates);
            setAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a));
        } catch (error) {
            alert('Erro ao atualizar regra');
        }
    };

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CommonAreaService.create(newArea);
            setShowAddModal(false);
            setNewArea({ name: '', capacity: 10, price_per_hour: 0 });
            loadAreas();
        } catch (error) {
            alert('Erro ao criar área');
        }
    };

    const handleDeleteArea = async (id: string) => {
        if (!confirm('Tem certeza? Isso pode afetar reservas existentes.')) return;
        try {
            await CommonAreaService.delete(id);
            loadAreas();
        } catch (error) {
            alert('Erro ao excluir área');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando áreas...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all"
                >
                    <Plus size={18} /> Nova Área Comum
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {areas.length === 0 && <div className="p-8 text-center text-slate-400">Nenhuma área comum cadastrada.</div>}

                {areas.map(area => (
                    <div key={area.id}>
                        <button
                            onClick={() => setOpenAccordion(openAccordion === area.id ? null : area.id)}
                            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">🎉</span>
                                <h3 className="font-bold text-slate-700">{area.name}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${area.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {area.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                                {openAccordion === area.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                        </button>
                        {openAccordion === area.id && (
                            <div className="p-8 bg-[#fcfbf9] border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><DollarSign size={12} /> Valor / Hora</label>
                                        <input
                                            type="number"
                                            value={area.price_per_hour}
                                            onChange={(e) => handleUpdateArea(area.id, { price_per_hour: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Users size={12} /> Capacidade</label>
                                        <input
                                            type="number"
                                            value={area.capacity}
                                            onChange={(e) => handleUpdateArea(area.id, { capacity: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Info size={12} /> Limite / Mês</label>
                                        <input
                                            type="number"
                                            value={area.monthly_limit_per_unit}
                                            onChange={(e) => handleUpdateArea(area.id, { monthly_limit_per_unit: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#437476]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 justify-end">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div
                                                onClick={() => handleUpdateArea(area.id, { is_active: !area.is_active })}
                                                className={`w-12 h-6 rounded-full relative p-1 shadow-inner transition-colors ${area.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${area.is_active ? 'translate-x-6' : ''}`}></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">Disponível</span>
                                        </label>
                                        <button
                                            onClick={() => handleDeleteArea(area.id)}
                                            className="text-xs text-red-400 hover:text-red-600 font-bold self-start mt-2 flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Excluir Área
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">Nova Área Comum</h3>
                        <form onSubmit={handleCreateArea} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400">Nome</label>
                                <input required className="w-full p-2 border rounded-lg" value={newArea.name} onChange={e => setNewArea({ ...newArea, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400">Capacidade</label>
                                <input required type="number" className="w-full p-2 border rounded-lg" value={newArea.capacity} onChange={e => setNewArea({ ...newArea, capacity: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400">Preço / Hora</label>
                                <input required type="number" className="w-full p-2 border rounded-lg" value={newArea.price_per_hour} onChange={e => setNewArea({ ...newArea, price_per_hour: parseFloat(e.target.value) })} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-600 font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-[#437476] text-white rounded-lg font-bold">Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function NotificationConfigView({ onBack, onSave, isSaving }: { onBack: () => void, onSave: () => void, isSaving: boolean }) {
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
}

function BylawsView({ onBack }: { onBack: () => void }) {
    const [bylaws, setBylaws] = useState<Bylaw[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Bylaw>>({ title: '', description: '', category: 'Norma' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadBylaws();
    }, []);

    const loadBylaws = async () => {
        try {
            const data = await BylawService.getAll();
            setBylaws(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({ title: '', description: '', category: 'Norma' });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleOpenEdit = (bylaw: Bylaw) => {
        setFormData(bylaw);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && formData.id) {
                await BylawService.update(formData.id, formData);
            } else {
                await BylawService.create(formData);
            }
            setShowModal(false);
            loadBylaws();
        } catch (error) {
            alert('Erro ao salvar regimento');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            await BylawService.delete(id);
            loadBylaws();
        } catch (error) {
            alert('Erro ao excluir regimento');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all"
                >
                    <Plus size={18} /> Novo Regimento
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Regimentos e Normas</h3>
                    <p className="text-xs text-slate-500 mt-1">Defina as regras que serão base para o módulo de infrações.</p>
                </div>
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Carregando regimentos...</div>
                    ) : bylaws.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Nenhum regimento cadastrado.</div>
                    ) : (
                        bylaws.map(bylaw => (
                            <div key={bylaw.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-slate-400" />
                                        <h4 className="font-bold text-slate-800">{bylaw.title}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${bylaw.category === 'Multa' ? 'bg-red-100 text-red-700' :
                                            bylaw.category === 'Aviso' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {bylaw.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 pl-8">{bylaw.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEdit(bylaw)} className="p-2 text-slate-400 hover:text-[#437476] hover:bg-white rounded-lg transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(bylaw.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">{isEditing ? 'Editar Regimento' : 'Novo Regimento'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                                <input required className="w-full p-2 border rounded-lg mt-1" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Lei do Silêncio" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Categoria</label>
                                <select className="w-full p-2 border rounded-lg mt-1 bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Multa">Infração / Multa</option>
                                    <option value="Aviso">Aviso / Comunicado</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Descrição Completa</label>
                                <textarea required className="w-full p-2 border rounded-lg mt-1 h-32" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva os detalhes da regra..." />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-[#437476] text-white rounded-lg font-bold hover:bg-[#365e5f] transition-all">
                                    {isEditing ? 'Salvar' : 'Criar Regimento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}