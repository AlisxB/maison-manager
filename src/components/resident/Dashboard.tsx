import React from 'react';
import { Home, Clock, CheckCircle, MessageSquare, ShieldAlert, Megaphone, FileText, BarChart3, ChevronRight } from 'lucide-react';
import { MOCK_ISSUES } from '../../mock';

export const ResidentDashboard: React.FC = () => {
  const getStatusPT = (status: string) => {
    switch(status) {
      case 'Resolved': return 'Resolvido';
      case 'In Progress': return 'Em Análise';
      case 'Open': return 'Aberto';
      default: return status;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Bem-vinda de volta, Alice!</h2>
          <p className="text-emerald-100 mb-6">Unidade 101-A • Maison Heights</p>
          <div className="flex gap-3">
            <button className="bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-sm">
              Pagar Condomínio
            </button>
            <button className="bg-emerald-700/50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors backdrop-blur-sm">
              Regimento Interno
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <Home size={240} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Reportar Problema', icon: MessageSquare, color: 'bg-orange-100 text-orange-600' },
              { label: 'Reservar Área', icon: Clock, color: 'bg-blue-100 text-blue-600' },
              { label: 'Notificar Intercorrência', icon: ShieldAlert, color: 'bg-purple-100 text-purple-600' },
              { label: 'Avisos', icon: Megaphone, color: 'bg-green-100 text-green-600' },
              { label: 'Documentos', icon: FileText, color: 'bg-slate-100 text-slate-600' },
              { label: 'Consumo', icon: BarChart3, color: 'bg-cyan-100 text-cyan-600' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon size={24} />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>

          <h3 className="text-lg font-bold text-slate-900 pt-4">Minha Atividade Recente</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {MOCK_ISSUES.slice(0, 2).map(issue => (
              <div key={issue.id} className="p-4 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className={`p-2 rounded-lg ${issue.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {issue.status === 'Resolved' ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                    <p className="text-xs text-slate-500">Atualizado em {issue.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-xs font-medium text-slate-500 hidden sm:block">
                     {getStatusPT(issue.status)}
                   </span>
                   <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices Sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Mural da Comunidade</h3>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
             {/* Decorative top strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
            
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Manutenção</span>
                <h4 className="font-semibold text-slate-900 mt-2">Manutenção da Piscina</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  A piscina principal estará fechada para limpeza nesta terça-feira, das 08h às 14h.
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Evento</span>
                <h4 className="font-semibold text-slate-900 mt-2">Churrasco de Verão</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Junte-se a nós no terraço neste sábado! Bebidas e petiscos por conta da casa.
                </p>
              </div>
            </div>
            <button className="w-full text-center text-sm text-emerald-600 font-medium hover:underline">Ver Todos os Avisos</button>
          </div>
        </div>
      </div>
    </div>
  );
};