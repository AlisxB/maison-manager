import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    AlignLeft,
    Share2,
    FileText,
    Filter,
    ChevronDown,
    Download,
    Trash2
} from 'lucide-react';
import { FinancialService, Transaction, FinancialSummary } from '../../services/financialService';
import { useAuth } from '../../context/AuthContext';
import { useCondominium } from '../../context/CondominiumContext';
import { generateFinancialPDF } from '../../utils/pdfGenerator';

export const AdminFinancial: React.FC = () => {
    const { user } = useAuth();
    const { condominium } = useCondominium();

    // CONSELHO can view but not edit
    const canManage = ['ADMIN', 'SINDICO', 'FINANCEIRO'].includes(user?.role || '');

    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    const currentMonthIdx = new Date().getMonth() + 1; // 1-12
    const currentYearVal = new Date().getFullYear();

    const [filters, setFilters] = useState({
        category: 'Todas as Categorias',
        month: String(currentMonthIdx),
        year: String(currentYearVal)
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<FinancialSummary>({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    const [txForm, setTxForm] = useState({
        type: 'income' as 'income' | 'expense',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        status: 'Paid' as 'paid' | 'pending', // Default to paid? Backend default is paid.
        observation: ''
    });

    const months = [
        { val: '1', label: 'Janeiro' }, { val: '2', label: 'Fevereiro' }, { val: '3', label: 'Março' },
        { val: '4', label: 'Abril' }, { val: '5', label: 'Maio' }, { val: '6', label: 'Junho' },
        { val: '7', label: 'Julho' }, { val: '8', label: 'Agosto' }, { val: '9', label: 'Setembro' },
        { val: '10', label: 'Outubro' }, { val: '11', label: 'Novembro' }, { val: '12', label: 'Dezembro' }
    ];

    const years = ['2023', '2024', '2025', '2026'];
    const categories = ['Todas as Categorias', 'Condomínio', 'Reservas', 'Multas', 'Manutenção', 'Serviços', 'Utilidades', 'Pessoal', 'Gás', 'Energia Elétrica'];

    const incomeCategories = ['Condomínio', 'Reservas', 'Multas', 'Outros'];
    const expenseCategories = ['Manutenção', 'Serviços', 'Utilidades', 'Pessoal', 'Gás', 'Energia Elétrica', 'Outros'];

    const loadData = async () => {
        setLoading(true);
        try {
            const [txData, summaryData] = await Promise.all([
                FinancialService.getAll({
                    month: filters.month,
                    year: filters.year,
                    category: filters.category === 'Todas as Categorias' ? undefined : filters.category
                }),
                FinancialService.getSummary(Number(filters.month), Number(filters.year))
            ]);
            setTransactions(txData);
            setSummary(summaryData);
        } catch (error) {
            console.error("Erro ao carregar financeiro:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const openEditModal = (tx: Transaction) => {
        setEditingId(tx.id);
        setTxForm({
            type: tx.type,
            description: tx.description,
            amount: String(tx.amount),
            date: tx.date, // Assuming date comes as YYYY-MM-DD from getAll or adjusted
            category: tx.category || '',
            status: tx.status,
            observation: tx.observation || ''
        });
        setIsTxModalOpen(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setTxForm({
            type: 'income',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: '',
            status: 'paid',
            observation: ''
        });
        setIsTxModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (!txForm.description || !txForm.amount || !txForm.category) {
                alert('Preencha os campos obrigatórios.');
                return;
            }

            const payload = {
                ...txForm,
                amount: Number(txForm.amount),
                status: txForm.status // txForm.status is already 'paid' or 'pending'
            } as any;

            if (editingId) {
                await FinancialService.update(editingId, {
                    ...txForm,
                    amount: Number(txForm.amount),
                    status: txForm.status as 'paid' | 'pending'
                });
                alert('Transação atualizada!');
            } else {
                await FinancialService.create({
                    ...txForm,
                    amount: Number(txForm.amount),
                    status: txForm.status as 'paid' | 'pending'
                });
                alert('Transação registrada!');
            }

            setIsTxModalOpen(false);
            openNewModal(); // Reset form
            loadData();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar transação.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
        try {
            await FinancialService.delete(id);
            loadData();
        } catch (error) {
            alert('Erro ao excluir.');
        }
    };

    const handleStatusToggle = async (t: Transaction) => {
        if (!canManage) return;
        try {
            const newStatus = t.status === 'paid' ? 'pending' : 'paid';
            await FinancialService.update(t.id, { status: newStatus });
            loadData(); // Refresh list/summary
        } catch (error) {
            alert('Erro ao alterar status.');
        }
    };

    const handleExportPDF = () => {
        generateFinancialPDF(transactions, summary, {
            user,
            condominium,
            month: filters.month,
            year: filters.year
        });
    };

    const [showShareSuccess, setShowShareSuccess] = useState(false);

    const handleShare = async () => {
        const condoName = condominium?.name || 'Maison Manager';
        // const incomeFmt = summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        // const expenseFmt = summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        // const balanceFmt = summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        try {
            const { token, expires_in } = await FinancialService.createShareLink(Number(filters.month), Number(filters.year));
            const shareUrl = `${window.location.origin}/relatorio-financeiro/${token}`;

            const text = `🏢 *${condoName}*\n\n📊 *Resumo Financeiro Virtual - ${currentMonthLabel}/${filters.year}*\n\n🔗 *Acesse o relatório completo aqui:*\n${shareUrl}\n\n⏳ Link válido por ${expires_in}.\n\n_Não é necessário senha._`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `Relatório Financeiro - ${condoName}`,
                        text: text,
                        url: shareUrl
                    });
                } catch (err) {
                    navigator.clipboard.writeText(shareUrl);
                    setShowShareSuccess(true);
                }
            } else {
                navigator.clipboard.writeText(shareUrl);
                setShowShareSuccess(true);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar link de compartilhamento.");
        }
    };

    const currentMonthLabel = months.find(m => m.val === filters.month)?.label.substring(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#437476]">Gestão Financeira</h2>
                    <p className="text-sm text-slate-500 mt-1">Fluxo de caixa, contas a pagar e receber.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                        <Share2 size={16} /> Compartilhar
                    </button>
                    <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                        <FileText size={16} /> Exportar PDF
                    </button>
                    {canManage && (
                        <button
                            onClick={openNewModal}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-bold hover:bg-[#365e5f] shadow-lg shadow-[#437476]/20 transition-all"
                        >
                            <Plus size={16} /> Nova Transação
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-xl"><ArrowUpRight size={20} /></div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Mensal</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Receitas ({currentMonthLabel})</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">
                        {summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 text-red-600 rounded-xl"><ArrowDownRight size={20} /></div>
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Mensal</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Despesas ({currentMonthLabel})</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">
                        {summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Mensal</p>
                    <h3 className={`text-3xl font-black mt-1 ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                        {summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
            </div>

            {/* Transactions Section with Filters */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Transações</h3>
                            <p className="text-sm text-slate-500 font-medium">Histórico detalhado de movimentações.</p>
                        </div>

                        {/* Filters Bar */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 sm:flex-none min-w-[140px]">
                                <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Categoria</label>
                                <select
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476] appearance-none"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative flex-1 sm:flex-none min-w-[120px]">
                                <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mês</label>
                                <select
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476] appearance-none"
                                    value={filters.month}
                                    onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                >
                                    {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative flex-1 sm:flex-none min-w-[100px]">
                                <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ano</label>
                                <select
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476] appearance-none"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">Carregando transações...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma transação encontrada neste período.</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Descrição</th>
                                    <th className="px-8 py-5">Categoria</th>
                                    <th className="px-8 py-5">Data</th>
                                    <th className="px-8 py-5 text-right">Valor</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-black text-slate-700 block group-hover:text-[#437476] transition-colors">{t.description}</span>
                                            {t.observation && <span className="text-xs text-slate-400 italic">{t.observation}</span>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-medium text-slate-400">
                                            {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className={`px-8 py-5 text-right font-black text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button
                                                onClick={() => handleStatusToggle(t)}
                                                disabled={!canManage}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${canManage ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-70'
                                                    } ${t.status === 'paid'
                                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                                        : 'text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100'
                                                    }`}
                                                title={canManage ? "Clique para alterar status" : "Apenas leitura"}
                                            >
                                                {t.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                            {canManage && (
                                                <>
                                                    <button onClick={() => openEditModal(t)} className="p-2 text-slate-300 hover:text-[#437476] hover:bg-slate-100 rounded-lg transition-all" title="Editar">
                                                        <FileText size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isTxModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200/50">
                        <button
                            onClick={() => setIsTxModalOpen(false)}
                            className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm z-10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="px-8 py-10">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingId ? 'Editar Transação' : 'Adicionar Nova Transação'}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">{editingId ? 'Atualize os detalhes da transação.' : 'Preencha os detalhes para registrar uma nova movimentação financeira.'}</p>
                            </div>

                            <div className="space-y-6">
                                {/* Tipo de Transação */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tipo de Transação</label>
                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${txForm.type === 'income' ? 'border-emerald-500 bg-white' : 'border-slate-300 group-hover:border-emerald-500'}`}>
                                                {txForm.type === 'income' && <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-in zoom-in-50 duration-300"></div>}
                                            </div>
                                            <input type="radio" className="hidden" checked={txForm.type === 'income'} onChange={() => setTxForm({ ...txForm, type: 'income', category: '' })} />
                                            <span className={`text-sm font-black transition-colors ${txForm.type === 'income' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>Entrada</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${txForm.type === 'expense' ? 'border-red-500 bg-white' : 'border-slate-300 group-hover:border-red-500'}`}>
                                                {txForm.type === 'expense' && <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-in zoom-in-50 duration-300"></div>}
                                            </div>
                                            <input type="radio" className="hidden" checked={txForm.type === 'expense'} onChange={() => setTxForm({ ...txForm, type: 'expense', category: '' })} />
                                            <span className={`text-sm font-black transition-colors ${txForm.type === 'expense' ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Saída</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descriçãomanager/backend/db/init.sql</label>
                                    <div className="relative group">
                                        <AlignLeft size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#437476] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Ex: Pagamento da conta de luz"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all placeholder-slate-300"
                                            value={txForm.description}
                                            onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Valor */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor (R$)</label>
                                        <div className="relative group">
                                            <DollarSign size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#437476] transition-colors" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all placeholder-slate-300"
                                                value={txForm.amount}
                                                onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Data */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data da Transação</label>
                                        <div className="relative group">
                                            <input
                                                type="date"
                                                value={txForm.date}
                                                onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Categoria */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all appearance-none"
                                                value={txForm.category}
                                                onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                {txForm.type === 'income' ? (
                                                    incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                                                ) : (
                                                    expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                                                )}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all appearance-none"
                                                value={txForm.status}
                                                onChange={e => setTxForm({ ...txForm, status: e.target.value as 'paid' | 'pending' })}
                                            >
                                                <option value="paid">Pago</option>
                                                <option value="pending">Pendente</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Observação */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Observação (Opcional)</label>
                                    <textarea
                                        placeholder="Adicione detalhes complementares..."
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all placeholder-slate-300 resize-none h-24"
                                        value={txForm.observation}
                                        onChange={e => setTxForm({ ...txForm, observation: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-5 bg-[#437476] text-white font-black rounded-3xl hover:bg-[#365e5f] hover:-translate-y-1 transition-all shadow-2xl shadow-[#437476]/30 text-sm uppercase tracking-widest active:scale-[0.98] mt-4"
                                >
                                    {editingId ? 'Salvar Alterações' : 'Registrar Transação'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showShareSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center relative">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Share2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Link Copiado!</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">
                            O link do relatório financeiro foi criado com sucesso e copiado para sua área de transferência.
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Validade</p>
                            <p className="text-sm font-bold text-slate-700">7 dias</p>
                        </div>
                        <button
                            onClick={() => setShowShareSuccess(false)}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
