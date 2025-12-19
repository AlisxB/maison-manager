import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, X, ShieldAlert } from 'lucide-react';
import { AnnouncementService, Announcement } from '../../services/announcementService';

export const ResidentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await AnnouncementService.getAll();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgente': return 'bg-red-100 text-red-700';
      case 'Evento': return 'bg-purple-100 text-purple-700';
      case 'Manutenção': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando avisos...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mural de Avisos</h2>
        <p className="text-sm text-slate-500 mt-1">Fique por dentro das últimas notícias do condomínio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedAnnouncement(item)}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
              <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
              {item.title}
            </h3>

            <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
              {item.description}
            </p>

            <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ler aviso completo</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
            Nenhum aviso publicado.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">

            {/* Modal Header */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 bg-white/80 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Cover/Header area style */}
              <div className="bg-slate-50 p-8 border-b border-slate-200 pb-6">
                <div className="flex gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getTypeColor(selectedAnnouncement.type)}`}>
                    {selectedAnnouncement.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                    <Calendar size={12} />
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  {selectedAnnouncement.title}
                </h2>
              </div>

              <div className="p-8 space-y-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedAnnouncement.description}
                  </p>

                  {/* Simulated extra content for the modal since the mock is short */}
                  <p className="text-base text-slate-700 leading-relaxed mt-4">
                    Para mais informações, entre em contato com a administração. Agradecemos a compreensão e colaboração de todos os moradores.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3 mt-6">
                  <ShieldAlert className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Importante</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Este aviso foi enviado para: <strong>{selectedAnnouncement.target_audience}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};