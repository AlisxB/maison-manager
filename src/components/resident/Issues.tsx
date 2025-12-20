import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Plus, X, AlertCircle } from 'lucide-react';
import { Occurrence, OccurrenceService, OccurrenceCreate } from '../../services/occurrenceService';

export const ResidentIssues: React.FC = () => {
    const [issues, setIssues] = useState<Occurrence[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<OccurrenceCreate>({
        title: '',
        description: '',
        category: 'Maintenance'
    });

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const data = await OccurrenceService.getAll();
            setIssues(data);
        } catch (error) {
            console.error("Error fetching occurrences:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await OccurrenceService.create(formData);
            alert("Ocorrência registrada com sucesso!");
            setIsModalOpen(false);
            setFormData({ title: '', description: '', category: 'Maintenance' });
            fetchIssues();
        } catch (error) {
            console.error("Error creating issue:", error);
            alert("Erro ao registrar ocorrência.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircle size={12} /> Resolvido</span>;
            case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><Clock size={12} /> Em Análise</span>;
            case 'CLOSED': return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircle size={12} /> Fechado</span>;
            default: return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><AlertCircle size={12} /> Aberto</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Minhas Ocorrências</h2>
                    <p className="text-sm text-slate-500">Acompanhe o status das suas solicitações.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
                    <Plus size={18} /> Nova Ocorrência
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Carregando...</div>
            ) : (
                <div className="grid gap-4">
                    {issues.length > 0 ? issues.map(issue => (
                        <div key={issue.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(issue.status)}
                                    <span className="text-xs text-slate-400">{new Date(issue.created_at).toLocaleDateString()}</span>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        {issue.category === 'Maintenance' && 'Manutenção'}
                                        {issue.category === 'Noise' && 'Barulho'}
                                        {issue.category === 'Security' && 'Segurança'}
                                        {issue.category === 'Other' && 'Outro'}
                                        {!['Maintenance', 'Noise', 'Security', 'Other'].includes(issue.category) && issue.category}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{issue.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                                {issue.description}
                            </p>

                            {issue.admin_response && (
                                <div className="mt-4 pl-4 border-l-4 border-emerald-200 bg-emerald-50 p-3 rounded-r-lg">
                                    <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Resposta da Administração</p>
                                    <p className="text-sm text-emerald-900">{issue.admin_response}</p>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center">
                            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma ocorrência registrada</h3>
                            <p className="text-slate-500 text-sm mb-4">Você ainda não reportou nenhum problema.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-bold text-sm hover:underline">Registrar Agora</button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Reportar Problema</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Vazamento na garagem"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="Maintenance">Manutenção</option>
                                    <option value="Noise">Barulho / Silêncio</option>
                                    <option value="Security">Segurança</option>
                                    <option value="Other">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                                    <CheckCircle size={18} /> Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
