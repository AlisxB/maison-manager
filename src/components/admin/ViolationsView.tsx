import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Gavel, User, CheckCircle, Clock } from 'lucide-react';
import { ViolationService, Violation, ViolationCreate } from '../../services/violationService';
import { UserService, User as UserType } from '../../services/userService';
import { BylawService, Bylaw } from '../../services/bylawService';

export const ViolationsView: React.FC = () => {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [residents, setResidents] = useState<UserType[]>([]);
    const [bylaws, setBylaws] = useState<Bylaw[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<ViolationCreate>>({
        type: 'ADVERTENCIA',
        resident_id: '',
        bylaw_id: '',
        description: '',
        amount: 0,
        occurred_at: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vData, rData, bData] = await Promise.all([
                ViolationService.getAll(),
                UserService.getResidents(),
                BylawService.getAll()
            ]);
            setViolations(vData);
            setResidents(rData);
            setBylaws(bData);
        } catch (error) {
            console.error("Error loading violations data", error);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Filter for Bylaws based on selected Type
    const filteredBylaws = bylaws.filter(b => {
        if (formData.type === 'MULTA') return b.category === 'Multa';
        return b.category !== 'Multa';
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ViolationService.create(formData as ViolationCreate);
            setShowModal(false);
            loadData();
        } catch (error) {
            alert('Erro ao criar infração');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        await ViolationService.delete(id);
        loadData();
    };

    const getResidentName = (id: string) => residents.find(r => r.id === id)?.name || 'Desconhecido';
    const getBylawTitle = (id?: string) => bylaws.find(b => b.id === id)?.title || 'Genérico';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        Infrações e Multas
                    </h3>
                    <p className="text-xs text-slate-500">Registro de ocorrências e penalidades.</p>
                </div>
                <button
                    onClick={() => { setFormData({ type: 'ADVERTENCIA', resident_id: '', bylaw_id: '', description: '', amount: 0, occurred_at: new Date().toISOString().slice(0, 16) }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-red-200 shadow-lg"
                >
                    <Plus size={18} /> Nova Infração
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Carregando...</div>
                    ) : violations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Nenhuma infração registrada.</div>
                    ) : (
                        violations.map(v => (
                            <div key={v.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${v.type === 'MULTA' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {v.type === 'MULTA' ? <Gavel size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">{v.type === 'MULTA' ? 'Multa' : 'Advertência'}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${v.status === 'PAGO' || v.status === 'RESOLVIDO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {v.status === 'ABERTO' && 'Aberto'}
                                                    {v.status === 'PAGO' && 'Pago'}
                                                    {v.status === 'RESOLVIDO' && 'Resolvido'}
                                                    {!['ABERTO', 'PAGO', 'RESOLVIDO'].includes(v.status) && v.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle size={12} /> Registrado: {new Date(v.created_at).toLocaleDateString()}
                                                </span>
                                                {v.occurred_at && (
                                                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                                                        <Clock size={12} /> Ocorrido: {new Date(v.occurred_at).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 mt-2">
                                            <User size={14} className="inline mr-1" />
                                            {getResidentName(v.resident_id)}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            <strong>Motivo:</strong> {v.description} <i className="text-slate-400">({getBylawTitle(v.bylaw_id)})</i>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {v.type === 'MULTA' && v.amount !== null && (
                                        <div className="text-right">
                                            <span className="block text-xs text-slate-400">Valor</span>
                                            <span className="font-bold text-slate-700">R$ {Number(v.amount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">Nova Infração</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Type Selection */}
                            <div className="flex p-1 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'ADVERTENCIA' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'ADVERTENCIA' ? 'bg-white shadow text-amber-600' : 'text-slate-500'}`}
                                >
                                    Advertência
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'MULTA' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'MULTA' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
                                >
                                    Multa Pecuniária
                                </button>
                            </div>

                            {/* Resident */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Infrator (Morador)</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg mt-1 bg-white"
                                    value={formData.resident_id}
                                    onChange={e => setFormData({ ...formData, resident_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {residents
                                        .filter(r => r.status === 'ATIVO') // Only active residents
                                        .map(r => (
                                            <option key={r.id} value={r.id}>{r.name} (Bloco {r.unit?.block} - {r.unit?.number})</option>
                                        ))}
                                </select>
                            </div>

                            {/* Bylaw (Filtered) */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Regra Violada</label>
                                <select
                                    className="w-full p-2 border rounded-lg mt-1 bg-white"
                                    value={formData.bylaw_id}
                                    onChange={e => setFormData({ ...formData, bylaw_id: e.target.value })}
                                >
                                    <option value="">Selecione a regra...</option>
                                    {filteredBylaws.map(b => (
                                        <option key={b.id} value={b.id}>{b.title} ({b.category})</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    *Listando apenas regras compatíveis com {formData.type === 'MULTA' ? 'Multa' : 'Advertência'}.
                                </p>
                            </div>

                            {/* Occurred At */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Data e Hora da Ocorrência</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full p-2 border rounded-lg mt-1 bg-white"
                                    value={formData.occurred_at}
                                    onChange={e => setFormData({ ...formData, occurred_at: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Descrição do Ocorrido</label>
                                <textarea
                                    required
                                    className="w-full p-2 border rounded-lg mt-1 h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva os detalhes da infração..."
                                />
                            </div>

                            {/* Amount (Only if Fine) */}
                            {formData.type === 'MULTA' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Valor da Multa (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full p-2 border rounded-lg mt-1 font-mono text-red-600 font-bold"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all">
                                    Gerar {formData.type === 'MULTA' ? 'Multa' : 'Notificação'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
