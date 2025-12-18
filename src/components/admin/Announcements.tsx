import React, { useState } from 'react';
import { Megaphone, Users, CheckCircle, PlusCircle, X, ChevronDown, Send } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '../../mock';

export const AdminAnnouncements: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Aviso',
        notifyWhatsapp: false,
        audience: 'Todos os moradores'
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Urgente': return 'bg-red-100 text-red-700';
            case 'Evento': return 'bg-purple-100 text-purple-700';
            case 'Manutenção': return 'bg-orange-100 text-orange-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Gestão de Avisos</h2>
                    <p className="text-sm text-slate-500 mt-1">Crie, edite e remova os avisos para os moradores.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f]"
                >
                    <PlusCircle size={16} /> Novo Aviso
                </button>
            </div>

            <div className="grid gap-4">
                {MOCK_ANNOUNCEMENTS.map(ann => (
                    <div key={ann.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getTypeColor(ann.type)}`}>{ann.type}</span>
                             <span className="text-xs text-slate-400">{ann.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h3>
                        <p className="text-slate-600 text-sm mb-4">{ann.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                            <span className="flex items-center gap-1 font-medium"><Users size={14} /> {ann.targetAudience}</span>
                            {ann.sentViaWhatsapp && <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={14} /> Enviado via WhatsApp</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Announcement Modal */}
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
                                <h3 className="text-xl font-bold text-slate-700">Novo Aviso</h3>
                                <p className="text-sm text-slate-500 mt-1">Escreva e publique um novo aviso para os moradores.</p>
                            </div>

                            <div className="space-y-5">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Título do Aviso</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Manutenção da Piscina"
                                        className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] placeholder-slate-400 text-slate-700" 
                                        value={formData.title} 
                                        onChange={e => setFormData({...formData, title: e.target.value})} 
                                    />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Descrição Completa</label>
                                    <textarea 
                                        placeholder="Descreva os detalhes do aviso aqui..."
                                        className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#437476] resize-none h-32 placeholder-slate-400"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                    <div className="flex justify-end mt-1">
                                         <div className="text-[10px] text-slate-400">///</div>
                                    </div>
                                </div>

                                {/* Tipo de Aviso */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Aviso</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none cursor-pointer"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="Aviso">Aviso</option>
                                            <option value="Urgente">Urgente</option>
                                            <option value="Evento">Evento</option>
                                            <option value="Manutenção">Manutenção</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* WhatsApp Checkbox */}
                                <div className="bg-[#f3f4f6] border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                                    <div 
                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${formData.notifyWhatsapp ? 'bg-[#437476] border-[#437476]' : 'bg-white border-slate-300'}`}
                                        onClick={() => setFormData({...formData, notifyWhatsapp: !formData.notifyWhatsapp})}
                                    >
                                        {formData.notifyWhatsapp && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <label 
                                        className="text-sm text-slate-600 cursor-pointer select-none"
                                        onClick={() => setFormData({...formData, notifyWhatsapp: !formData.notifyWhatsapp})}
                                    >
                                        Notificar moradores por WhatsApp?
                                    </label>
                                </div>

                                {/* Audience - Only visible if WhatsApp notification is enabled */}
                                {formData.notifyWhatsapp && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Enviar para:</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.audience === 'Todos os moradores' ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                    {formData.audience === 'Todos os moradores' && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    className="hidden" 
                                                    checked={formData.audience === 'Todos os moradores'} 
                                                    onChange={() => setFormData({...formData, audience: 'Todos os moradores'})} 
                                                />
                                                <span className="text-sm text-slate-600">Todos os moradores</span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.audience === 'Apenas Proprietários' ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                    {formData.audience === 'Apenas Proprietários' && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    className="hidden" 
                                                    checked={formData.audience === 'Apenas Proprietários'} 
                                                    onChange={() => setFormData({...formData, audience: 'Apenas Proprietários'})} 
                                                />
                                                <span className="text-sm text-slate-600">Apenas Proprietários</span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.audience === 'Apenas Inquilinos' ? 'border-[#437476]' : 'border-slate-300 group-hover:border-[#437476]'}`}>
                                                    {formData.audience === 'Apenas Inquilinos' && <div className="w-3 h-3 rounded-full bg-[#437476]"></div>}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    className="hidden" 
                                                    checked={formData.audience === 'Apenas Inquilinos'} 
                                                    onChange={() => setFormData({...formData, audience: 'Apenas Inquilinos'})} 
                                                />
                                                <span className="text-sm text-slate-600">Apenas Inquilinos</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className="w-full mt-2 py-3 bg-[#437476] text-white font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <Send size={16} /> Publicar Aviso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}