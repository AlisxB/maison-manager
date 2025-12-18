import React, { useState } from 'react';
import { 
  PlusCircle, 
  FileText, 
  ChevronDown, 
  MoreVertical, 
  Edit, 
  History, 
  Trash2, 
  Box, 
  Plus,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle
} from 'lucide-react';
import { MOCK_INVENTORY } from '../../mock';
import { InventoryItem } from '../../types';

export const AdminInventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('Todas as Categorias');

    // Modals State
    const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'entry' | 'exit' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        category: 'Limpeza',
        quantity: 0,
        minLevel: 1,
        movementQty: 1,
        observation: ''
    });

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleOpenModal = (type: 'add' | 'edit' | 'entry' | 'exit', item?: InventoryItem) => {
        setSelectedItem(item || null);
        setActiveModal(type);
        setOpenMenuId(null);
        
        if (item) {
            setFormData({
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                minLevel: item.minLevel,
                movementQty: 1,
                observation: ''
            });
        } else {
            setFormData({
                name: '',
                category: 'Limpeza',
                quantity: 0,
                minLevel: 1,
                movementQty: 1,
                observation: ''
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-emerald-100 text-emerald-700';
            case 'Low Stock': return 'bg-orange-100 text-orange-700';
            case 'Out of Stock': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'In Stock': return 'Em Estoque';
            case 'Low Stock': return 'Estoque Baixo';
            case 'Out of Stock': return 'Sem Estoque';
            default: return status;
        }
    };

    const getProgressWidth = (qty: number, min: number) => {
        const full = min * 5; 
        const percentage = (qty / full) * 100;
        return Math.min(Math.max(percentage, 5), 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-700">Controle de Estoque e Inventário</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os suprimentos e ativos do condomínio.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    <FileText size={16} /> Exportar PDF
                </button>
            </div>

            <div className="bg-[#fcfbf9] rounded-xl border border-[#e5e7eb] shadow-sm overflow-visible">
                <div className="p-6 border-b border-[#e5e7eb] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 tracking-tight">Lista de Itens</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Visão geral de todos os itens de estoque e inventário.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                className="w-full md:w-48 appearance-none bg-white border border-[#e5e7eb] text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#437476] cursor-pointer"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option>Todas as Categorias</option>
                                <option>Limpeza</option>
                                <option>Elétrica</option>
                                <option>Higiene</option>
                                <option>Piscina</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        
                        <button 
                            onClick={() => handleOpenModal('add')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#437476] text-white rounded-lg text-sm font-bold hover:bg-[#365e5f] transition-all shadow-sm"
                        >
                            <PlusCircle size={18} /> Adicionar Item
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 border-collapse">
                        <thead>
                            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e5e7eb]">
                                <th className="px-8 py-5 font-bold">Item</th>
                                <th className="px-8 py-5 font-bold">Categoria</th>
                                <th className="px-8 py-5 font-bold text-center">Status</th>
                                <th className="px-8 py-5 font-bold">Detalhes</th>
                                <th className="px-8 py-5 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb]">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-white/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-700 text-base">{item.name}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-slate-500 font-medium">{item.category}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-slate-700 min-w-[20px]">{item.quantity}</span>
                                            <div className="flex-1 max-w-[120px] h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${item.quantity <= item.minLevel ? 'bg-orange-500' : 'bg-[#437476]'}`}
                                                    style={{ width: `${getProgressWidth(item.quantity, item.minLevel)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                Mínimo: {item.minLevel}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => handleOpenModal('entry', item)}
                                                className="p-2 text-emerald-500/60 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                                                title="Registrar Entrada (Adição de Estoque)"
                                            >
                                                <ArrowUpCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenModal('exit', item)}
                                                className="p-2 text-red-400/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                                title="Registrar Saída (Retirada de Estoque)"
                                            >
                                                <ArrowDownCircle size={20} />
                                            </button>
                                            
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleMenu(item.id)}
                                                    className={`p-2 rounded-lg transition-all ${openMenuId === item.id ? 'bg-white text-[#437476]' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openMenuId === item.id && (
                                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-[#e5e7eb] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1">
                                                        <button 
                                                            onClick={() => handleOpenModal('edit', item)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#437476] transition-colors text-left"
                                                        >
                                                            <Edit size={14} /> Editar
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#437476] transition-colors text-left">
                                                            <History size={14} /> Ver Histórico
                                                        </button>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left">
                                                            <Trash2 size={14} /> Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-[#fcfbf9] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-[#e5e7eb]">
                        <button 
                            onClick={() => setActiveModal(null)} 
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="px-8 py-8">
                            {/* Modal Header */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-700">
                                    {activeModal === 'add' && 'Adicionar Novo Item'}
                                    {activeModal === 'edit' && 'Editar Item'}
                                    {activeModal === 'entry' && 'Registrar Entrada'}
                                    {activeModal === 'exit' && 'Registrar Saída'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {activeModal === 'add' && 'Preencha os dados para adicionar um novo item.'}
                                    {activeModal === 'edit' && 'Atualize as informações do item selecionado.'}
                                    {activeModal === 'entry' && `Adicionando estoque para: ${selectedItem?.name}`}
                                    {activeModal === 'exit' && `Removendo estoque de: ${selectedItem?.name}`}
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }}>
                                {(activeModal === 'add' || activeModal === 'edit') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">Nome do Item</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Detergente (5L)"
                                                className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">Categoria</label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 appearance-none"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                >
                                                    <option>Limpeza</option>
                                                    <option>Elétrica</option>
                                                    <option>Higiene</option>
                                                    <option>Piscina</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {activeModal === 'add' && (
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-600 mb-2">Quantidade Inicial</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700"
                                                        value={formData.quantity}
                                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                                    />
                                                </div>
                                            )}
                                            <div className={activeModal === 'edit' ? 'col-span-2' : ''}>
                                                <label className="block text-sm font-bold text-slate-600 mb-2">Nível Mínimo</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700"
                                                    value={formData.minLevel}
                                                    onChange={(e) => setFormData({...formData, minLevel: parseInt(e.target.value) || 1})}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(activeModal === 'entry' || activeModal === 'exit') && (
                                    <>
                                        <div className="flex items-center justify-between p-4 bg-white border border-[#e5e7eb] rounded-xl mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Atual</p>
                                                <p className="text-xl font-bold text-slate-700">{selectedItem?.quantity} un</p>
                                            </div>
                                            <div className={`p-3 rounded-full ${activeModal === 'entry' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {activeModal === 'entry' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                                {activeModal === 'entry' ? 'Quantidade de Entrada' : 'Quantidade de Saída'}
                                            </label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700"
                                                value={formData.movementQty}
                                                onChange={(e) => setFormData({...formData, movementQty: parseInt(e.target.value) || 1})}
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">Observação</label>
                                            <textarea 
                                                placeholder="Ex: Compra quinzenal, Reposição urgente..."
                                                className="w-full px-4 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-slate-700 h-20 resize-none"
                                                value={formData.observation}
                                                onChange={(e) => setFormData({...formData, observation: e.target.value})}
                                            />
                                        </div>

                                        {activeModal === 'exit' && (formData.movementQty > (selectedItem?.quantity || 0)) && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600">
                                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                <p className="text-[11px] font-medium leading-tight">
                                                    Atenção: A quantidade de saída é superior ao saldo disponível em estoque.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-[#437476] text-white font-bold rounded-lg hover:bg-[#365e5f] transition-all shadow-sm text-sm mt-4"
                                >
                                    {activeModal === 'add' && 'Salvar Item'}
                                    {activeModal === 'edit' && 'Atualizar Item'}
                                    {activeModal === 'entry' && 'Registrar Entrada'}
                                    {activeModal === 'exit' && 'Registrar Saída'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};