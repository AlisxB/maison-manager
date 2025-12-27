import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Lock, Check, ShieldAlert, Clock, User, Phone, AlertCircle, X, MapPin, Users, Ban, Info } from 'lucide-react';
import { ReservationService, Reservation, CommonAreaService, CommonArea, ReservationCreate } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

export const ResidentReservations: React.FC = () => {
   const { user } = useAuth();
   const [selectedDate, setSelectedDate] = useState<number | null>(null);
   const [myReservations, setMyReservations] = useState<Reservation[]>([]);
   const [allReservations, setAllReservations] = useState<Reservation[]>([]);
   const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);

   // Selection State
   const [viewMode, setViewMode] = useState<'GALLERY' | 'CALENDAR'>('GALLERY');
   const [selectedAreaId, setSelectedAreaId] = useState<string>('');

   // UI States
   const [loading, setLoading] = useState(true);
   const [isFormModalOpen, setIsFormModalOpen] = useState(false);
   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
   const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
   const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);
   const [blockedReason, setBlockedReason] = useState<string | null>(null); // For blocked dates toast/modal

   // Form Data
   const [formData, setFormData] = useState({
      responsible: user?.name || '',
      phone: '',
      startTime: '',
      endTime: ''
   });

   useEffect(() => {
      fetchInitialData();
   }, []);

   const fetchInitialData = async () => {
      try {
         setLoading(true);
         const [areas, reservations] = await Promise.all([
            CommonAreaService.getAll(),
            ReservationService.getAll()
         ]);
         setCommonAreas(areas);
         // With new RLS policy, 'reservations' contains ALL reservations for the condo
         setAllReservations(reservations);
         // Filter 'my' reservations for finding user's own items
         setMyReservations(reservations.filter(r => r.user_id === user?.id).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
      } catch (error) {
         console.error("Error fetching data:", error);
      } finally {
         setLoading(false);
      }
   };

   const getArea = (id: string) => commonAreas.find(a => a.id === id);

   // Calendar Logic 
   const date = new Date();
   const currentMonth = date.getMonth(); // 0-11
   const currentYear = date.getFullYear();
   const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
   const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)

   const findBlockingReservation = (day: number) => {
      if (!selectedAreaId) return null;
      return allReservations.find(r => {
         const resDate = new Date(r.start_time);
         return r.common_area_id === selectedAreaId &&
            (r.status === 'CONFIRMADO' || r.status === 'BLOQUEADO') &&
            resDate.getDate() === day &&
            resDate.getMonth() === currentMonth;
      });
   };

   const handleDateClick = (day: number) => {
      const blockingRes = findBlockingReservation(day);
      if (blockingRes) {
         if (blockingRes.status === 'BLOQUEADO') {
            setBlockedReason(`Data Bloqueada: ${blockingRes.reason || 'Manutenção/Outro'}`);
         } else {
            setBlockedReason(`Esta data já possui uma reserva confirmada.`);
         }
         setTimeout(() => setBlockedReason(null), 3000);
         return;
      }
      setSelectedDate(day);
   };

   const handleSelectArea = (areaId: string) => {
      setSelectedAreaId(areaId);
      setViewMode('CALENDAR');
      setSelectedDate(null);
   };

   const handleBackToGallery = () => {
      setViewMode('GALLERY');
      setSelectedAreaId('');
      setSelectedDate(null);
   };

   const handlePreSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsFormModalOpen(false);
      setIsConfirmModalOpen(true);
   };

   const handleFinalConfirm = async () => {
      if (!selectedDate || !selectedAreaId) return;

      try {
         // Create Date objects in local time
         const start = new Date(currentYear, currentMonth, selectedDate,
            parseInt(formData.startTime.split(':')[0]),
            parseInt(formData.startTime.split(':')[1]));

         const end = new Date(currentYear, currentMonth, selectedDate,
            parseInt(formData.endTime.split(':')[0]),
            parseInt(formData.endTime.split(':')[1]));

         const startDateTime = start.toISOString();
         const endDateTime = end.toISOString();

         const payload: ReservationCreate = {
            common_area_id: selectedAreaId,
            start_time: startDateTime,
            end_time: endDateTime
         };

         await ReservationService.create(payload);

         // Refresh list
         fetchInitialData();

         setIsConfirmModalOpen(false);
         setSelectedDate(null);
         setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
         alert("Reserva solicitada com sucesso!");

      } catch (error: any) {
         console.error("Failed to create reservation:", error);
         setErrorMsg("Erro ao criar reserva. Verifique se o horário já está ocupado.");
         setIsConfirmModalOpen(false);
         setIsFormModalOpen(true);
      }
   };

   // Cancel Logic
   const handleInitCancel = (id: string) => {
      setReservationToCancel(id);
      setIsCancelModalOpen(true);
   };

   const handleConfirmCancel = async () => {
      if (!reservationToCancel) return;
      try {
         await ReservationService.updateStatus(reservationToCancel, 'CANCELADO');
         fetchInitialData();
         setIsCancelModalOpen(false);
         setReservationToCancel(null);
      } catch (error: any) {
         console.error("Error cancelling reservation:", error);
         const msg = error.response?.data?.detail || "Erro ao cancelar reserva.";
         setErrorMsg(msg);
         alert(msg); // Ensure user sees it
      }
   };

   const renderCalendarDays = () => {
      const days = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
         days.push(<div key={`pad-${i}`} className="h-10"></div>);
      }
      for (let i = 1; i <= daysInMonth; i++) {
         const isSelected = selectedDate === i;
         const blockingRes = findBlockingReservation(i);
         const isBlocked = !!blockingRes;
         const isAdminBlock = blockingRes?.status === 'BLOQUEADO';

         // Past Date Check
         const today = new Date();
         const isPast = i < today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

         const isMyReservation = myReservations.some(r => {
            const d = new Date(r.start_time);
            return r.common_area_id === selectedAreaId && d.getDate() === i && d.getMonth() === currentMonth;
         });

         days.push(
            <button
               key={i}
               disabled={isPast || isBlocked || isAdminBlock}
               onClick={() => !isPast && handleDateClick(i)}
               className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
            ${isMyReservation
                     ? 'bg-blue-50 text-blue-600 border border-blue-200'
                     : isAdminBlock
                        ? 'bg-red-50 text-red-400 border border-red-100 cursor-not-allowed opacity-60'
                        : isBlocked
                           ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                           : isPast
                              ? 'text-slate-300 cursor-not-allowed opacity-50'
                              : isSelected
                                 ? 'bg-[#437476] text-white shadow-md transform scale-105'
                                 : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
            >
               {i}
               {isAdminBlock && (
                  <Lock size={12} className="absolute top-0.5 right-0.5" />
               )}
               {isBlocked && !isAdminBlock && !isMyReservation && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-slate-400 rounded-full border border-white"></span>
               )}
            </button>
         );
      }
      return days;
   };

   if (loading) return <div className="p-8 text-center text-slate-500">Carregando áreas e reservas...</div>;

   return (
      <div className="max-w-5xl mx-auto space-y-8 relative">
         {/* Toast for Blocked Reason */}
         {blockedReason && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
               <Ban size={16} className="text-red-400" /> {blockedReason}
            </div>
         )}

         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-900">Reservas e Áreas Comuns</h2>
               <p className="text-sm text-slate-500 mt-1">Explore, verifique disponibilidade e agende seu momento de lazer.</p>
            </div>
            {viewMode === 'CALENDAR' && (
               <button onClick={handleBackToGallery} className="text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  <ChevronLeft size={16} /> Voltar para lista
               </button>
            )}
         </div>

         {/* VIEW MODE: GALLERY */}
         {viewMode === 'GALLERY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {commonAreas.map(area => (
                  <div key={area.id} onClick={() => handleSelectArea(area.id)}
                     className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group">
                     <div className="h-32 bg-slate-100 relative group-hover:bg-emerald-50 transition-colors flex items-center justify-center">
                        {/* Placeholder Icon based on name? */}
                        <MapPin className="text-slate-300 w-12 h-12 group-hover:text-emerald-300 transition-colors" />
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm text-slate-600">
                           Cap. {area.capacity}
                        </div>
                     </div>
                     <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{area.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                           Aproveite este espaço com sua família e amigos.
                        </p>
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-slate-900">
                              {area.price_per_hour > 0
                                 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(area.price_per_hour) + '/h'
                                 : 'Gratuito'}
                           </span>
                           <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider group-hover:underline">Reservar</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* VIEW MODE: CALENDAR */}
         {viewMode === 'CALENDAR' && selectedAreaId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Calendar Section */}
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-emerald-600" />
                        {monthNames[currentMonth]} {currentYear}
                     </h3>
                     <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {getArea(selectedAreaId)?.name}
                     </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-2 text-center">
                     {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <span key={i} className="text-xs font-bold text-slate-400">{d}</span>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-6">
                     {renderCalendarDays()}
                  </div>

                  <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mb-6">
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div>Disponível</div>
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200 relative"><div className="absolute top-0 right-0 w-1.5 h-1.5 bg-slate-400 rounded-full border border-white"></div></div>Ocupado</div>
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-100 border border-red-200"></div>Bloqueado</div>
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#437476]"></div>Selecionado</div>
                  </div>

                  <button
                     disabled={!selectedDate}
                     onClick={() => setIsFormModalOpen(true)}
                     className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm
                   ${selectedDate
                           ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'
                           : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                     {selectedDate ? <Check size={18} /> : <Clock size={18} />}
                     {selectedDate ? `Reservar dia ${selectedDate}` : 'Selecione uma data'}
                  </button>
               </div>

               {/* Rules / Info Section */}
               <div className="space-y-6">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                     <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <ShieldAlert size={20} /> Regras de Uso
                     </h3>
                     <ul className="space-y-4 text-sm text-emerald-800/80">
                        <li className="flex gap-3 items-start">
                           <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                           Verifique a disponibilidade. Se o horário estiver ocupado, sua reserva será rejeitada.
                        </li>
                        <li className="flex gap-3 items-start">
                           <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                           Horário limite para som alto: 22h00 (Lei do Silêncio).
                        </li>
                     </ul>
                  </div>

                  {/* Quick Stats or Info */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                     <h4 className="font-bold text-slate-800 mb-4">Sobre o Espaço</h4>
                     <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex justify-between">
                           <span>Capacidade:</span>
                           <span className="font-bold">{getArea(selectedAreaId)?.capacity} Pessoas</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Valor:</span>
                           <span className="font-bold">
                              {getArea(selectedAreaId)?.price_per_hour ?
                                 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getArea(selectedAreaId)!.price_per_hour) + '/h'
                                 : 'Gratuito'}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}


         {/* My Reservations Section */}
         <div className="mt-12 border-t border-slate-200 pt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Clock size={24} className="text-emerald-600" /> Meus Agendamentos
            </h3>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               {myReservations.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                     {myReservations.map((res) => {
                        const area = getArea(res.common_area_id);
                        const statusColors = {
                           'CONFIRMADO': 'bg-emerald-100 text-emerald-700',
                           'REJEITADO': 'bg-red-100 text-red-700',
                           'PENDENTE': 'bg-amber-100 text-amber-700',
                           'CANCELADO': 'bg-slate-100 text-slate-500',
                           'BLOQUEADO': 'bg-red-100 text-red-400'
                        };
                        const statusLabels = {
                           'CONFIRMADO': 'Confirmado',
                           'REJEITADO': 'Rejeitado',
                           'PENDENTE': 'Pendente',
                           'CANCELADO': 'Cancelado',
                           'BLOQUEADO': 'Bloqueado'
                        };

                        return (
                           <div key={res.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start gap-4">
                                 <div className={`p-3 rounded-xl ${statusColors[res.status as keyof typeof statusColors] || 'bg-slate-100'}`}>
                                    <Calendar size={24} />
                                 </div>
                                 <div>
                                    <h4 className="text-base font-bold text-slate-900">{area?.name || 'Área Desconhecida'}</h4>
                                    <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                       <span className="flex items-center gap-1">
                                          <Calendar size={14} /> {new Date(res.start_time).toLocaleDateString('pt-BR')}
                                       </span>
                                       <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                                       <span className="flex items-center gap-1">
                                          <Clock size={14} /> {new Date(res.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 self-start sm:self-center">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[res.status as keyof typeof statusColors]}`}>
                                    {statusLabels[res.status as keyof typeof statusLabels] || res.status}
                                 </span>
                                 {(res.status === 'PENDENTE' || res.status === 'CONFIRMADO') && (
                                    <button
                                       onClick={() => handleInitCancel(res.id)}
                                       className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                       title="Cancelar Reserva"
                                    >
                                       <X size={18} />
                                    </button>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="p-12 text-center text-slate-500">
                     <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
                     <p>Você não possui reservas futuras.</p>
                     <button onClick={() => setViewMode('GALLERY')} className="mt-4 text-emerald-600 font-bold hover:underline">
                        Fazer uma reserva agora
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Booking Form Modal & Confirm Modal SAME AS BEFORE ... */}
         {isFormModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="text-lg font-bold text-slate-800">Solicitar Reserva</h3>
                     <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handlePreSubmit} className="p-6 space-y-5">
                     {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                           <AlertCircle size={16} /> {errorMsg}
                        </div>
                     )}

                     <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 mb-2">
                        <Calendar size={20} className="flex-shrink-0" />
                        <div>
                           <p className="text-xs uppercase font-bold text-emerald-600">Data Selecionada</p>
                           <p className="font-medium text-sm">Dia {selectedDate} de {monthNames[currentMonth]} de {currentYear}</p>
                           <p className="text-xs text-slate-500 mt-1">Área: {getArea(selectedAreaId!)?.name}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Horário Início</label>
                           <input
                              type="time"
                              required
                              value={formData.startTime}
                              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Horário Fim</label>
                           <input
                              type="time"
                              required
                              value={formData.endTime}
                              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                           />
                        </div>
                     </div>

                     <div className="pt-2">
                        <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                           Continuar
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {isConfirmModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar Reserva?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                     Você está solicitando a reserva de <strong>{getArea(selectedAreaId!)?.name}</strong> para o dia <strong>{selectedDate}/{currentMonth + 1}</strong> das <strong>{formData.startTime}</strong> às <strong>{formData.endTime}</strong>.
                  </p>

                  <div className="flex gap-3">
                     <button
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                     >
                        Cancelar
                     </button>
                     <button
                        onClick={handleFinalConfirm}
                        className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                     >
                        Confirmar
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Cancel Confirmation Modal */}
         {isCancelModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Cancelar Reserva?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                     Tem certeza que deseja cancelar esta reserva? Essa ação não pode ser desfeita.
                  </p>

                  {errorMsg && (
                     <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2">
                        <AlertCircle size={16} /> {errorMsg}
                     </div>
                  )}

                  <div className="flex gap-3">
                     <button
                        onClick={() => setIsCancelModalOpen(false)}
                        className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                     >
                        Manter
                     </button>
                     <button
                        onClick={handleConfirmCancel}
                        className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
                     >
                        Sim, Cancelar
                     </button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};