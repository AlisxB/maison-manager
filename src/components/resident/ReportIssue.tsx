import React, { useState } from 'react';
import { EyeOff, MapPin, Lock, Eye, FileText, Send, CheckCircle, Wrench, Volume2, ShieldAlert, HelpCircle } from 'lucide-react';

import { OccurrenceService } from '../../services/occurrenceService';

export const ResidentReportIssue: React.FC = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: '',
    isAnonymous: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await OccurrenceService.create({
        title: `[Relato] ${formData.location}`, // Using location as title prefix or we should add title field. Form design shows Location but no Title? Ah, previous design.
        // Wait, previous design in Dashboard modal HAD title. This standalone page DOES NOT have title input?
        // "Local ou Unidade Envolvida" is the input.
        // I should prob use Location as title or description prefix. 
        // Let's use Location as Title for now.
        description: `Local: ${formData.location}\n\n${formData.description}`,
        category: formData.category,
        is_anonymous: formData.isAnonymous
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting issue:", error);
      alert("Erro ao enviar ocorrência.");
    }
  };

  const categories = [
    { id: 'Maintenance', label: 'Manutenção', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Noise', label: 'Barulho', icon: Volume2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'Security', label: 'Segurança', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'Other', label: 'Outros', icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ocorrência Registrada!</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Sua notificação foi enviada com sucesso para a administração.
            {formData.isAnonymous
              ? ' Como você optou pelo envio anônimo, seus dados foram ocultados.'
              : ' Você receberá atualizações sobre o status desta ocorrência.'}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ category: '', description: '', location: '', isAnonymous: false });
            }}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Registrar Nova Ocorrência
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Notificar Intercorrência</h2>
        <p className="text-sm text-slate-500 mt-1">Relate problemas, quebras de regras ou solicitações de manutenção.</p>
      </div>

      <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${formData.isAnonymous ? 'border-indigo-200 shadow-indigo-50' : 'border-slate-200'}`}>
        {/* Header Indicator for Anonymous Mode */}
        {formData.isAnonymous && (
          <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 rounded-t-2xl flex items-center gap-2 text-indigo-700 text-sm font-medium">
            <EyeOff size={16} />
            <span>Modo Anônimo Ativado: Seus dados pessoais não serão vinculados a este relato.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Qual o tipo da ocorrência?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2
                    ${formData.category === cat.id
                      ? `${cat.bg} ${cat.color} border-current shadow-sm transform scale-[1.02]`
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <cat.icon size={24} />
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Location Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Local ou Unidade Envolvida
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Hall do 3º andar, Unidade 202..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Lock size={16} className="text-slate-400" /> Privacidade
              </label>
              <div
                onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${formData.isAnonymous ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.isAnonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.isAnonymous ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${formData.isAnonymous ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {formData.isAnonymous ? 'Relato Anônimo' : 'Relato Identificado'}
                  </p>
                </div>
                {formData.isAnonymous ? <EyeOff size={18} className="text-indigo-400" /> : <Eye size={18} className="text-slate-400" />}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <FileText size={16} className="text-slate-400" /> Descrição Detalhada
            </label>
            <textarea
              required
              rows={5}
              placeholder="Descreva o ocorrido com o máximo de detalhes possível..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!formData.category || !formData.description || !formData.location}
              className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all transform active:scale-[0.98]
                ${(!formData.category || !formData.description || !formData.location)
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-200'}`}
            >
              <Send size={18} /> Enviar Ocorrência
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};