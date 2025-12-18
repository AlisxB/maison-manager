import React, { useState } from 'react';
import { Ban, AlertTriangle, Calendar, ChevronRight, CheckCircle, X, Gavel, AlertCircle } from 'lucide-react';
import { MOCK_INFRACTIONS } from '../../mock';
import { Infraction } from '../../types';

export const ResidentNotifications: React.FC = () => {
  const [selectedInfraction, setSelectedInfraction] = useState<Infraction | null>(null);

  // Filter infractions for the logged-in user (Simulating Alice, ID '1')
  const myInfractions = MOCK_INFRACTIONS.filter(i => i.residentId === '1');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Minhas Notificações</h2>
        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
           {myInfractions.length}
        </span>
      </div>
      <p className="text-slate-500 text-sm -mt-4">
        Histórico completo de comunicados disciplinares, advertências e multas da sua unidade.
      </p>

      {myInfractions.length > 0 ? (
        <div className="space-y-4">
          {myInfractions.map((infraction) => (
            <div 
              key={infraction.id} 
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              {/* Icon */}
              <div className={`p-4 rounded-xl flex-shrink-0 ${
                infraction.type === 'fine' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {infraction.type === 'fine' ? <Ban size={24} /> : <AlertTriangle size={24} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {infraction.type === 'fine' ? 'Multa Condominial' : 'Notificação / Advertência'}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    <Calendar size={12} /> {new Date(infraction.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1 mb-1">{infraction.reason}</p>
                <p className="text-xs text-slate-400 truncate">
                  {infraction.article ? infraction.article : 'Artigo não especificado'}
                </p>
              </div>

              {/* Actions/Status */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-center">
                 {infraction.value && (
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(infraction.value)}
                    </span>
                 )}
                 
                 <div className="flex gap-2">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${
                       infraction.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' : 
                       'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                       {infraction.status === 'Sent' ? 'Enviado' : infraction.status}
                    </span>
                    <button 
                       onClick={() => setSelectedInfraction(infraction)}
                       className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                       Detalhes <ChevronRight size={14} />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tudo limpo por aqui!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Parabéns! Você não possui nenhuma notificação ou multa registrada em seu histórico. Continue seguindo as normas do condomínio.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedInfraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className={`p-6 border-b flex justify-between items-start ${
                 selectedInfraction.type === 'fine' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
              }`}>
                 <div className="flex gap-4">
                    <div className={`p-3 rounded-xl h-fit ${
                       selectedInfraction.type === 'fine' ? 'bg-white text-red-600 shadow-sm' : 'bg-white text-amber-600 shadow-sm'
                    }`}>
                       {selectedInfraction.type === 'fine' ? <Ban size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                       <h3 className={`text-xl font-bold ${
                          selectedInfraction.type === 'fine' ? 'text-red-900' : 'text-amber-900'
                       }`}>
                          {selectedInfraction.type === 'fine' ? 'Multa por Infração' : 'Advertência Disciplinar'}
                       </h3>
                       <p className={`text-sm mt-1 ${
                          selectedInfraction.type === 'fine' ? 'text-red-700' : 'text-amber-700'
                       }`}>
                          Ocorrido em: {new Date(selectedInfraction.date).toLocaleDateString('pt-BR')} às {selectedInfraction.time}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedInfraction(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-white/50 rounded-full">
                    <X size={20} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motivo da Ocorrência</h4>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                       {selectedInfraction.reason}
                    </p>
                 </div>

                 {selectedInfraction.article && (
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fundamentação Legal</h4>
                       <div className="flex items-start gap-3 text-slate-600 text-sm">
                          <Gavel size={18} className="mt-0.5 text-slate-400" />
                          <span>{selectedInfraction.article}</span>
                       </div>
                    </div>
                 )}

                 {selectedInfraction.value && (
                    <div className="flex justify-between items-center py-4 border-t border-b border-slate-100">
                       <span className="font-medium text-slate-600">Valor da Multa</span>
                       <span className="text-xl font-bold text-slate-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedInfraction.value)}
                       </span>
                    </div>
                 )}

                 <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg text-blue-800 text-xs leading-relaxed">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>
                       Caso discorde desta notificação, você tem o direito de apresentar recurso em até 15 dias corridos a partir da data de emissão, conforme Capítulo V do Regimento Interno.
                    </p>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                 <button 
                    className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    onClick={() => setSelectedInfraction(null)}
                 >
                    Fechar
                 </button>
                 <button className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
                    Abrir Recurso
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};