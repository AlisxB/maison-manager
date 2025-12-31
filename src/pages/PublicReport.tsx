
import React, { useEffect, useState } from 'react';
import { FinancialService, Transaction, FinancialSummary } from '../services/financialService';
import { ArrowUpRight, ArrowDownRight, DollarSign, Download, Calendar } from 'lucide-react';
import { generateFinancialPDF } from '../utils/pdfGenerator';

export const PublicReport: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [data, setData] = useState<{
        condominium_name: string;
        month: number;
        year: number;
        summary: FinancialSummary;
        transactions: Transaction[];
    } | null>(null);

    useEffect(() => {
        const parts = window.location.pathname.split('/');
        const t = parts[parts.length - 1] || parts[parts.length - 2]; // Handle trailing slash
        if (t) setToken(t);
    }, []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchReport = async () => {
            try {
                const report = await FinancialService.getPublicReport(token);
                setData(report);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Erro ao carregar relatório.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [token]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Carregando relatório seguro...</div>;

    if (error) return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                <i className="fas fa-lock text-2xl"></i>
            </div>
            <h1 className="text-2xl font-black text-red-500 mb-2">Acesso Negado</h1>
            <p className="text-slate-600 max-w-md">{error}</p>
        </div>
    );

    if (!data) return null;

    const currentMonthLabel = new Date(data.year, data.month - 1).toLocaleString('pt-BR', { month: 'long' });

    return (
        <div className="min-h-screen bg-[#fcfbf9] font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-black text-[#437476] tracking-tight">{data.condominium_name}</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Relatório Financeiro Virtual</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700 capitalize">{currentMonthLabel} {data.year}</p>
                        <p className="text-[10px] text-slate-400">Válido por 7 dias</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-xl"><ArrowUpRight size={20} /></div>
                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">Entradas</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">
                            {data.summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><ArrowDownRight size={20} /></div>
                            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase">Saídas</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">
                            {data.summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">Saldo</span>
                        </div>
                        <h3 className={`text-2xl font-black ${data.summary.balance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                            {data.summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 text-lg">Detalhamento</h3>
                        <button
                            onClick={() => generateFinancialPDF(data.transactions, data.summary, { condominium: { name: data.condominium_name }, month: String(data.month), year: String(data.year) } as any)}
                            className="text-xs font-bold text-[#437476] hover:underline flex items-center gap-1"
                        >
                            <Download size={14} /> Baixar PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.transactions.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs">Sem movimentações.</td></tr>
                                ) : (
                                    data.transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-400 text-xs">
                                                {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {t.description}
                                                {t.observation && <span className="block text-[10px] text-slate-400 font-normal italic">{t.observation}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">{t.category}</span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest pb-8">
                    Powered by Maison Manager • {new Date().getFullYear()}
                </footer>
            </main>
        </div>
    );
};
