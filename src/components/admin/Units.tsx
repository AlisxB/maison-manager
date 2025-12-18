import React, { useState, useEffect } from 'react';
import { Building, Search, PlusCircle, X } from 'lucide-react';
import { UnitService, Unit } from '../../services/userService';

export const AdminUnits: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [form, setForm] = useState({
        block: '',
        number: '',
        type: 'Apartment',
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
            const data = await UnitService.getAll();
            // Ordenar por Bloco e depois Número (Numérico se possível, senão String)
            data.sort((a, b) => {
                if (a.block !== b.block) return (a.block || '').localeCompare(b.block || '');
                return parseInt(a.number) - parseInt(b.number) || a.number.localeCompare(b.number);
            });
            setUnits(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const promises = [];

            if (form.isBatch) {
                // Batch Logic: Loop Floors and Units
                for (let f = 1; f <= form.floors; f++) {
                    for (let u = 1; u <= form.unitsPerFloor; u++) {
                        const unitNumber = `${f}${u.toString().padStart(2, '0')}`; // Ex: 1 -> 101, 1 -> 102
                        promises.push(UnitService.create({
                            block: form.block,
                            number: unitNumber,
                            type: form.type
                        }));
                    }
                }

                // Execute chunks
                const CHUNK_SIZE = 3;
                let createdCount = 0;

                for (let i = 0; i < promises.length; i += CHUNK_SIZE) {
                    const chunk = promises.slice(i, i + CHUNK_SIZE);

                    // Executamos com tratamento de erro individual para não parar o lote por duplicatas
                    const results = await Promise.all(
                        chunk.map(p => p.catch(err => {
                            if (err.response && err.response.status === 409) {
                                console.warn("Unidade duplicada pulada.");
                                return "skipped";
                            }
                            console.error("Erro ao criar unidade:", err);
                            return null;
                        }))
                    );

                    // Contar sucessos (não nulos e não skipped se quisermos ser estritos, mas User quer "sucesso" na operação)
                    // Vamos contar apenas os criados efetivamente no alert, mas sucesso geral da operação.
                    createdCount += results.filter(r => r && r !== 'skipped').length;

                    await new Promise(r => setTimeout(r, 100));
                }

                alert(`Processo finalizado! ${createdCount} novas unidades criadas.`);
            } else {
                // Single Logic
                await UnitService.create({
                    block: form.block,
                    number: form.number,
                    type: form.type
                });
                alert('Unidade criada com sucesso!');
            }

            setForm({ block: '', number: '', type: 'Apartment', isBatch: false, floors: 0, unitsPerFloor: 0 });
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            alert('Erro ao criar unidade: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestão de Unidades</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os apartamentos e blocos do condomínio.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle size={18} /> Nova Unidade
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Building size={18} />
                        <span className="font-medium text-sm">{units.length} Unidades Cadastradas</span>
                    </div>
                </div>

                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Bloco</th>
                            <th className="px-6 py-4">Número</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando...</td></tr>
                        ) : units.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma unidade encontrada.</td></tr>
                        ) : (
                            units.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-700">{u.block || '-'}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{u.number}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold uppercase">{u.type || 'Apartamento'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400">
                                        ...
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-slate-700">Nova Unidade</h3>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!form.isBatch ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                        onClick={() => setForm(prev => ({ ...prev, isBatch: false }))}
                                    >
                                        Individual
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${form.isBatch ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                        onClick={() => setForm(prev => ({ ...prev, isBatch: true }))}
                                    >
                                        Lote
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Bloco</label>
                                <input
                                    type="text"
                                    placeholder="Ex: A"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.block}
                                    onChange={e => setForm({ ...form, block: e.target.value })}
                                />
                            </div>

                            {!form.isBatch ? (
                                /* Individual Mode */
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Número</label>
                                    <input
                                        type="text"
                                        required={!form.isBatch}
                                        placeholder="Ex: 101"
                                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={form.number}
                                        onChange={e => setForm({ ...form, number: e.target.value })}
                                    />
                                </div>
                            ) : (
                                /* Batch Mode */
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Andares</label>
                                        <input
                                            type="number"
                                            min="1" max="50"
                                            required={form.isBatch}
                                            placeholder="Ex: 10"
                                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={form.floors}
                                            onChange={e => setForm({ ...form, floors: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Aptos/Andar</label>
                                        <input
                                            type="number"
                                            min="1" max="20"
                                            required={form.isBatch}
                                            placeholder="Ex: 4"
                                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={form.unitsPerFloor}
                                            onChange={e => setForm({ ...form, unitsPerFloor: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="col-span-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                        Serão geradas <strong>{(form.floors || 0) * (form.unitsPerFloor || 0)}</strong> unidades. <br />
                                        Ex: 101, 102... 201, 202...
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Tipo</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="Apartment">Apartamento</option>
                                    <option value="House">Casa</option>
                                    <option value="Store">Loja</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                {form.isBatch ? 'Gerar Unidades' : 'Criar Unidade'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
