import React, { useEffect, useState } from 'react';
import { Home, Clock, CheckCircle, MessageSquare, ShieldAlert, Megaphone, FileText, BarChart3, ChevronRight, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReservationService, Reservation } from '../../services/reservationService';
import { OccurrenceService, Occurrence, OccurrenceCreate } from '../../services/occurrenceService';
import { AnnouncementService, Announcement } from '../../services/announcementService';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState<OccurrenceCreate>({
    title: '',
    description: '',
    category: 'Maintenance'
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch Reservations, Occurrences and Announcements independently
      const results = await Promise.allSettled([
        ReservationService.getAll(),
        OccurrenceService.getAll(),
        AnnouncementService.getAll()
      ]);

      if (results[0].status === 'fulfilled') {
        const reservations = results[0].value;
        // Find next future reservation
        const now = new Date();
        const futureReservations = reservations
          .filter(r => new Date(r.start_time) > now)
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        if (futureReservations.length > 0) {
          setNextReservation(futureReservations[0]);
        }
      } else {
        console.error("Failed to fetch reservations", results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        setOccurrences(results[1].value);
      } else {
        console.error("Failed to fetch occurrences", results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        setAnnouncements(results[2].value);
      } else {
        console.error("Failed to fetch announcements", results[2].reason);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await OccurrenceService.create(reportForm);
      alert("Ocorrência registrada com sucesso!");
      setIsReportModalOpen(false);
      setReportForm({ title: '', description: '', category: 'Maintenance' });
      fetchDashboardData();
    } catch (error) {
      console.error("Error creating occurrence:", error);
      alert("Erro ao registrar ocorrência.");
    }
  };

  const getStatusPT = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'Resolvido';
      case 'IN_PROGRESS': return 'Em Análise';
      case 'OPEN': return 'Aberto';
      case 'CLOSED': return 'Fechado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-50 text-green-600';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600';
      case 'CLOSED': return 'bg-slate-50 text-slate-600';
      default: return 'bg-orange-50 text-orange-600'; // OPEN
    }
  };

  const handleActionClick = (label: string) => {
    if (label === 'Reportar Problema') {
      setIsReportModalOpen(true);
    }
    // Other actions logic...
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
              <button key={i} onClick={() => handleActionClick(action.label)}
                className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon size={24} />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>

          <h3 className="text-lg font-bold text-slate-900 pt-4">Minha Atividade Recente (Ocorrências)</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {occurrences.length > 0 ? occurrences.slice(0, 5).map(issue => (
              <div key={issue.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={`p-2 rounded-lg ${getStatusColor(issue.status)}`}>
                    {issue.status === 'RESOLVED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(issue.created_at).toLocaleDateString()} • {issue.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 hidden sm:block">
                    {getStatusPT(issue.status)}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhuma atividade recente.</div>
            )}
          </div>
        </div>

        {/* Notices Sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Mural da Comunidade</h3>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
            {/* Decorative top strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>

            <div className="space-y-4">
              {announcements.length > 0 ? announcements.slice(0, 2).map((ann) => (
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
              )) : (
                <div className="text-center text-slate-500 text-sm py-4">Nenhum aviso no momento.</div>
              )}
            </div>
            <button className="w-full text-center text-sm text-emerald-600 font-medium hover:underline">Ver Todos os Avisos</button>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Reportar Problema</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vazamento na garagem"
                  value={reportForm.title}
                  onChange={e => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Categoria</label>
                <select
                  value={reportForm.category}
                  onChange={e => setReportForm({ ...reportForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Maintenance">Manutenção</option>
                  <option value="Noise">Barulho / Silêncio</option>
                  <option value="Security">Segurança</option>
                  <option value="Other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição Detalhada</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva o problema com detalhes..."
                  value={reportForm.description}
                  onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                  <CheckCircle size={18} /> Registrar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};