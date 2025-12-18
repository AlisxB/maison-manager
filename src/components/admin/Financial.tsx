
import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  X, 
  Calendar, 
  AlignLeft,
  Share2,
  FileText,
  Filter,
  ChevronDown,
  Download
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../mock';

export const AdminFinancial: React.FC = () => {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [filters, setFilters] = useState({
      category: 'Todas as Categorias',
      month: 'Dezembro',
      year: '2025'
  });

  const [txForm, setTxForm] = useState({
      type: 'income',
      description: '',
      amount: '',
      date: '2025-12-17',
      category: '',
      status: 'Pago',
      observation: ''
  });

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = ['2023', '2024', '2025', '2026'];
  const categories = ['Todas as Categorias', 'Condomínio', 'Reservas', 'Multas', 'Manutenção', 'Serviços', 'Utilidades', 'Pessoal'];

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-[#437476]">Gestão Financeira</h2>
            <p className="text-sm text-slate-500 mt-1">Fluxo de caixa, contas a pagar e receber.</p>
         </div>
         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
               <Share2 size={16} /> Compartilhar
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
               <FileText size={16} /> Exportar PDF
            </button>
            <button 
                onClick={() => setIsTxModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-bold hover:bg-[#365e5f] shadow-lg shadow-[#437476]/20 transition-all"
            >
                <Plus size={16} /> Nova Transação
            </button>
         </div>
       </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl"><ArrowUpRight size={20} /></div>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12.4%</span>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Receitas (Dez)</p>
             <h3 className="text-3xl font-black text-slate-800 mt-1">R$ 52.450,00</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl"><ArrowDownRight size={20} /></div>
                <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full">+5.2%</span>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Despesas (Dez)</p>
             <h3 className="text-3xl font-black text-slate-800 mt-1">R$ 38.200,00</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Atual</p>
             <h3 className="text-3xl font-black text-slate-800 mt-1">R$ 14.250,00</h3>
          </div>
       </div>

       {/* Transactions Section with Filters */}
       <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/30">
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Transações Recentes</h3>
                    <p className="text-sm text-slate-500 font-medium">Histórico detalhado de movimentações.</p>
                </div>
                
                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none min-w-[140px]">
                        <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Categoria</label>
                        <select 
                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476] appearance-none"
                            value={filters.category}
                            onChange={(e) => setFilters({...filters, category: e.target.value})}
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
                            onChange={(e) => setFilters({...filters, month: e.target.value})}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative flex-1 sm:flex-none min-w-[100px]">
                        <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ano</label>
                        <select 
                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]/10 focus:border-[#437476] appearance-none"
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>

                    <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-widest">
                    <tr>
                    <th className="px-8 py-5">Descrição</th>
                    <th className="px-8 py-5">Categoria</th>
                    <th className="px-8 py-5">Data</th>
                    <th className="px-8 py-5 text-right">Valor</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {MOCK_TRANSACTIONS.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-5">
                            <span className="font-black text-slate-700 block group-hover:text-[#437476] transition-colors">{t.description}</span>
                        </td>
                        <td className="px-8 py-5">
                            <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                {t.category}
                            </span>
                        </td>
                        <td className="px-8 py-5 font-medium text-slate-400">
                            {new Date(t.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={`px-8 py-5 text-right font-black text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5 text-center">
                            {t.status === 'paid' 
                            ? <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Pago</span>
                            : <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">Pendente</span>
                            }
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
             <button className="text-xs font-black text-slate-400 hover:text-[#437476] uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                Ver Relatório Completo <Download size={14} />
             </button>
          </div>
       </div>

       {isTxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-[#fcfbf9] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-slate-200/50">
                {/* Close Button */}
                <button 
                  onClick={() => setIsTxModalOpen(false)} 
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm z-10 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="px-8 py-10">
                   <div className="mb-8">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Adicionar Nova Transação</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Preencha os detalhes para registrar uma nova movimentação financeira.</p>
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
                                  <input type="radio" className="hidden" checked={txForm.type === 'income'} onChange={() => setTxForm({...txForm, type: 'income'})} />
                                  <span className={`text-sm font-black transition-colors ${txForm.type === 'income' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>Entrada</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${txForm.type === 'expense' ? 'border-red-500 bg-white' : 'border-slate-300 group-hover:border-red-500'}`}>
                                      {txForm.type === 'expense' && <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-in zoom-in-50 duration-300"></div>}
                                  </div>
                                  <input type="radio" className="hidden" checked={txForm.type === 'expense'} onChange={() => setTxForm({...txForm, type: 'expense'})} />
                                  <span className={`text-sm font-black transition-colors ${txForm.type === 'expense' ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Saída</span>
                              </label>
                          </div>
                      </div>

                      {/* Descrição */}
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                          <div className="relative group">
                              <AlignLeft size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#437476] transition-colors" />
                              <input 
                                  type="text" 
                                  placeholder="Ex: Pagamento da conta de luz"
                                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all placeholder-slate-300" 
                                  value={txForm.description}
                                  onChange={e => setTxForm({...txForm, description: e.target.value})}
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
                                      placeholder="0,00"
                                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all placeholder-slate-300" 
                                      value={txForm.amount}
                                      onChange={e => setTxForm({...txForm, amount: e.target.value})}
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
                                      onChange={e => setTxForm({...txForm, date: e.target.value})}
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
                                      onChange={e => setTxForm({...txForm, category: e.target.value})}
                                  >
                                      <option value="">Selecione...</option>
                                      {txForm.type === 'income' ? (
                                          <>
                                              <option value="Condomínio">Condomínio</option>
                                              <option value="Reservas">Reservas</option>
                                              <option value="Multas">Multas</option>
                                          </>
                                      ) : (
                                          <>
                                              <option value="Manutenção">Manutenção</option>
                                              <option value="Serviços">Serviços</option>
                                              <option value="Utilidades">Utilidades</option>
                                              <option value="Pessoal">Pessoal</option>
                                          </>
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
                                      onChange={e => setTxForm({...txForm, status: e.target.value})}
                                  >
                                      <option value="Pago">Pago</option>
                                      <option value="Pendente">Pendente</option>
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
                              onChange={e => setTxForm({...txForm, observation: e.target.value})}
                          />
                      </div>

                      <button 
                         onClick={() => setIsTxModalOpen(false)}
                         className="w-full py-5 bg-[#437476] text-white font-black rounded-3xl hover:bg-[#365e5f] hover:-translate-y-1 transition-all shadow-2xl shadow-[#437476]/30 text-sm uppercase tracking-widest active:scale-[0.98] mt-4"
                      >
                         Registrar Transação
                      </button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
