import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Search, Filter, UserPlus, Edit2, User as UserIcon, Mail, Phone, Building, Calendar, Cat, X, Trash2, PlusCircle, Eye, MoreHorizontal
} from 'lucide-react';
import { UserService, UnitService, User, Unit } from '../../services/userService';

export const AdminResidents: React.FC = () => {
    const { user } = useAuth();
    const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
    const [residentForm, setResidentForm] = useState({
        name: '',
        email: '',
        phone: '',
        block: '',
        unit: '',
        entryDate: '2025-12-17',
        exitDate: '',
        registeredBy: user?.name || 'Admin',
        profile_type: 'INQUILINO', // Default to Tenant
        role: 'RESIDENTE',
        password: '' // Add password to state
    });

    const [residents, setResidents] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingResident, setViewingResident] = useState<User | null>(null);

    // Filters
    const [filterType, setFilterType] = useState<string>(''); // '' = Todos
    const [filterBlock, setFilterBlock] = useState<string>(''); // '' = Todos
    const [showInactive, setShowInactive] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');

    const uniqueBlocks = React.useMemo(() => {
        return Array.from(new Set(units.map(u => u.block).filter(Boolean))).sort();
    }, [units]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, unitsData] = await Promise.all([
                UserService.getAll(),
                UnitService.getAll()
            ]);
            setResidents(usersData);
            setUnits(unitsData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const getUnitName = (unitId?: string) => {
        if (!unitId) return '-';
        const unit = units.find(u => u.id === unitId);
        return unit ? `${unit.block ? 'Bloco ' + unit.block + ' - ' : ''}${unit.number}` : '-';
    };

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatDate = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    const formatDateToISO = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) return dateStr;
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    const resetForm = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        setResidentForm({
            name: '',
            email: '',
            phone: '',
            block: '',
            unit: '',
            entryDate: `${dd}/${mm}/${yyyy}`,
            exitDate: '',
            registeredBy: user?.name || 'Admin',
            profile_type: 'INQUILINO',
            role: 'RESIDENTE',
            password: ''
        });
        setEditingId(null);
    };

    const handleEdit = (resident: User) => {
        const targetUnitId = resident.unit_id || resident.unit?.id;
        const unit = units.find(u => u.id === targetUnitId);
        setResidentForm({
            name: resident.name,
            email: resident.email,
            phone: resident.phone ? formatPhoneNumber(resident.phone) : '',
            block: unit?.block || '',
            unit: unit?.number || '',
            entryDate: '01/01/2025',
            exitDate: '',
            registeredBy: user?.name || 'Admin',
            profile_type: resident.profile_type || 'INQUILINO',
            role: resident.role || 'RESIDENTE',
            password: ''
        });
        setEditingId(resident.id);
        setIsAddResidentModalOpen(true);
    };

    const handleDetails = (resident: User) => {
        setViewingResident(resident);
    };

    const handleSaveResident = async () => {
        try {
            const blockInput = residentForm.block.trim();
            const numberInput = residentForm.unit.trim();

            const targetUnit = units.find(u =>
                (u.block || "").trim() === blockInput &&
                u.number.trim() === numberInput
            );

            if (!targetUnit) {
                alert(`Unidade não encontrada!`);
                return;
            }

            const payload = {
                name: residentForm.name,
                email: residentForm.email,
                phone: residentForm.phone,
                role: residentForm.role || 'RESIDENTE',
                profile_type: residentForm.profile_type,
                unit_id: targetUnit?.id,
                entry_date: formatDateToISO(residentForm.entryDate),
                exit_date: residentForm.exitDate ? formatDateToISO(residentForm.exitDate) : null,
                ...(editingId ? (residentForm.password ? { password: residentForm.password } : {}) : (residentForm.password ? { password: residentForm.password } : {})),
            };

            if (editingId) {
                await UserService.update(editingId, payload);
                alert('Morador atualizado com sucesso!');
            } else {
                await UserService.create(payload);
                alert('Morador cadastrado com sucesso!');
            }

            setIsAddResidentModalOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            const msg = error.response?.data?.detail
                ? (typeof error.response.data.detail === 'object' ? JSON.stringify(error.response.data.detail) : error.response.data.detail)
                : (editingId ? 'Erro ao atualizar morador' : 'Erro ao cadastrar morador');
            alert(msg);
            console.error(error);
        }
    };

    const canEdit = ['ADMIN', 'SINDICO', 'SUBSINDICO', 'FINANCEIRO'].includes(user?.role || '');

    // Common Logic for Role/Type Display
    const getRoleDisplay = (res: User) => {
        const type = res.profile_type || res.role;
        const map: Record<string, string> = {
            'ADMIN': 'Administrador',
            'RESIDENT': 'Morador',
            'RESIDENTE': 'Morador',
            'PORTER': 'Porteiro',
            'PORTEIRO': 'Porteiro',
            'FINANCIAL': 'Financeiro',
            'FINANCEIRO': 'Financeiro',
            'SINDICO': 'Síndico',
            'SUBSINDICO': 'Subsíndico',
            'CONSELHO': 'Conselho Fiscal',
            'OWNER': 'Proprietário',
            'PROPRIETARIO': 'Proprietário',
            'TENANT': 'Inquilino',
            'INQUILINO': 'Inquilino',
            'STAFF': 'Funcionário'
        };
        return map[type] || type;
    };

    const filteredResidents = residents.filter(res => {
        // Default Filter: Hide Inactive
        if (!showInactive && res.status === 'INATIVO') {
            return false;
        }

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const unit = units.find(u => u.id === res.unit_id);
            const unitName = unit ? `${unit.block ? unit.block + ' ' : ''}${unit.number}` : '';

            const matchName = res.name.toLowerCase().includes(lowerTerm);
            const matchUnit = unitName.toLowerCase().includes(lowerTerm);
            const matchEmail = res.email.toLowerCase().includes(lowerTerm);

            if (!matchName && !matchUnit && !matchEmail) return false;
        }

        // Block Filter
        if (filterBlock) {
            const unit = units.find(u => u.id === res.unit_id);
            if (unit?.block !== filterBlock) return false;
        }

        // Type Filter
        if (filterType) {
            const type = res.profile_type || 'INQUILINO'; // Default fallback
            if (type !== filterType) return false;
        }

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Responsivo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Moradores</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os moradores e unidades.</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => { resetForm(); setIsAddResidentModalOpen(true); }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f] transition-all shadow-sm active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Novo Morador</span>
                    </button>
                )}
            </div>

            {/* Filtros Responsivos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, unidade ou email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]/20 transition-all text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 md:border-transparent md:bg-transparent">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="w-4 h-4 text-[#437476] rounded border-slate-300 focus:ring-[#437476]"
                        />
                        Mostrar Inativos
                    </label>

                    <select
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]/20 text-slate-600 cursor-pointer w-full md:w-auto"
                        value={filterBlock}
                        onChange={(e) => setFilterBlock(e.target.value)}
                    >
                        <option value="">Todos os Blocos</option>
                        {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>

                    <select
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]/20 text-slate-600 cursor-pointer w-full md:w-auto"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Todos os Tipos</option>
                        <option value="PROPRIETARIO">Proprietário</option>
                        <option value="INQUILINO">Inquilino</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Morador</th>
                            <th className="px-6 py-4">Unidade</th>
                            <th className="px-6 py-4">Contato</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">Carregando...</td></tr> :
                            filteredResidents.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum morador encontrado.</td></tr> :
                                filteredResidents.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm">
                                                {res.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{res.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{getUnitName(res.unit_id)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs space-y-0.5">
                                                <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {res.email}</span>
                                                <span className="flex items-center gap-1.5 text-slate-500"><Phone size={12} className="text-slate-400" /> {res.phone || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                                                {getRoleDisplay(res)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${res.status === 'ATIVO' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {res.status === 'ATIVO' ? 'Ativo' : res.status === 'PENDENTE' ? 'Pendente' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleDetails(res)}
                                                    className="p-1.5 text-slate-400 hover:text-[#437476] hover:bg-[#437476]/10 rounded-lg transition-all"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {canEdit && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(res)}
                                                            className="p-1.5 text-slate-400 hover:text-[#437476] hover:bg-[#437476]/10 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Tem certeza que deseja excluir o morador ${res.name}?`)) {
                                                                    try {
                                                                        await UserService.delete(res.id);
                                                                        alert('Morador excluído (desativado) com sucesso!');
                                                                        loadData();
                                                                    } catch (error: any) {
                                                                        alert(error.response?.data?.detail || "Erro ao excluir morador.");
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? <div className="text-center p-8 text-slate-400">Carregando...</div> :
                    filteredResidents.length === 0 ? <div className="text-center p-8 text-slate-400">Nenhum morador encontrado.</div> :
                        filteredResidents.map(res => (
                            <div key={res.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all active:scale-[0.99]">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shadow-sm">
                                            {res.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{res.name}</h3>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${res.status === 'ATIVO' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {res.status === 'ATIVO' ? 'Ativo' : res.status}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Menu de Ações Mobile (Opcional, ou botões abaixo) */}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Unidade</p>
                                        <p className="font-bold text-slate-700 text-sm">{getUnitName(res.unit_id)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Perfil</p>
                                        <p className="font-bold text-slate-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap">{getRoleDisplay(res)}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 mb-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{res.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400 shrink-0" />
                                        <span>{res.phone || 'Sem telefone'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleDetails(res)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold active:bg-slate-100 hover:bg-slate-100 transition-colors"
                                    >
                                        <Eye size={16} /> Detalhes
                                    </button>
                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(res)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#437476]/10 text-[#437476] rounded-lg text-sm font-bold active:bg-[#437476]/20 hover:bg-[#437476]/20 transition-colors"
                                            >
                                                <Edit2 size={16} /> Editar
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Excluir ${res.name}?`)) {
                                                        try {
                                                            await UserService.delete(res.id);
                                                            alert('Excluído.');
                                                            loadData();
                                                        } catch (e) { alert('Erro ao excluir.'); }
                                                    }
                                                }}
                                                className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg active:bg-red-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                }
            </div>

            {isAddResidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-700">{editingId ? 'Editar Morador' : 'Novo Morador'}</h3>
                                <p className="text-xs md:text-sm text-slate-500 mt-0.5">{editingId ? 'Atualize as informações.' : 'Preencha os detalhes.'}</p>
                            </div>
                            <button
                                onClick={() => setIsAddResidentModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-6 md:px-8 overflow-y-auto custom-scrollbar bg-[#fcfbf9] flex-1">
                            <div className="space-y-5">
                                {/* Nome Completo */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo</label>
                                    <div className="relative">
                                        <UserIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Nome do proprietário"
                                            className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                            value={residentForm.name}
                                            onChange={e => setResidentForm({ ...residentForm, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Linha: Email | Senha Inicial */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">E-mail</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                            <input
                                                type="email"
                                                placeholder="email@exemplo.com"
                                                className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                                value={residentForm.email}
                                                onChange={e => setResidentForm({ ...residentForm, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">
                                            {editingId ? 'Redefinir Senha' : 'Senha Inicial'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={editingId ? "Deixe em branco para manter" : "Padrão: Mudar@123"}
                                                className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                                value={residentForm.password}
                                                onChange={e => setResidentForm({ ...residentForm, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Linha: Tipo de Perfil */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Perfil</label>
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1 justify-center md:flex-none md:justify-start">
                                            <input
                                                type="radio"
                                                name="profileType"
                                                value="INQUILINO"
                                                checked={residentForm.profile_type === 'INQUILINO'}
                                                onChange={e => setResidentForm({ ...residentForm, profile_type: e.target.value })}
                                                className="w-4 h-4 text-[#437476] focus:ring-[#437476]"
                                            />
                                            <span className="text-sm text-slate-700 font-medium">Inquilino</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1 justify-center md:flex-none md:justify-start">
                                            <input
                                                type="radio"
                                                name="profileType"
                                                value="PROPRIETARIO"
                                                checked={residentForm.profile_type === 'PROPRIETARIO'}
                                                onChange={e => setResidentForm({ ...residentForm, profile_type: e.target.value })}
                                                className="w-4 h-4 text-[#437476] focus:ring-[#437476]"
                                            />
                                            <span className="text-sm text-slate-700 font-medium">Proprietário</span>
                                        </label>
                                    </div>

                                    {/* Role Selector (Only for Admin/Manager) */}
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Cargo no Sistema</label>
                                    <select
                                        className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none"
                                        value={residentForm.role || 'RESIDENTE'}
                                        onChange={e => setResidentForm({ ...residentForm, role: e.target.value })}
                                    >
                                        <option value="RESIDENTE">Morador (Padrão)</option>
                                        <option value="SINDICO">Síndico</option>
                                        <option value="SUBSINDICO">Subsíndico</option>
                                        <option value="CONSELHO">Conselho Fiscal</option>
                                        <option value="PORTEIRO">Porteiro</option>
                                        <option value="FINANCEIRO">Financeiro</option>
                                    </select>
                                </div>

                                {/* Linha: Telefone | Bloco | Unidade */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Telefone</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                            <input
                                                type="tel"
                                                placeholder="(99) 99999-9999"
                                                maxLength={15}
                                                className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                                value={residentForm.phone}
                                                onChange={e => setResidentForm({ ...residentForm, phone: formatPhoneNumber(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    {/* Calculated Lists */}
                                    {(() => {
                                        // 3. Filter Units for Selected Block (Available Only OR Current User's Unit)
                                        const availableUnitsForBlock = units
                                            .filter(u => u.block === residentForm.block)
                                            .sort((a, b) => {
                                                const numA = parseInt(a.number.replace(/\D/g, '')) || 0;
                                                const numB = parseInt(b.number.replace(/\D/g, '')) || 0;
                                                return numA - numB;
                                            });

                                        return (
                                            <>
                                                <div className="col-span-1">
                                                    <label className="block text-sm font-bold text-slate-600 mb-2">Bloco</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none"
                                                            value={residentForm.block}
                                                            onChange={e => setResidentForm({ ...residentForm, block: e.target.value, unit: '' })}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {uniqueBlocks.map(block => (
                                                                <option key={block} value={block || ''}>{block}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                                            <Building size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-sm font-bold text-slate-600 mb-2">Nº da Unidade</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none"
                                                            value={residentForm.unit}
                                                            onChange={e => setResidentForm({ ...residentForm, unit: e.target.value })}
                                                            disabled={!residentForm.block}
                                                        >
                                                            <option value="">{residentForm.block ? 'Selecione a Unidade...' : 'Selecione o Bloco'}</option>
                                                            {availableUnitsForBlock.map(u => (
                                                                <option key={u.id} value={u.number}>{u.number}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                                            <Building size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Linha: Datas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Data de Entrada</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="DD/MM/AAAA"
                                                maxLength={10}
                                                value={residentForm.entryDate}
                                                onChange={e => setResidentForm({ ...residentForm, entryDate: formatDate(e.target.value) })}
                                                className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700"
                                            />
                                            <Calendar size={18} className="absolute right-3 top-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Data de Saída (Opcional)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="DD/MM/AAAA"
                                                maxLength={10}
                                                value={residentForm.exitDate}
                                                onChange={e => setResidentForm({ ...residentForm, exitDate: formatDate(e.target.value) })}
                                                className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 placeholder-slate-400"
                                            />
                                            <Calendar size={18} className="absolute right-3 top-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Cadastrado Por (Readonly) */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Cadastrado por</label>
                                    <div className="relative">
                                        <UserIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full pl-10 pr-4 py-3 bg-[#e8eaed] border border-slate-200 rounded-lg text-sm outline-none text-slate-600 uppercase font-medium cursor-not-allowed"
                                            value={residentForm.registeredBy}
                                        />
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-[#437476] text-white font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors text-base" onClick={handleSaveResident}>
                                    {editingId ? 'Atualizar Morador' : 'Salvar Morador'}
                                </button>
                                <div className="h-4 md:hidden"></div> {/* Extra space for mobile scroll */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingResident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">Detalhes do Morador</h3>
                                <p className="text-xs text-slate-500">Visualização completa das informações.</p>
                            </div>
                            <button
                                onClick={() => setViewingResident(null)}
                                className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 p-1.5 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[#437476]/10 flex items-center justify-center text-[#437476] text-2xl font-bold">
                                    {viewingResident.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{viewingResident.name}</h2>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {viewingResident.status === 'ATIVO' ? 'Ativo' : viewingResident.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                    <p className="text-sm font-medium text-slate-700">{viewingResident.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade</label>
                                    <p className="text-sm font-medium text-slate-700">{getUnitName(viewingResident.unit_id)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                                    <p className="text-sm font-medium text-slate-700">{viewingResident.profile_type || viewingResident.role}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data de Cadastro</label>
                                    <p className="text-sm font-medium text-slate-700">{new Date(viewingResident.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            {viewingResident.pets && viewingResident.pets.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <Cat size={16} /> Animais de Estimação
                                    </h4>
                                    <ul className="space-y-2">
                                        {viewingResident.pets.map((pet, idx) => (
                                            <li key={idx} className="text-sm text-slate-600 flex justify-between border-b last:border-0 border-slate-200 pb-2 last:pb-0">
                                                <span>{pet.type}</span>
                                                <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{pet.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setViewingResident(null)}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};