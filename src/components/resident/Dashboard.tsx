import React, { useEffect, useState } from 'react';
import { Home, Clock, CheckCircle, MessageSquare, ShieldAlert, Megaphone, FileText, BarChart3, ChevronRight } from 'lucide-react';
import { MOCK_ISSUES, MOCK_ANNOUNCEMENTS } from '../../mock';
import { useAuth } from '../../context/AuthContext';
import { ReservationService, Reservation } from '../../services/reservationService';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Reservations (RLS ensures we only see ours)
        const reservations = await ReservationService.getAll();

        // Find next future reservation
        const now = new Date();
        const futureReservations = reservations
          .filter(r => new Date(r.start_time) > now)
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        if (futureReservations.length > 0) {
          setNextReservation(futureReservations[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusPT = (status: string) => {
    switch (status) {
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
          <h2 className="text-3xl font-bold mb-2">Bem-vinda de volta {(user as any)?.name ? `, ${(user as any).name.split(' ')[0]}` : ''}!</h2>
          <p className="text-emerald-100 mb-6">
            Unidade {(user as any)?.unit?.number || '---'}-{(user as any)?.unit?.block || '-'} • Maison Heights
          </p>
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

          {/* Next Reservation Widget (Dynamic) */}
          {nextReservation && (
            <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div>
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-1">Próxima Reserva</h3>
                <p className="text-xl font-bold text-slate-900">{nextReservation.areaName || 'Área Comum'}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Clock size={16} /> {new Date(nextReservation.start_time).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>{new Date(nextReservation.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(nextReservation.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
                <Clock size={24} />
              </div>
            </div>
          )}

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
              {MOCK_ANNOUNCEMENTS.slice(0, 2).map((ann) => (
                <div key={ann.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase
                       ${ann.type === 'Manutenção' ? 'text-emerald-600 bg-emerald-50' :
                      ann.type === 'Evento' ? 'text-indigo-600 bg-indigo-50' :
                        'text-blue-600 bg-blue-50'}`}>
                    {ann.type}
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-2">{ann.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {ann.description}
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm text-emerald-600 font-medium hover:underline">Ver Todos os Avisos</button>
          </div>
        </div>
      </div>
    </div>
  );
};