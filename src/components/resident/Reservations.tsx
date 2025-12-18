import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Lock, Check, ShieldAlert, Clock, User, Phone, AlertCircle, X } from 'lucide-react';
import { MOCK_RESERVATIONS, MOCK_BLOCKED_DATES } from '../../mock';
import { Reservation } from '../../types';

export const ResidentReservations: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [myReservations, setMyReservations] = useState<Reservation[]>(MOCK_RESERVATIONS.filter(r => r.residentName === 'Alice Freeman'));
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Blocked Reason State
  const [blockedInfo, setBlockedInfo] = useState<{isOpen: boolean, date: number | null, reason: string}>({
    isOpen: false,
    date: null,
    reason: ''
  });

  // Form Data
  const [formData, setFormData] = useState({
    responsible: 'Alice Freeman',
    phone: '(555) 123-4567',
    startTime: '',
    endTime: ''
  });

  // Calendar Logic (December 2025)
  const daysInMonth = 31;
  const paddingDays = 1; // Dec 1 2025 is Monday

  // Check if a date is blocked by admin
  const isBlocked = (day: number) => MOCK_BLOCKED_DATES.some(d => d.date === day);

  const handleDateClick = (day: number) => {
    // Check if blocked
    const blockedDateObj = MOCK_BLOCKED_DATES.find(d => d.date === day);
    
    if (blockedDateObj) {
      // Show blocking reason
      setBlockedInfo({
        isOpen: true,
        date: day,
        reason: blockedDateObj.reason
      });
    } else {
      // Allow selection
      setSelectedDate(day);
    }
  };

  const handleOpenForm = () => {
    if (selectedDate) {
      setIsFormModalOpen(true);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirm = () => {
    // Add reservation logic
    const newReservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      area: 'Deck com Churrasqueira', // Default for this view
      date: `2025-12-${selectedDate?.toString().padStart(2, '0')}`,
      time: `${formData.startTime} - ${formData.endTime}`,
      status: 'Pending',
      residentName: formData.responsible,
      unit: '101-A'
    };
    
    setMyReservations([newReservation, ...myReservations]);
    setIsConfirmModalOpen(false);
    setSelectedDate(null);
    setFormData({ responsible: 'Alice Freeman', phone: '(555) 123-4567', startTime: '', endTime: '' });
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < paddingDays; i++) {
      days.push(<div key={`pad-${i}`} className="h-10"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const blocked = isBlocked(i);
      const isSelected = selectedDate === i;
      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sm font-medium transition-all
            ${blocked 
              ? 'bg-red-50 text-red-400 cursor-pointer hover:bg-red-100 hover:text-red-500 border border-red-100' 
              : isSelected 
                ? 'bg-[#437476] text-white shadow-md transform scale-105' 
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
        >
          {blocked ? <Lock size={14} /> : i}
        </button>
      );
    }
    return days;
  };

  const getStatusPT = (status: string) => {
     switch(status) {
        case 'Confirmed': return 'Confirmado';
        case 'Rejected': return 'Rejeitado';
        case 'Pending': return 'Pendente';
        default: return status;
     }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reservar Deck e Churrasqueira</h2>
          <p className="text-sm text-slate-500 mt-1">Verifique a disponibilidade e agende seu evento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-600" />
              Dezembro 2025
            </h3>
            <div className="flex gap-1">
               <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronLeft size={20} /></button>
               <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronRight size={20} /></button>
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
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-100"></div>Indisponível</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#437476]"></div>Selecionado</div>
          </div>

          <button 
            disabled={!selectedDate}
            onClick={handleOpenForm}
            className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm
              ${selectedDate 
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {selectedDate ? <Check size={18} /> : <Clock size={18} />}
            {selectedDate ? `Reservar dia ${selectedDate}/12` : 'Selecione uma data'}
          </button>
        </div>

        {/* Rules / Info Section */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
           <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={20} /> Regras de Uso
           </h3>
           <ul className="space-y-4 text-sm text-emerald-800/80">
              <li className="flex gap-3 items-start">
                 <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                 As reservas devem ser feitas com no mínimo 48h de antecedência.
              </li>
              <li className="flex gap-3 items-start">
                 <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                 Horário limite para som alto: 22h00 (Lei do Silêncio).
              </li>
              <li className="flex gap-3 items-start">
                 <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                 Taxa de limpeza de R$ 80,00 será cobrada no boleto do condomínio.
              </li>
              <li className="flex gap-3 items-start">
                 <span className="bg-emerald-100 text-emerald-600 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">4</span>
                 Capacidade máxima de 30 pessoas para a área da churrasqueira.
              </li>
           </ul>
        </div>
      </div>

      {/* My Reservations Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Minhas Reservas</h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {myReservations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myReservations.map((res) => (
                <div key={res.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{res.area}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar size={14} /> {new Date(res.date).toLocaleDateString('pt-BR')}
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        {res.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        res.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {getStatusPT(res.status)}
                    </span>
                    {res.status === 'Pending' && (
                        <button className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">
                           Cancelar
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
               <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
               <p>Você não possui reservas futuras.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
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
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 mb-2">
                    <Calendar size={20} className="flex-shrink-0" />
                    <div>
                       <p className="text-xs uppercase font-bold text-emerald-600">Data Selecionada</p>
                       <p className="font-medium text-sm">Dia {selectedDate} de Dezembro de 2025</p>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Responsável</label>
                    <div className="relative">
                       <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                       <input 
                          type="text" 
                          required
                          value={formData.responsible}
                          onChange={e => setFormData({...formData, responsible: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Telefone de Contato</label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-3 top-2.5 text-slate-400" />
                       <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Horário Início</label>
                       <input 
                          type="time" 
                          required
                          value={formData.startTime}
                          onChange={e => setFormData({...formData, startTime: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Horário Fim</label>
                       <input 
                          type="time" 
                          required
                          value={formData.endTime}
                          onChange={e => setFormData({...formData, endTime: e.target.value})}
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

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar Reserva?</h3>
               <p className="text-sm text-slate-500 mb-6">
                  Você está solicitando a reserva do Deck para o dia <strong>{selectedDate}/12</strong> das <strong>{formData.startTime}</strong> às <strong>{formData.endTime}</strong>.
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

      {/* Blocked Reason Modal */}
      {blockedInfo.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
               <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Data Indisponível</h3>
               <p className="text-sm text-slate-500 mb-4">
                  O dia <strong>{blockedInfo.date}/12</strong> está bloqueado para reservas.
               </p>
               
               <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-6">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Motivo</p>
                  <p className="text-sm font-medium text-slate-800">{blockedInfo.reason}</p>
               </div>
               
               <button 
                  onClick={() => setBlockedInfo({ ...blockedInfo, isOpen: false })}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
               >
                  Entendi
               </button>
            </div>
         </div>
      )}
    </div>
  );
};