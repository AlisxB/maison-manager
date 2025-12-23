import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle, UserPlus, Eye, X, Calendar, Phone, Mail, FileText, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

export const AdminRequests: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/users?status=PENDENTE');
            setRequests(response.data);
        } catch (error) {
            console.error("Erro ao buscar solicitações", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            await api.put(`/users/${selectedRequest.id}`, { status: 'ATIVO' });
            alert(`Usuário ${selectedRequest.name} aprovado!`);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            alert("Erro ao aprovar usuário.");
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!confirm("Tem certeza que deseja rejeitar esta solicitação?")) return;
        try {
            // Opção: Deletar ou Marcar como REJEITADO. Vamos marcar para histórico.
            await api.put(`/users/${selectedRequest.id}`, { status: 'REJEITADO' });
            alert(`Solicitação rejeitada.`);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.detail || "Erro ao rejeitar.");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando solicitações...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#437476]">Solicitações de Cadastro</h2>

            <div className="grid gap-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{req.name}</h3>
                                <p className="text-sm text-slate-500">
                                    {req.profile_type === 'INQUILINO' ? 'Inquilino' : 'Proprietário'} •
                                    Unidade {req.unit ? `${req.unit.block}-${req.unit.number}` : 'N/A'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{req.email} • {new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setSelectedRequest(req)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                            >
                                <Eye size={16} /> Ver Detalhes
                            </button>
                            <button
                                onClick={() => setSelectedRequest(req)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg hover:bg-[#365e5f] text-sm font-medium transition-colors"
                            >
                                Analisar
                            </button>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && <div className="text-center text-slate-500 py-10">Nenhuma solicitação pendente.</div>}
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Detalhes da Solicitação</h3>
                                <p className="text-sm text-slate-500">Analise os dados antes de aprovar.</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto max-h-[75vh]">

                            {/* ID Badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl border-4 border-white shadow-sm">
                                    {selectedRequest.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800">{selectedRequest.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">{selectedRequest.role}</span>
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">{selectedRequest.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Data */}
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">Dados Pessoais</h5>

                                    <div className="flex items-start gap-3">
                                        <Mail size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">E-mail</p>
                                            <p className="text-sm font-medium text-slate-800">{selectedRequest.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Telefone</p>
                                            <p className="text-sm font-medium text-slate-800">{selectedRequest.phone || 'Não informado'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <UserIcon size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">CPF</p>
                                            <p className="text-sm font-medium text-slate-800">{selectedRequest.cpf || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Unit Data */}
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">Dados da Unidade</h5>

                                    <div className="flex items-start gap-3">
                                        <UserCheck size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Unidade Solicitada</p>
                                            <p className="text-sm font-bold text-slate-800 text-lg">
                                                {selectedRequest.unit ? `${selectedRequest.unit.block}-${selectedRequest.unit.number}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Data de Registro</p>
                                            <p className="text-sm font-medium text-slate-800">{new Date(selectedRequest.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observations */}
                            {selectedRequest.comments && (
                                <div className="mt-8">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">Observações</h5>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                                        <FileText size={18} className="text-amber-500 flex-shrink-0" />
                                        <p className="text-sm text-slate-700 italic">"{selectedRequest.comments}"</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={handleReject}
                                className="px-4 py-2.5 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm"
                            >
                                Rejeitar Solicitação
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-6 py-2.5 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-colors shadow-sm text-sm flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Aprovar Cadastro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};