import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Lock,
    Calendar,
    Clock,
    PlusCircle,
    X,
    Unlock,
    User,
    ChevronDown,
    Info,
    CalendarDays,
    List as ListIcon,
    Search,
    Filter,
    Trash2,
    Ban,
    CheckCircle
} from 'lucide-react';
import { ReservationService, CommonAreaService, Reservation, CommonArea } from '../../services/reservationService';
import { UserService, User as UserType } from '../../services/userService';

// Helper para formatar data
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const AdminReservations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Data from API
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
    const [residents, setResidents] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado inicial de datas bloqueadas (será populado pela API)
    const [blockedDates, setBlockedDates] = useState<{ date: string, reason: string, areaId?: string }[]>([]);

    // Estados de Controle de Modais
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [isManualReservationModalOpen, setIsManualReservationModalOpen] = useState(false);
    const [isActionChoiceModalOpen, setIsActionChoiceModalOpen] = useState(false);

    // Estados de Dados Selecionados
    const [selectedDateStr, setSelectedDateStr] = useState<string>('');
    const [blockForm, setBlockForm] = useState<{ reason: string, commonAreaIds: string[] }>({ reason: '', commonAreaIds: [] });

    // Estado do Formulário de Reserva Manual
    const [manualResForm, setManualResForm] = useState({
        residentId: '',
        commonAreaId: '',
        date: '',
        startTime: '12:00',
        endTime: '18:00'
    });

    // Calendar Helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getMonthLabel = () => {
        return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    // Load Data
    const loadData = async () => {
        try {
            setLoading(true);
            const [resData, areasData, usersData] = await Promise.all([
                ReservationService.getAll(),
                CommonAreaService.getAll(),
                UserService.getAll()
            ]);

            // Enrich Reservations & Populate Blocked Dates
            const blocks: { date: string, reason: string, areaId?: string }[] = [];
            const enrichedReservations = resData.map(r => {
                const area = areasData.find(a => a.id === r.common_area_id);
                const user = usersData.find(u => u.id === r.user_id);

                if (r.status === 'BLOCKED') {
                    const dateStr = new Date(r.start_time).toLocaleDateString('pt-BR').split('/').reverse().join('-');
                    blocks.push({ date: dateStr, reason: r.reason || 'Bloqueado', areaId: r.common_area_id });
                }

                return {
                    ...r,
                    areaName: area?.name || 'Área Desconhecida',
                    residentName: user?.name || r.user_id,
                    unit: user?.unit_id ? 'Unidade' : '-'
                };
            });

            setReservations(enrichedReservations);
            setBlockedDates(blocks);
            setCommonAreas(areasData);
            setResidents(usersData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Lógica Central de Clique na Data do Calendário
    const handleDateClick = (day: number) => {
        const fullDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Sempre abre o modal de escolha de ação, permitindo desbloqueio ou nova reserva manual
        setSelectedDateStr(fullDateStr);
        setIsActionChoiceModalOpen(true);
    };

    const handleConfirmBlock = async () => {
        if (selectedDateStr && blockForm.reason && blockForm.commonAreaIds.length > 0) {
            try {
                // Create Blocked Reservation for EACH selected area
                const startDate = new Date(`${selectedDateStr}T00:00:00`);
                const endDate = new Date(`${selectedDateStr}T23:59:59`);

                await Promise.all(blockForm.commonAreaIds.map(areaId =>
                    ReservationService.create({
                        common_area_id: areaId,
                        start_time: startDate.toISOString(),
                        end_time: endDate.toISOString(),
                        status: 'BLOCKED',
                        reason: blockForm.reason
                    })
                ));

                alert('Áreas bloqueadas com sucesso!');
                setIsBlockModalOpen(false);
                setBlockForm({ reason: '', commonAreaIds: [] });
                setSelectedDateStr('');
                loadData();
            } catch (error) {
                console.error(error);
                alert('Erro ao bloquear data.');
            }
        }
    };

    const handleConfirmUnlock = async () => {
        if (selectedDateStr) {
            // Find the blocked reservation(s) for this date and cancel it
            const blocks = reservations.filter(r =>
                r.status === 'BLOCKED' &&
                new Date(r.start_time).toLocaleDateString('pt-BR').split('/').reverse().join('-') === selectedDateStr
            );

            if (blocks.length > 0) {
                try {
                    await Promise.all(blocks.map(b => ReservationService.updateStatus(b.id, 'CANCELLED')));
                    alert(`Data ${formatDate(selectedDateStr)} desbloqueada com sucesso!`);
                    setIsUnlockModalOpen(false);
                    loadData();
                } catch (error) {
                    alert("Erro ao desbloquear.");
                }
            }
        }
    };

    const handleManualReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Check if THIS SPECIFIC AREA is blocked on this date
            const isBlocked = blockedDates.find(d => d.date === manualResForm.date && d.areaId === manualResForm.commonAreaId);
            if (isBlocked) {
                alert(`Esta área está bloqueada nesta data: ${isBlocked.reason}`);
                return;
            }

            // Creates Date objects treating the input as Local Time (Browser default)
            const startDate = new Date(`${manualResForm.date}T${manualResForm.startTime}:00`);
            const endDate = new Date(`${manualResForm.date}T${manualResForm.endTime}:00`);

            const payload = {
                common_area_id: manualResForm.commonAreaId,
                // Send as ISO String (UTC) to ensure backend stores the correct absolute time
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                user_id: manualResForm.residentId || undefined
            };

            await ReservationService.create(payload);

            alert('Reserva criada com sucesso!');
            setIsManualReservationModalOpen(false);
            loadData();
            loadData();
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 409) {
                alert('Erro: Já existe uma reserva confirmada ou pendente para este horário.');
            } else {
                alert('Erro ao criar reserva.');
            }
        }
    };

    const openManualReservation = () => {
        setIsActionChoiceModalOpen(false);
        setManualResForm(prev => ({
            ...prev,
            date: selectedDateStr || '2025-12-17',
            commonAreaId: commonAreas[0]?.id || ''
        }));
        setIsManualReservationModalOpen(true);
    };

    const openBlockModal = () => {
        setIsActionChoiceModalOpen(false);
        setBlockForm({ reason: '', commonAreaIds: [] });
        setIsBlockModalOpen(true);
    };

    // Renderiza o conteúdo visual de cada dia no calendário
    const getDayContent = (day: number) => {
        const fullDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Filter by date string matching (Correcting for timezone by using string comparison on local parts)
        const dayReservations = reservations.filter(r => {
            if (!r.start_time) return false;
            // Assuming API returns enough info, but better to compare local date strings
            const rDate = new Date(r.start_time);
            const rDateStr = rDate.toLocaleDateString('pt-BR').split('/').reverse().join('-'); // YYYY-MM-DD local
            // Or simpler: match ISO substring if we trust it, but we corrected to use local->UTC submit. 
            // Let's stick to string comparison of the YYYY-MM-DD part based on the object's localized view.
            return r.start_time.startsWith(fullDateStr) || rDate.toISOString().startsWith(fullDateStr);
        });

        const isBlocked = blockedDates.find(d => d.date === fullDateStr);

        if (isBlocked) {
            return (
                <div
                    className="h-full flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg text-red-500 group relative cursor-pointer hover:bg-red-100 transition-all shadow-inner"
                    onClick={() => handleDateClick(day)}
                >
                    <Lock size={16} className="group-hover:hidden" />
                    <Unlock size={18} className="hidden group-hover:block text-red-600 animate-in fade-in" />
                    <span className="text-[10px] font-bold mt-1 text-center px-1 truncate w-full uppercase">{isBlocked.reason}</span>
                </div>
            );
        }

        return (
            <div
                className={`h-full border border-slate-200 rounded-lg p-2 flex flex-col hover:border-[#437476] hover:bg-slate-50 transition-all bg-white cursor-pointer group shadow-sm`}
                onClick={() => handleDateClick(day)}
            >
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-400 text-xs group-hover:text-[#437476]">{day}</span>
                    {dayReservations.length > 0 && (
                        <span className="w-2 h-2 bg-[#437476] rounded-full"></span>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-slate-600">
                    {dayReservations.map(r => (
                        <div key={r.id} className={`px-1 py-0.5 rounded text-[9px] font-medium truncate border ${r.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                            r.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {r.areaName?.split(' ')[0] || 'Area'}
                        </div>
                    ))}
                    {dayReservations.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlusCircle size={14} className="text-[#437476] opacity-40" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando Reservas...</div>;

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Gestão de Áreas Comuns</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie a disponibilidade e visualize o histórico de reservas.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => { setSelectedDateStr(''); setIsBlockModalOpen(true); }}
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Ban size={16} /> Bloquear Data
                    </button>
                    <button
                        onClick={() => { setSelectedDateStr(''); setIsManualReservationModalOpen(true); }}
                        className="flex-1 md:flex-none px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#437476]/20"
                    >
                        <PlusCircle size={16} /> Reserva Manual
                    </button>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white text-[#437476] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarDays size={18} /> Calendário
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-[#437476] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ListIcon size={18} /> Reservas Realizadas
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {activeTab === 'calendar' ? (
                        <div className="bg-[#fcfbf9] p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[700px] animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#437476] text-white rounded-xl shadow-lg shadow-[#437476]/20">
                                        <CalendarDays size={20} />
                                    </div>
                                    <h3 className="font-black text-slate-700 text-xl capitalize">{getMonthLabel()}</h3>
                                </div>
                                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronLeft size={20} /></button>
                                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-3 text-center mb-4">
                                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
                                    <div key={d} className="text-[10px] font-black text-slate-400 py-1 tracking-widest uppercase">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-3 flex-1">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-transparent"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => (
                                    <div key={i} className="h-full min-h-[90px]">
                                        {getDayContent(i + 1)}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-6 text-[11px] font-black text-slate-400 justify-end border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-200 rounded shadow-sm"></div> DISPONÍVEL</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-50 border border-red-200 rounded shadow-sm"></div> BLOQUEADO</div>
                                <div className="flex items-center gap-2 text-[#437476] bg-emerald-50 px-2 py-0.5 rounded"> CLIQUE PARA AÇÃO</div>
                            </div>
                        </div>
                    ) : (
                        /* List View: Reservas Realizadas */
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[700px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Todas as Reservas</h3>
                                    <p className="text-sm text-slate-500 font-medium">Histórico e controle de agendamentos realizados pelos moradores.</p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar morador ou área..."
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476]"
                                        />
                                    </div>
                                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-widest sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4">Morador</th>
                                            <th className="px-6 py-4">Área</th>
                                            <th className="px-6 py-4">Data/Hora</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reservations.map((res) => (
                                            <tr key={res.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase">
                                                            {(res.residentName || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-700 leading-tight group-hover:text-[#437476] transition-colors">{res.residentName}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{res.unit}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-600">{res.areaName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-[11px] font-medium">
                                                        <span className="text-slate-700 font-bold">{new Date(res.start_time).toLocaleDateString('pt-BR')}</span>
                                                        <span className="text-slate-400">
                                                            {new Date(res.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -
                                                            {new Date(res.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${res.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        res.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => alert(`Detalhes da Reserva:\n\nÁrea: ${res.areaName}\nMorador: ${res.residentName}\nData: ${new Date(res.start_time).toLocaleString()}\nStatus: ${res.status}`)}
                                                            className="p-2 text-slate-400 hover:text-[#437476] hover:bg-white rounded-lg transition-all"
                                                            title="Ver Detalhes"
                                                        >
                                                            <Info size={16} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm('Tem certeza que deseja CANCELAR esta reserva?')) return;
                                                                try {
                                                                    await ReservationService.updateStatus(res.id, 'CANCELLED');
                                                                    loadData();
                                                                } catch (e) { alert('Erro ao cancelar'); }
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Cancelar Reserva"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar de Solicitações */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-black text-slate-700 flex items-center gap-2">
                                <Clock size={18} className="text-amber-500" /> Aprovações Pendentes
                            </h3>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-5 space-y-4 flex-1">
                            {reservations.filter(r => r.status === 'PENDING').length > 0 ? (
                                reservations.filter(r => r.status === 'PENDING').map(res => (
                                    <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-[#437476] transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-black text-[#437476] text-[10px] uppercase tracking-wider">{res.areaName}</span>
                                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">Solicitado</span>
                                        </div>
                                        <div className="space-y-2 mb-4 text-slate-600">
                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                <Calendar size={12} className="text-slate-400" /> {new Date(res.start_time).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Clock size={12} className="text-slate-400" />
                                                {new Date(res.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(res.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <User size={12} className="text-slate-400" /> {res.residentName}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await ReservationService.updateStatus(res.id, 'CONFIRMED');
                                                        loadData();
                                                    } catch (e) { alert('Erro ao aprovar'); }
                                                }}
                                                className="flex-1 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 transition-colors uppercase tracking-wide"
                                            >
                                                Aprovar
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await ReservationService.updateStatus(res.id, 'REJECTED');
                                                        loadData();
                                                    } catch (e) { alert('Erro ao recusar'); }
                                                }}
                                                className="flex-1 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide"
                                            >
                                                Recusar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-sm italic">
                                    Nenhuma pendência.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE ESCOLHA DE AÇÃO */}
            {isActionChoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
                        <button onClick={() => setIsActionChoiceModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10 p-2"><X size={20} /></button>
                        <div className="px-8 py-10 text-center">
                            <div className="w-16 h-16 bg-[#437476]/10 text-[#437476] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#437476]/5"><Calendar size={32} /></div>
                            <h3 className="text-xl font-black text-slate-700 mb-2">
                                {selectedDateStr ? formatDate(selectedDateStr) : 'Data Selecionada'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-8">O que deseja realizar nesta data?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={openManualReservation} className="w-full py-4 bg-[#437476] text-white font-black rounded-2xl hover:bg-[#365e5f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#437476]/20 uppercase tracking-widest text-[10px]">
                                    <PlusCircle size={16} /> Realizar Reserva
                                </button>
                                <button onClick={openBlockModal} className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                    <Ban size={16} /> Bloquear Data
                                </button>
                                {blockedDates.some(b => b.date === selectedDateStr) && (
                                    <button onClick={() => { setIsActionChoiceModalOpen(false); setIsUnlockModalOpen(true); }} className="w-full py-4 bg-red-50 text-red-600 border border-red-100 font-black rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                        <Unlock size={16} /> Desbloquear Data
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE BLOQUEIO */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
                        <button onClick={() => setIsBlockModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10 p-2 bg-white rounded-full shadow-sm"><X size={20} /></button>
                        <div className="px-8 py-8">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="p-4 bg-red-100 text-red-600 rounded-2xl shadow-lg shadow-red-100"><Ban size={32} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-700 tracking-tight">Bloquear Data</h3>
                                    <p className="text-sm text-slate-500 font-medium">Indisponibilizar área comum para reservas.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Áreas a Bloquear</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                        {commonAreas.map(area => (
                                            <label key={area.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-slate-300 shadow-sm transition-all checked:border-[#437476] checked:bg-[#437476]"
                                                        checked={blockForm.commonAreaIds.includes(area.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setBlockForm(prev => ({ ...prev, commonAreaIds: [...prev.commonAreaIds, area.id] }));
                                                            } else {
                                                                setBlockForm(prev => ({ ...prev, commonAreaIds: prev.commonAreaIds.filter(id => id !== area.id) }));
                                                            }
                                                        }}
                                                    />
                                                    <CheckCircle size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-[#437476]">{area.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Selecione a Data</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-sm"
                                            value={selectedDateStr}
                                            onChange={(e) => setSelectedDateStr(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Motivo do Bloqueio</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Ex: Manutenção preventiva, Feriado..."
                                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all shadow-sm"
                                            value={blockForm.reason}
                                            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button onClick={handleConfirmBlock} disabled={!blockForm.reason || !selectedDateStr || blockForm.commonAreaIds.length === 0} className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all text-[10px] uppercase tracking-widest ${!blockForm.reason || !selectedDateStr || blockForm.commonAreaIds.length === 0 ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-red-600/20'}`}>Confirmar Bloqueio</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE DESBLOQUEIO */}
            {isUnlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
                        <div className="px-8 py-10 text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50/10 border border-emerald-100"><Unlock size={36} /></div>
                            <h3 className="text-2xl font-black text-slate-700 mb-2">Desbloquear?</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                                A data voltará a ficar disponível para reservas de todos os moradores.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleConfirmUnlock} className="w-full py-4 bg-[#437476] text-white font-black rounded-2xl hover:bg-[#365e5f] transition-all shadow-lg shadow-[#437476]/20 uppercase tracking-widest text-[10px]">Sim, Desbloquear Data</button>
                                <button onClick={() => setIsUnlockModalOpen(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE RESERVA MANUAL */}
            {isManualReservationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200">
                        <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-[#437476]">Reserva Manual</h3>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-tighter">Agendamento direto pela administração</p>
                            </div>
                            <button onClick={() => setIsManualReservationModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleManualReservationSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Morador Responsável</label>
                                <div className="relative group">
                                    <select
                                        required
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] appearance-none shadow-sm transition-all"
                                        value={manualResForm.residentId}
                                        onChange={e => setManualResForm({ ...manualResForm, residentId: e.target.value })}
                                    >
                                        <option value="">Selecione o morador...</option>
                                        {residents.map(r => <option key={r.id} value={r.id}>{r.name} - {r.unit_id ? 'Residente' : 'Admin'}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Área Comum</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] appearance-none shadow-sm transition-all"
                                            value={manualResForm.commonAreaId}
                                            onChange={e => setManualResForm({ ...manualResForm, commonAreaId: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            {commonAreas.map(area => (
                                                <option key={area.id} value={area.id}>{area.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data do Evento</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] shadow-sm transition-all"
                                            value={manualResForm.date}
                                            onChange={e => setManualResForm({ ...manualResForm, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário Início</label>
                                    <input type="time" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 shadow-sm" value={manualResForm.startTime} onChange={e => setManualResForm({ ...manualResForm, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário Término</label>
                                    <input type="time" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 shadow-sm" value={manualResForm.endTime} onChange={e => setManualResForm({ ...manualResForm, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-3 items-start shadow-sm shadow-blue-50">
                                <Info size={18} className="text-blue-500 mt-0.5" />
                                <p className="text-[10px] text-blue-700 leading-relaxed font-black uppercase tracking-tight">
                                    Esta reserva será registrada no sistema.
                                </p>
                            </div>

                            <button type="submit" className="w-full py-5 bg-[#437476] text-white font-black rounded-2xl hover:bg-[#365e5f] transition-all shadow-xl shadow-[#437476]/20 uppercase tracking-widest text-[11px] mt-2 active:scale-95">Confirmar Reserva Manual</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
