import React, { useState } from 'react';
import {
    Search, Filter, UserPlus, Edit2, User as UserIcon, Mail, Phone, Building, Calendar, Cat, X, Trash2, PlusCircle
} from 'lucide-react';
import { MOCK_RESIDENTS } from '../../mock'; // Removido
import { UserService, UnitService, User, Unit } from '../../services/userService';

export const AdminResidents: React.FC = () => {
    const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
    const [residentForm, setResidentForm] = useState({
        name: '',
        email: '',
        phone: '',
        block: '',
        unit: '',
        entryDate: '2025-12-17',
        exitDate: '',
        registeredBy: 'JOAO',
        hasPets: false,
        petsList: [{ quantity: 1, type: '' }]
    });

    const [residents, setResidents] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        loadData();
    }, []);

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

    const getUnitName = (unitId?: string) => {
        if (!unitId) return '-';
        const unit = units.find(u => u.id === unitId);
        return unit ? `${unit.block ? 'Bloco ' + unit.block + ' - ' : ''}${unit.number}` : '-';
    };

    const handleSaveResident = async () => {
        try {
            // Encontrar ID da unidade baseada na seleção
            // Nota: O backend espera unit_id. O front atualmente tem selects separados para Bloco e Unidade.
            // Precisamos encontrar a unidade correta ou criar.
            // Simplificação MVP: Se a unidade não existir no array 'units' carregado, não enviamos unit_id por enquanto
            // ou assumimos que o usuário selecionou algo válido que mapeamos.

            // Vamos achar a unit no array carregado que bate com block e number
            const targetUnit = units.find(u => u.block === residentForm.block && u.number === residentForm.unit);

            const payload = {
                name: residentForm.name,
                email: residentForm.email,
                phone: residentForm.phone,
                role: 'RESIDENT',
                profile_type: 'TENANT', // Default
                unit_id: targetUnit?.id,
                password: 'mudar123', // Senha temporária padrão
            };

            await UserService.create(payload);
            alert('Morador cadastrado com sucesso!');
            setIsAddResidentModalOpen(false);
            loadData(); // Recarregar
        } catch (error) {
            alert('Erro ao cadastrar morador');
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
                    onClick={() => setIsAddResidentModalOpen(true)}
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
                                        {/* Tratamento para email criptografado simulado */}
                                        <span>{res.email.startsWith('ENC(') ? '***********' : res.email}</span>
                                        {/* Phone não vem no UserRead atual, precisaria ajustar backend. Mostrando placeholder se nulo */}
                                        <span className="text-slate-400">-</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{res.profile_type || res.role}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${res.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-[#437476] mx-1"><Edit2 size={16} /></button>
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
                                <h3 className="text-xl font-bold text-slate-700">Detalhes do Morador</h3>
                                <p className="text-sm text-slate-500 mt-1">Preencha os detalhes abaixo para registrar um novo morador.</p>
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

                                {/* Email */}
                                <div>
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
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Bloco</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none"
                                                value={residentForm.block}
                                                onChange={e => setResidentForm({ ...residentForm, block: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="A">Bloco A</option>
                                                <option value="B">Bloco B</option>
                                                <option value="C">Bloco C</option>
                                            </select>
                                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Nº da Unidade</label>
                                        <div className="relative">
                                            <Building size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Ex: 101"
                                                className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700"
                                                value={residentForm.unit}
                                                onChange={e => setResidentForm({ ...residentForm, unit: e.target.value })}
                                            />
                                        </div>
                                    </div>
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
                                    Salvar Morador
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};