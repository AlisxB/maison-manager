import React, { useState } from 'react';
import { 
    ShieldAlert, 
    Ban, 
    AlertTriangle, 
    PlusCircle, 
    BarChart3, 
    Search, 
    Filter, 
    X, 
    Calendar, 
    Clock,
    FileText,
    ChevronDown
} from 'lucide-react';
import { MOCK_INFRACTIONS, MOCK_RESIDENTS, REGIMENT_ARTICLES } from '../../mock';

export const AdminNotifications: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterResident, setFilterResident] = useState('Todos os Moradores');
    
    // Form State
    const [formData, setFormData] = useState({
        residentId: '',
        type: 'notification', // notification | fine
        date: '17 de dezembro de 2025',
        time: '12:40',
        reason: '',
        article: ''
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-700">Gerenciador de Notificações e Multas</h2>
                <p className="text-sm text-slate-500 mt-1">Crie, envie e rastreie todos os documentos para os moradores.</p>
            </div>
            
            {/* Top Card: Maiores Ocorrências (Empty State Visual) */}
            <div className="bg-[#fcfbf9] rounded-lg border border-[#e5e7eb] p-8 flex flex-col items-center justify-center text-center min-h-[200px] shadow-sm">
                <div className="w-full flex justify-start mb-4">
                     <div className="flex items-center gap-2">
                        <BarChart3 className="text-slate-400" size={20} />
                        <h3 className="font-bold text-slate-700 text-lg">Maiores Ocorrências por Unidade</h3>
                     </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-500 mt-2">Visão rápida das unidades com maior número de notificações e multas.</p>
                    <div className="mt-8 text-slate-400 font-medium">Nenhuma ocorrência registrada ainda.</div>
                </div>
            </div>

            {/* Bottom Card: History */}
            <div className="bg-[#fcfbf9] rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#e5e7eb] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-700">Histórico de Documentos</h3>
                        <p className="text-sm text-slate-500">Visualize e gerencie todos os documentos gerados.</p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                className="w-full md:w-48 appearance-none bg-[#f3f4f6] border border-[#e5e7eb] text-slate-600 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#437476]"
                                value={filterResident}
                                onChange={(e) => setFilterResident(e.target.value)}
                            >
                                <option>Todos os Moradores</option>
                                {MOCK_RESIDENTS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f] transition-colors"
                        >
                            <PlusCircle size={18} /> Gerar Novo
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#f3f4f6]/50 text-slate-500 font-medium border-b border-[#e5e7eb]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Morador</th>
                                <th className="px-6 py-4 font-semibold">Tipo</th>
                                <th className="px-6 py-4 font-semibold">Data da Infração</th>
                                <th className="px-6 py-4 font-semibold">Valor</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb]">
                            {MOCK_INFRACTIONS.length > 0 ? (
                                MOCK_INFRACTIONS.map(inf => (
                                    <tr key={inf.id} className="hover:bg-slate-50 transition-colors bg-[#fcfbf9]">
                                        <td className="px-6 py-4 font-medium text-slate-800">{inf.residentName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                                                inf.type === 'fine' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                                {inf.type === 'fine' ? 'Multa' : 'Notificação'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{inf.date}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {inf.value ? `R$ ${inf.value.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200 font-medium">
                                                {inf.status === 'Sent' ? 'Enviado' : inf.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[#437476] font-medium text-xs hover:underline">Ver Detalhes</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum documento encontrado para este filtro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-[#e5e7eb]">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="px-8 py-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-700">Gerar Notificação/Multa</h3>
                                <p className="text-sm text-slate-500 mt-1">Preencha os detalhes da infração para gerar um novo documento.</p>
                            </div>

                            <div className="space-y-5">
                                {/* Morador */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Morador</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-600 appearance-none hover:bg-slate-50 transition-colors"
                                            value={formData.residentId}
                                            onChange={e => setFormData({...formData, residentId: e.target.value})}
                                        >
                                            <option value="">Selecione o morador</option>
                                            {MOCK_RESIDENTS.map(r => <option key={r.id} value={r.id}>{r.name} - {r.unit}</option>)}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Tipo de Documento */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Documento</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.type === 'notification' ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                {formData.type === 'notification' && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                className="hidden" 
                                                checked={formData.type === 'notification'} 
                                                onChange={() => setFormData({...formData, type: 'notification'})} 
                                            />
                                            <span className="text-sm text-slate-600">Notificação</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.type === 'fine' ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                {formData.type === 'fine' && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                className="hidden" 
                                                checked={formData.type === 'fine'} 
                                                onChange={() => setFormData({...formData, type: 'fine'})} 
                                            />
                                            <span className="text-sm text-slate-600">Multa</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Data e Hora */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Data e Hora da Infração</label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <input 
                                                type="text" 
                                                value={formData.date}
                                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e5e7eb] rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                                            />
                                            <Calendar size={18} className="absolute right-3 top-3.5 text-slate-400" />
                                        </div>
                                        <div className="relative w-32">
                                            <input 
                                                type="text" 
                                                value={formData.time}
                                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e5e7eb] rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Motivo / Descrição da Infração</label>
                                    <textarea 
                                        placeholder="Ex: Barulho excessivo após as 22h no dia..."
                                        className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e5e7eb] rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476] resize-none h-28 placeholder:text-slate-400"
                                        value={formData.reason}
                                        onChange={e => setFormData({...formData, reason: e.target.value})}
                                    />
                                    <div className="flex justify-end mt-1">
                                         <div className="text-[10px] text-slate-400">///</div>
                                    </div>
                                </div>

                                {/* Artigo (Opcional) */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Artigo do Regimento (Opcional)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-600 appearance-none hover:bg-slate-50 transition-colors"
                                            value={formData.article}
                                            onChange={e => setFormData({...formData, article: e.target.value})}
                                        >
                                            <option value="">Selecione um artigo para fundamentar</option>
                                            {REGIMENT_ARTICLES.map((art, i) => <option key={i} value={art}>{art}</option>)}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="px-6 py-2.5 bg-[#437476] text-white font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors text-sm"
                                    >
                                        Criar Documento
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}