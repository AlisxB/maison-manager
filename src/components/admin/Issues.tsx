import React, { useState, useEffect } from 'react';
import { User, X, MapPin, MessageSquare, CheckCircle, Clock, AlertTriangle, Save, Edit, RefreshCw } from 'lucide-react';
import { Occurrence, OccurrenceService } from '../../services/occurrenceService';

export const AdminIssues: React.FC = () => {
    const [issues, setIssues] = useState<Occurrence[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState<Occurrence | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [statusUpdate, setStatusUpdate] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN');

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

    const handleOpenModal = (issue: Occurrence) => {
        setSelectedIssue(issue);
        setStatusUpdate(issue.status);
        setAdminNote(issue.admin_response || '');
    };

    const handleSaveUpdate = async () => {
        if (!selectedIssue) return;
        try {
            await OccurrenceService.update(selectedIssue.id, {
                status: statusUpdate,
                admin_response: adminNote
            });
            alert('Ocorrência atualizada com sucesso!');
            setSelectedIssue(null);
            fetchIssues(); // Refresh list
        } catch (error) {
            console.error("Error updating occurrence:", error);
            alert("Erro ao atualizar ocorrência.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={12} /> Resolvido</span>;
            case 'IN_PROGRESS':
                return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={12} /> Em Análise</span>;
            case 'CLOSED':
                return <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={12} /> Fechado</span>;
            default:
                return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase"><AlertTriangle size={12} /> Aberto</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Gestão de Intercorrências</h2>
                    <p className="text-sm text-slate-500 mt-1">Acompanhe e resolva as solicitações dos moradores.</p>
                </div>
                <button onClick={fetchIssues} className="p-2 text-slate-500 hover:text-[#437476] hover:bg-slate-100 rounded-full transition-colors">
                    <RefreshCw size={20} />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Carregando intercorrências...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map(issue => (
                        <div key={issue.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                {getStatusBadge(issue.status)}
                                <span className="text-xs text-slate-400">{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{issue.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                {/* Note: We might need to join with User table to get name properly in backend or fetch here. 
                                     For now, we rely on user_id or if backend returns expanded user. 
                                     Assuming ID until we enhance backend response. */}
                                {issue.is_anonymous ? (
                                    <span className="flex items-center gap-1 font-semibold text-indigo-500">
                                        <User size={14} /> Anônimo
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <User size={14} /> Morador (ID: {issue.user_id.substring(0, 8)}...)
                                    </span>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => handleOpenModal(issue)}
                                    className="w-full py-2 bg-[#437476] text-white rounded-lg text-sm hover:bg-[#365e5f] font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} /> Detalhes / Atualizar
                                </button>
                            </div>
                        </div>
                    ))}
                    {issues.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Nenhuma intercorrência encontrada.
                        </div>
                    )}
                </div>
            )}

            {/* DETAILS & UPDATE MODAL */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Ocorrência</h3>
                                    <p className="text-xs text-slate-500">Reportado em {new Date(selectedIssue.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedIssue(null)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Status Atual</span>
                                    {getStatusBadge(selectedIssue.status)}
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Categoria</span>
                                    <span className="text-sm font-medium text-slate-700">{selectedIssue.category}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-[#437476]" /> Descrição do Relato
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-600 leading-relaxed shadow-sm">
                                    {selectedIssue.description || "Nenhuma descrição fornecida."}
                                </div>
                            </div>

                            {/* Admin Action Section */}
                            <div className="bg-slate-100 rounded-lg p-5 border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <User size={16} /> Gestão da Ocorrência
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Atualizar Status</label>
                                        <select
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#437476]"
                                            value={statusUpdate}
                                            onChange={(e) => setStatusUpdate(e.target.value as any)}
                                        >
                                            <option value="OPEN">Aberto</option>
                                            <option value="IN_PROGRESS">Em Análise / Andamento</option>
                                            <option value="RESOLVED">Resolvido</option>
                                            <option value="CLOSED">Fechado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nota da Administração</label>
                                        <textarea
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#437476] min-h-[80px]"
                                            placeholder="Adicione uma resposta, observação ou detalhe sobre a resolução..."
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={() => setSelectedIssue(null)}
                                className="px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUpdate}
                                className="px-6 py-2 bg-[#437476] text-white font-medium rounded-lg hover:bg-[#365e5f] text-sm shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <Save size={16} /> Salvar Alterações
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}