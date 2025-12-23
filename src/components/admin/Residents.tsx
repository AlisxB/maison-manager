import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Search, Filter, UserPlus, Edit2, User as UserIcon, Mail, Phone, Building, Calendar, Cat, X, Trash2, PlusCircle, Eye
} from 'lucide-react';
import { MOCK_RESIDENTS } from '../../mock'; // Removido
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
        hasPets: false,
        petsList: [{ quantity: 1, type: '' }],
        password: '' // Add password to state
    });

    const [residents, setResidents] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingResident, setViewingResident] = useState<User | null>(null);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, unitsData] = await Promise.all([
                UserService.getAll({ status: 'ATIVO' }),
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

    const getUnitName = (unitId?: string) => {
        if (!unitId) return '-';
        const unit = units.find(u => u.id === unitId);
        return unit ? `${unit.block ? 'Bloco ' + unit.block + ' - ' : ''}${unit.number}` : '-';
    };

    const resetForm = () => {
        setResidentForm({
            name: '',
            email: '',
            phone: '',
            block: '',
            unit: '',
            entryDate: new Date().toISOString().split('T')[0],
            exitDate: '',
            registeredBy: user?.name || 'Admin',
            hasPets: false,
            petsList: [{ quantity: 1, type: '' }],
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
            phone: resident.phone || '',
            block: unit?.block || '',
            unit: unit?.number || '',
            entryDate: '2025-01-01', // Mock or fetch actual
            exitDate: '',
            registeredBy: user?.name || 'Admin',
            hasPets: resident.pets && resident.pets.length > 0,
            petsList: resident.pets && resident.pets.length > 0 ? resident.pets.map(p => ({ quantity: 1, type: p.type })) : [{ quantity: 1, type: '' }],
            password: '' // Don't fill password on edit
        });
        setEditingId(resident.id);
        setIsAddResidentModalOpen(true);
    };

    const handleDetails = (resident: User) => {
        setViewingResident(resident);
    };

    const handleSaveResident = async () => {
        try {
            // Encontrar ID da unidade baseada na seleção
            // Nota: O backend espera unit_id. O front atualmente tem selects separados para Bloco e Unidade.
            // Precisamos encontrar a unidade correta ou criar.
            // Simplificação MVP: Se a unidade não existir no array 'units' carregado, não enviamos unit_id por enquanto
            // ou assumimos que o usuário selecionou algo válido que mapeamos.

            // Vamos achar a unit no array carregado que bate com block e number
            // Normalizar inputs
            const blockInput = residentForm.block.trim();
            const numberInput = residentForm.unit.trim();

            console.log("Searching for Unit:", { block: blockInput, number: numberInput });
            console.log("Available Units:", units);

            const targetUnit = units.find(u =>
                (u.block || "").trim() === blockInput &&
                u.number.trim() === numberInput
            );

            if (!targetUnit) {
                alert(`DEBUG: Unidade não encontrada!\nInput: Bloco='${blockInput}', Num='${numberInput}'\nTotal Units Loaded: ${units.length}`);
                console.error("Units:", units);
                return;
            } else {
                // alert(`DEBUG: Unidade Encontrada: ID=${targetUnit.id}`);
            }

            const payload = {
                name: residentForm.name,
                email: residentForm.email,
                phone: residentForm.phone,
                role: 'RESIDENTE',
                profile_type: 'INQUILINO', // Default
                unit_id: targetUnit?.id,
                // Only send password if editing and non-empty, or creating (default applied in backend if missing but safer here)
                ...(editingId ? (residentForm.password ? { password: residentForm.password } : {}) : { password: residentForm.password || 'Mudar@123' }),
            };



            if (editingId) {
                await UserService.update(editingId, payload);
                alert('Morador atualizado com sucesso!');
            } else {
                await UserService.create(payload);
                alert('Morador cadastrado com sucesso!');
            }

            setIsAddResidentModalOpen(false);
            resetForm(); // Clear form
            loadData(); // Recarregar
        } catch (error: any) {
            const msg = error.response?.data?.detail
                ? (typeof error.response.data.detail === 'object' ? JSON.stringify(error.response.data.detail) : error.response.data.detail)
                : (editingId ? 'Erro ao atualizar morador' : 'Erro ao cadastrar morador');
            alert(msg);
            console.error(error);
        }
    };

    // Funções de Pet mantidas...
    const handleAddPetRow = () => {
        setResidentForm(prev => ({
            ...prev,
            petsList: [...prev.petsList, { quantity: 1, type: '' }]
        }));
    };

    const handleRemovePetRow = (index: number) => {
        if (residentForm.petsList.length === 1 && index === 0) return;
        const newPets = residentForm.petsList.filter((_, i) => i !== index);
        setResidentForm({ ...residentForm, petsList: newPets });
    };

    const handlePetChange = (index: number, field: 'quantity' | 'type', value: string | number) => {
        const newPets = [...residentForm.petsList];
        newPets[index] = { ...newPets[index], [field]: value };
        setResidentForm({ ...residentForm, petsList: newPets });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Moradores</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os moradores e unidades.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAddResidentModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f]"
                >
                    <UserPlus size={16} /> Novo Morador
                </button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                        <input type="text" placeholder="Buscar morador ou unidade..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#437476]" />
                    </div>
                    <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100">
                        <Filter size={18} />
                    </button>
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
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
                        {loading ? <tr><td colSpan={6} className="p-4 text-center">Carregando...</td></tr> : residents.map((res) => (
                            <tr key={res.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {res.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-slate-900">{res.name}</span>
                                </td>
                                <td className="px-6 py-4">{getUnitName(res.unit_id)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col text-xs">
                                        {/* Backend agora decripta. Se falhar, mostra o valor cru ou placeholder do backend */}
                                        <span>{res.email}</span>
                                        <span className="text-slate-400">{res.phone || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* Tradução de Role/Profile */}
                                    {(() => {
                                        const type = res.profile_type || res.role;
                                        const map: Record<string, string> = {
                                            'ADMIN': 'Administrador',
                                            'RESIDENT': 'Morador',
                                            'RESIDENTE': 'Morador',
                                            'PORTER': 'Porteiro',
                                            'PORTEIRO': 'Porteiro',
                                            'FINANCIAL': 'Financeiro',
                                            'FINANCEIRO': 'Financeiro',
                                            'OWNER': 'Proprietário',
                                            'PROPRIETARIO': 'Proprietário',
                                            'TENANT': 'Inquilino',
                                            'INQUILINO': 'Inquilino',
                                            'STAFF': 'Funcionário'
                                        };
                                        return map[type] || type;
                                    })()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${res.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {res.status === 'ATIVO' ? 'Ativo' : res.status === 'PENDENTE' ? 'Pendente' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDetails(res)}
                                        className="text-slate-400 hover:text-[#437476] mx-1"
                                        title="Ver Detalhes"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(res)}
                                        className="text-slate-400 hover:text-[#437476] mx-1"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddResidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
                        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">{editingId ? 'Editar Morador' : 'Novo Morador'}</h3>
                                <p className="text-sm text-slate-500 mt-1">{editingId ? 'Atualize as informações do morador.' : 'Preencha os detalhes abaixo para registrar um novo morador.'}</p>
                            </div>
                            <button
                                onClick={() => setIsAddResidentModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 py-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#fcfbf9]">
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

                                {/* Linha: Telefone | Bloco | Unidade */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Telefone</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                            <input
                                                type="tel"
                                                placeholder="(99) 99999-9999"
                                                className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                                value={residentForm.phone}
                                                onChange={e => setResidentForm({ ...residentForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {/* Calculated Lists */}
                                    {(() => {
                                        // 1. Identify Occupied Units
                                        const occupiedUnitIds = new Set(residents.filter(r => r.unit_id || r.unit?.id).map(r => r.unit_id || r.unit?.id));

                                        // 2. Extract Unique Blocks
                                        const uniqueBlocks = Array.from(new Set(units.map(u => u.block).filter(Boolean))).sort();

                                        // 3. Filter Units for Selected Block (Available Only OR Current User's Unit)
                                        // We need the ID of the unit currently assigned to the user being edited (if any)
                                        // We can find it via residents list using editingId
                                        const currentUser = editingId ? residents.find(r => r.id === editingId) : null;
                                        const currentUserUnitId = currentUser ? (currentUser.unit_id || currentUser.unit?.id) : null;

                                        const availableUnitsForBlock = units
                                            .filter(u => u.block === residentForm.block)
                                            .filter(u => !occupiedUnitIds.has(u.id) || (currentUserUnitId && u.id === currentUserUnitId))
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
                                                            <option value="">{residentForm.block ? 'Selecione (Livres)...' : 'Selecione o Bloco'}</option>
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
                                                value={residentForm.entryDate}
                                                onChange={e => setResidentForm({ ...residentForm, entryDate: e.target.value })}
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
                                                placeholder="Escolha uma data"
                                                value={residentForm.exitDate}
                                                onChange={e => setResidentForm({ ...residentForm, exitDate: e.target.value })}
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

                                {/* Seção de Pets */}
                                <div className="border border-slate-200 rounded-lg p-5 bg-[#fcfbf9]">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Cat size={18} className="text-[#437476]" />
                                        <h4 className="font-bold text-slate-600 text-sm">Animais de Estimação</h4>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <span className="text-sm text-slate-600">Possui animal de estimação?</span>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${residentForm.hasPets ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                    {residentForm.hasPets && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                                </div>
                                                <input type="radio" className="hidden" checked={residentForm.hasPets} onChange={() => setResidentForm({ ...residentForm, hasPets: true })} />
                                                <span className="text-sm text-slate-600">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!residentForm.hasPets ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                    {!residentForm.hasPets && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                                </div>
                                                <input type="radio" className="hidden" checked={!residentForm.hasPets} onChange={() => setResidentForm({ ...residentForm, hasPets: false })} />
                                                <span className="text-sm text-slate-600">Não</span>
                                            </label>
                                        </div>
                                    </div>

                                    {residentForm.hasPets && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 mt-4 pt-4 border-t border-slate-100">
                                            {residentForm.petsList.map((pet, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                                                    <div className="col-span-3">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Quantidade</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]"
                                                            value={pet.quantity}
                                                            onChange={(e) => handlePetChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        />
                                                    </div>
                                                    <div className="col-span-8">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipo</label>
                                                        <select
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-600"
                                                            value={pet.type}
                                                            onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            <option value="Cachorro">Cachorro</option>
                                                            <option value="Gato">Gato</option>
                                                            <option value="Pássaro">Pássaro</option>
                                                            <option value="Outro">Outro</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-1 flex justify-center pb-2">
                                                        <button
                                                            onClick={() => handleRemovePetRow(index)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                            title="Remover animal"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={handleAddPetRow}
                                                    className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-50 hover:text-[#437476] flex items-center gap-2 transition-colors rounded-lg"
                                                >
                                                    <PlusCircle size={16} /> Adicionar Animal
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full py-4 bg-[#437476] text-white font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors text-base" onClick={handleSaveResident}>
                                    {editingId ? 'Atualizar Morador' : 'Salvar Morador'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingResident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
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

                        <div className="p-6 space-y-6">
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

                            <div className="grid grid-cols-2 gap-6">
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