import React, { useEffect, useState } from 'react';
import { Landmark, AlertTriangle, Calendar, FileText, Download, CheckCircle, Clock, Search } from 'lucide-react';
import { ViolationService, Violation } from '../../services/violationService';
import { ReservationService, Reservation } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

export const ResidentFinancial: React.FC = () => {
    const { user } = useAuth();
    const [violations, setViolations] = useState<Violation[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinancialData();
    }, [user?.id]);

    const fetchFinancialData = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const [fetchedViolations, fetchedReservations] = await Promise.all([
                ViolationService.getAll({ resident_id: user.id }),
                ReservationService.getAll() // RLS handles filtering for own reservations
            ]);

            // Filter only Payables (FINE type for violations, and maybe confirmed reservations with price?)
            // For now, listing all Fines (WARNINGS don't have amount usually, but we check type)
            // and all Reservations for history.
            setViolations(fetchedViolations);
            setReservations(fetchedReservations);
        } catch (error) {
            console.error("Error fetching financial data:", error);
        } finally {
            setLoading(false);
        }
    };

    // calculate total pending
    const openFines = violations.filter(v => v.type === 'MULTA' && v.status === 'ABERTO').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    // Reservations might not have 'paid' status in this system yet (it just says PENDING/CONFIRMED), defaulting to showing them as items.
    // We'll assume Confirmed reservations are "To Be Paid" or "Paid" depending on business logic. 
    // For this view, we'll list "Items to Pay" as Open Fines.

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Minhas Finanças</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie suas faturas, multas e custos com reservas.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <Landmark size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Fatura Atual</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {/* Mocking generic Condo Fee + Open Fines */}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(1250.00 + openFines)}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Vence em 10/01/2026</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                    <div>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertTriangle size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Multas Pendentes</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(openFines)}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{violations.filter(v => v.type === 'MULTA' && v.status === 'ABERTO').length} infração(ões) em aberto</p>
                    </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center h-40 text-center">
                    <CheckCircle size={32} className="text-emerald-500 mb-2" />
                    <p className="text-emerald-800 font-medium">Todas as faturas anteriores estão pagas!</p>
                </div>
            </div>

            {/* Invoices List (Mocked/Static for now as we lack Bill Service) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-slate-400" />
                        Histórico de Faturas
                    </h3>
                    <button className="text-sm text-emerald-600 font-bold hover:underline">Ver tudo</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {/* Demo Static Items */}
                    {[1, 2].map(m => (
                        <div key={m} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-lg text-slate-500">
                                    <Landmark size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Fatura Mensal - {m === 1 ? 'Novembro' : 'Outubro'}</p>
                                    <p className="text-sm text-slate-400">Vencimento: 10/{m === 1 ? '12' : '11'}/2025</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-900">R$ 1.250,00</span>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">Pago</span>
                                <button className="text-slate-400 hover:text-emerald-600"><Download size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Charges (Reservations & Violations) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Violations List */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-red-50/30">
                        <h3 className="font-bold text-red-900 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Multas e Infrações
                        </h3>
                    </div>
                    {violations.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {violations.map(v => (
                                <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${v.type === 'MULTA' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {v.type === 'MULTA' ? 'Multa' : 'Advertência'}
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(v.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`text-xs font-bold uppercase ${v.status === 'ABERTO' ? 'text-red-500' : 'text-green-500'}`}>
                                            {v.status === 'ABERTO' && 'Em Aberto'}
                                            {v.status === 'PAGO' && 'Pago'}
                                            {v.status === 'RESOLVIDO' && 'Resolvido'}
                                            {!['ABERTO', 'PAGO', 'RESOLVIDO'].includes(v.status) && v.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">{v.description}</p>
                                    {v.type === 'MULTA' && v.amount && (
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                            <span className="text-sm text-slate-500">Valor da Multa</span>
                                            <span className="font-bold text-red-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.amount)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <CheckCircle size={40} className="mx-auto mb-2 text-slate-300" />
                            <p>Nenhuma infração registrada.</p>
                        </div>
                    )}
                </div>

                {/* Recent Reservations (potential costs) */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <Calendar size={20} />
                            Custos de Reservas
                        </h3>
                    </div>
                    {reservations.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {reservations.slice(0, 5).map(r => (
                                <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{r.areaName || 'Área Comum'}</p>
                                        <p className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString()} • {r.start_time.slice(0, 5)}</p>
                                    </div>
                                    <div className="text-right">
                                        {/* Mocking price logic or assuming standard fee if not in model */}
                                        <p className="font-bold text-slate-900">Included</p>
                                        {/* Ideally we fetch price from CommonArea or Reservation if it has 'total_price' */}
                                        <p className="text-xs text-slate-400">
                                            {r.status === 'CONFIRMADO' && 'Confirmado'}
                                            {r.status === 'PENDENTE' && 'Pendente'}
                                            {r.status === 'REJEITADO' && 'Rejeitado'}
                                            {r.status === 'CANCELADO' && 'Cancelado'}
                                            {!['CONFIRMADO', 'PENDENTE', 'REJEITADO', 'CANCELADO'].includes(r.status) && r.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <Calendar size={40} className="mx-auto mb-2 text-slate-300" />
                            <p>Nenhuma reserva com custo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
