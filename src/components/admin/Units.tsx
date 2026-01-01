import React, { useState, useEffect } from 'react';
import { Building, Search, PlusCircle, X, Eye, History, User, CheckCircle, Home, Info } from 'lucide-react';
import { UnitService, UserService, Unit, UnitDetails, User as UserType } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export const AdminUnits: React.FC = () => {
    const { user } = useAuth();
    const [units, setUnits] = useState<Unit[]>([]);
    const [residents, setResidents] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingUnit, setViewingUnit] = useState<UnitDetails | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlock, setFilterBlock] = useState('');

    // Form
    const [form, setForm] = useState({
        block: '',
        number: '',
        type: 'Apartamento',
        isBatch: false,
        floors: 0,
        unitsPerFloor: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [unitsData, usersData] = await Promise.all([
                UnitService.getAll(),
                UserService.getAll()
            ]);

            // Filter active residents only to avoid clutter
            const activeResidents = usersData.filter(u => u.status === 'ATIVO' || u.status === 'PENDENTE');

            // Ordenar por Bloco e depois Número
            unitsData.sort((a, b) => {
                if (a.block !== b.block) return (a.block || '').localeCompare(b.block || '');
                return parseInt(a.number) - parseInt(b.number) || a.number.localeCompare(b.number);
            });

            setUnits(unitsData);
            setResidents(activeResidents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Derived State for UI
    const getUnitResidents = (unitId: string) => {
        return residents.filter(r => r.unit_id === unitId);
    };


    // Unique Blocks for Filter
    const uniqueBlocks = Array.from(new Set(units.map(u => u.block).filter(Boolean))).sort();

    const getUnitStatus = (unitId: string) => {
        const unitRes = getUnitResidents(unitId);
        return unitRes.length > 0 ? 'OCUPADA' : 'VAGA';
    };

    // Stats
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => getUnitStatus(u.id) === 'OCUPADA').length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const promises = [];

            if (form.isBatch) {
                for (let f = 1; f <= form.floors; f++) {
                    for (let u = 1; u <= form.unitsPerFloor; u++) {
                        const unitNumber = `${f}${u.toString().padStart(2, '0')}`;
                        promises.push(UnitService.create({
                            block: form.block,
                            number: unitNumber,
                            type: form.type
                        }));
                    }
                }

                // Batch Execution Logic
                const CHUNK_SIZE = 5;
                for (let i = 0; i < promises.length; i += CHUNK_SIZE) {
                    await Promise.all(promises.slice(i, i + CHUNK_SIZE).map(p => p.catch(e => console.warn(e))));
                }
                alert('Processo de lote finalizado!');
            } else {
                await UnitService.create({
                    block: form.block,
                    number: form.number,
                    type: form.type
                });
                alert('Unidade criada com sucesso!');
            }

            setForm({ block: '', number: '', type: 'Apartamento', isBatch: false, floors: 0, unitsPerFloor: 0 });
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            alert('Erro ao criar unidade: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleViewDetails = async (unitId: string) => {
        try {
            const details = await UnitService.getDetails(unitId);
            setViewingUnit(details);
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar detalhes da unidade.");
        }
    };

    const filteredUnits = units.filter(u => {
        const matchSearch = u.number.includes(searchTerm) || (u.block && u.block.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchBlock = filterBlock ? u.block === filterBlock : true;
        return matchSearch && matchBlock;
    });

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">

            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="md:col-span-1">
                    <h2 className="text-2xl font-black text-[#437476] tracking-tight">Gestão de Unidades</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Controle de ocupação e cadastro.</p>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Unidades</p>
                        <p className="text-2xl font-black text-slate-700">{totalUnits}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Ocupação</p>
                        <p className="text-2xl font-black text-[#437476]">{occupancyRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#437476]">
                        <CheckCircle size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Unidades Vagas</p>
                        <p className="text-2xl font-black text-slate-700">{vacantUnits}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Home size={20} />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search size={20} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número ou bloco..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476]/20 transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476]/20 transition-all font-medium text-slate-700 appearance-none"
                            value={filterBlock}
                            onChange={e => setFilterBlock(e.target.value)}
                        >
                            <option value="">Todos os Blocos</option>
                            {uniqueBlocks.map(block => (
                                <option key={block} value={block || ''}>{block}</option>
                            ))}
                        </select>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#437476] text-white rounded-xl text-sm font-bold hover:bg-[#365e5f] transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <PlusCircle size={18} /> <span className="sm:hidden">Nova</span> <span className="hidden sm:inline">Nova Unidade</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 font-medium">Carregando unidades...</div>
                ) : filteredUnits.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">Nenhuma unidade encontrada.</div>
                ) : (
                    filteredUnits.map(u => {
                        const status = getUnitStatus(u.id);
                        const unitResidents = getUnitResidents(u.id);
                        return (
                            <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:scale-[0.99] transition-transform">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{u.number}</h3>
                                        {u.block && <p className="text-xs font-bold text-slate-400">Bloco {u.block}</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => handleViewDetails(u.id)}
                                            className="p-2 text-slate-400 hover:text-[#437476] bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        {status === 'OCUPADA' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Ocupada
                                            </span>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide border border-slate-200">
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                Vaga
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                        {u.type || 'Apartamento'}
                                    </span>

                                    <div className="flex -space-x-2 pl-2">
                                        {unitResidents.length > 0 ? (
                                            <>
                                                {unitResidents.slice(0, 3).map((res) => (
                                                    <div key={res.id} className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600 uppercase bg-gradient-to-br from-slate-100 to-slate-200">
                                                        {res.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {unitResidents.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                        +{unitResidents.length - 3}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Vazio</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Unidade</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Moradores</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Carregando unidades...</td></tr>
                        ) : filteredUnits.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Nenhuma unidade encontrada.</td></tr>
                        ) : (
                            filteredUnits.map(u => {
                                const status = getUnitStatus(u.id);
                                const unitResidents = getUnitResidents(u.id);
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-lg text-slate-700">{u.number}</span>
                                                {u.block && <span className="text-xs font-bold text-slate-400">Bloco {u.block}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {u.type || 'Apartamento'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {status === 'OCUPADA' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Ocupada
                                                </span>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 uppercase tracking-wide border border-slate-200">
                                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                    Vaga
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {unitResidents.length > 0 ? (
                                                <div className="flex -space-x-3 overflow-hidden p-1">
                                                    {unitResidents.slice(0, 3).map((res, i) => (
                                                        <div key={res.id} className="relative group/avatar cursor-help">
                                                            <div className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600 uppercase bg-gradient-to-br from-slate-100 to-slate-200">
                                                                {res.name.charAt(0)}
                                                            </div>
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                                {res.name} ({res.profile_type})
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {unitResidents.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                            +{unitResidents.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic font-medium p-1">---</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewDetails(u.id)}
                                                className="bg-white hover:bg-[#437476] text-slate-400 hover:text-white border border-slate-200 hover:border-[#437476] transition-all p-2 rounded-lg shadow-sm group-hover:shadow-md"
                                                title="Ver Detalhes e Histórico"
                                            >
                                                <Eye size={18} className="transition-transform group-hover:scale-110" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Nova Unidade</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Preencha os dados da unidade.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Batch Toggle */}
                            <div className="bg-slate-50 p-1 rounded-xl flex">
                                <button
                                    type="button"
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!form.isBatch ? 'bg-white shadow-sm text-[#437476]' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setForm(prev => ({ ...prev, isBatch: false }))}
                                >
                                    Individual
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${form.isBatch ? 'bg-white shadow-sm text-[#437476]' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setForm(prev => ({ ...prev, isBatch: true }))}
                                >
                                    Lote (Múltiplas)
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bloco / Torre</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Torre A"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all font-medium text-slate-700"
                                        value={form.block}
                                        onChange={e => setForm({ ...form, block: e.target.value })}
                                    />
                                </div>

                                {!form.isBatch ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número da Unidade</label>
                                        <input
                                            type="text"
                                            required={!form.isBatch}
                                            placeholder="Ex: 101"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all font-medium text-slate-700"
                                            value={form.number}
                                            onChange={e => setForm({ ...form, number: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Andares</label>
                                            <input
                                                type="number"
                                                min="1" max="50"
                                                required={form.isBatch}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all font-medium text-slate-700"
                                                value={form.floors}
                                                onChange={e => setForm({ ...form, floors: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unidades/Andar</label>
                                            <input
                                                type="number"
                                                min="1" max="20"
                                                required={form.isBatch}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all font-medium text-slate-700"
                                                value={form.unitsPerFloor}
                                                onChange={e => setForm({ ...form, unitsPerFloor: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-span-2 bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 items-start">
                                            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                Serão geradas <strong>{(form.floors || 0) * (form.unitsPerFloor || 0)}</strong> unidades automaticamente. <br />Ex: 101, 102... 201, 202...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo de Imóvel</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437476] transition-all font-medium text-slate-700 appearance-none"
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="Apartamento">Apartamento</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Loja">Loja</option>
                                        <option value="Cobertura">Cobertura</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-[#437476] text-white py-3 rounded-xl font-bold hover:bg-[#365e5f] transition-all shadow-lg shadow-[#437476]/20 active:scale-[0.98]">
                                    {form.isBatch ? 'Gerar Unidades em Lote' : 'Criar Unidade Individual'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {viewingUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header Details */}
                        <div className="relative bg-[#437476] text-white p-6 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Building size={120} />
                            </div>
                            <button onClick={() => setViewingUnit(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20 cursor-pointer shadow-sm">
                                <X size={24} className="text-white drop-shadow-sm" />
                            </button>

                            <div className="relative z-10">
                                <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                                    {viewingUnit.type || 'Unidade'}
                                </span>
                                <h3 className="text-3xl font-black">Unidade {viewingUnit.number}</h3>
                                {viewingUnit.block && <p className="text-slate-300 font-medium">Bloco {viewingUnit.block}</p>}
                            </div>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* Current Occupation */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <User size={16} className="text-[#437476]" />
                                    Ocupação Atual
                                </h4>

                                {viewingUnit.current_residents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {viewingUnit.current_residents.map(res => (
                                            <div key={res.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-600 shadow-sm">
                                                    {res.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{res.name}</p>
                                                    <p className="text-xs text-slate-400">{res.email}</p>
                                                    <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${res.profile_type === 'PROPRIETARIO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {res.profile_type || 'INQUILINO'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center flex flex-col items-center justify-center gap-2">
                                        <Home size={32} className="text-slate-300" />
                                        <p className="text-slate-400 font-medium text-sm">Esta unidade está vaga no momento.</p>
                                    </div>
                                )}
                            </div>

                            {/* History Timeline */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <History size={16} className="text-[#437476]" />
                                    Histórico de Ocupação
                                </h4>

                                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {viewingUnit.occupation_history.length > 0 ? (
                                        viewingUnit.occupation_history.map(hist => (
                                            <div key={hist.id} className="relative pl-10">
                                                <div className={`absolute left-3 top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${!hist.end_date ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-slate-700 text-sm">{hist.user_name || 'Usuário Removido'}</p>
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{hist.profile_type}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-slate-600">
                                                                {new Date(hist.start_date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                até {hist.end_date ? new Date(hist.end_date).toLocaleDateString() : 'o momento'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="pl-10 text-xs text-slate-400 italic">Nenhum histórico registrado.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
