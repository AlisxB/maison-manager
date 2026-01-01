import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Package, AlertOctagon } from 'lucide-react';
import { InventoryService, InventoryItem, InventoryItemCreate } from '../../services/inventoryService';

export const AdminInventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

    const [stockModal, setStockModal] = useState<{ item: InventoryItem, action: 'add' | 'remove' } | null>(null);
    const [stockAmount, setStockAmount] = useState(1);

    const [formData, setFormData] = useState<InventoryItemCreate>({
        name: '',
        category: 'Geral',
        quantity: 0,
        unit: 'un',
        min_quantity: 5,
        location: ''
    });

    const categories = ['Limpeza', 'Escritório', 'Manutenção', 'Áreas Comuns', 'Geral'];
    const units = ['un', 'kg', 'L', 'cx', 'pct', 'm'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await InventoryService.getAll();
            setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({ name: '', category: 'Geral', quantity: 0, unit: 'un', min_quantity: 5, location: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setIsEditing(true);
        setCurrentItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            min_quantity: item.min_quantity,
            location: item.location
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        try {
            await InventoryService.delete(id);
            fetchItems();
        } catch (error) {
            alert('Erro ao excluir item');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentItem) {
                await InventoryService.update(currentItem.id, formData);
            } else {
                await InventoryService.create(formData);
            }
            setShowModal(false);
            fetchItems();
        } catch (error: any) {
            console.error('Error saving item:', error);
            alert(error.response?.data?.detail || 'Erro ao salvar item');
        }
    };

    const handleOpenStockUpdate = (item: InventoryItem, action: 'add' | 'remove') => {
        setStockModal({ item, action });
        setStockAmount(1);
    };

    const handleStockUpdateConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockModal) return;

        const delta = stockModal.action === 'add' ? stockAmount : -stockAmount;
        const newQty = Math.max(0, stockModal.item.quantity + delta);

        try {
            await InventoryService.update(stockModal.item.id, { quantity: newQty });
            // Optimistic update
            setItems(items.map(i => i.id === stockModal.item.id ? { ...i, quantity: newQty } : i));
            setStockModal(null);
        } catch (error) {
            alert('Erro ao atualizar estoque');
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Responsivo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#437476] tracking-tight">Gestão de Estoque</h2>
                    <p className="text-sm text-slate-400 font-bold mt-1">Controle de suprimentos e materiais.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="w-full sm:w-auto bg-[#437476] text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-[#356062] transition-all shadow-lg shadow-[#437476]/20 active:scale-95"
                >
                    <Plus size={18} /> Novo Item
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome, categoria..."
                    className="flex-1 outline-none text-slate-600 font-medium placeholder:font-normal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 font-bold">Carregando estoque...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold bg-white rounded-xl border border-slate-200">Nenhum item encontrado.</div>
                ) : (
                    filteredItems.map(item => {
                        const isLowStock = item.quantity <= (item.min_quantity || 0);
                        return (
                            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:scale-[0.99] transition-transform">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-3 rounded-xl shrink-0 ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {isLowStock ? <AlertOctagon size={20} /> : <Package size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                                            {isLowStock && <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Baixo</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-1">{item.category}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Estoque</p>
                                        <p className={`text-lg font-black ${isLowStock ? 'text-red-500' : 'text-slate-700'}`}>
                                            {item.quantity} <span className="text-sm font-bold text-slate-400">{item.unit}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenStockUpdate(item, 'remove')}
                                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 font-black text-lg active:bg-slate-100 transition-colors"
                                        >-</button>
                                        <button
                                            onClick={() => handleOpenStockUpdate(item, 'add')}
                                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 font-black text-lg active:bg-slate-100 transition-colors"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="flex-1 py-2 bg-[#437476]/5 text-[#437476] rounded-lg text-sm font-bold active:bg-[#437476]/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16} /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg active:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Categoria/Local</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Estoque</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Carregando estoque...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Nenhum item encontrado.</td></tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isLowStock = item.quantity <= (item.min_quantity || 0);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {isLowStock ? <AlertOctagon size={18} /> : <Package size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{item.name}</p>
                                                        {isLowStock && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Estoque Baixo</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-600">{item.category}</p>
                                                <p className="text-[10px] text-slate-400">{item.location || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => handleOpenStockUpdate(item, 'remove')} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">-</button>
                                                    <span className={`text-sm font-black min-w-[3rem] text-center ${isLowStock ? 'text-red-500' : 'text-slate-700'}`}>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                    <button onClick={() => handleOpenStockUpdate(item, 'add')} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">+</button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-[#437476] hover:bg-[#437476]/10 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in-95">
                        <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">{isEditing ? 'Editar Item' : 'Novo Item'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nome</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-[#437476]/20 transition-all placeholder-slate-400"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Categoria</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700 appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Unidade</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700 appearance-none"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Qtde.</label>
                                    <input
                                        type="number" required min="0"
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Mínimo</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700"
                                        value={formData.min_quantity}
                                        onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Localização (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700"
                                    value={formData.location || ''}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-[#437476] text-white font-bold rounded-xl hover:bg-[#356062] shadow-lg shadow-[#437476]/20 transition-transform active:scale-95 uppercase tracking-wide text-sm">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {stockModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/50 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-800 mb-2">
                            {stockModal.action === 'add' ? 'Adicionar Estoque' : 'Remover Estoque'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium">
                            {stockModal.item.name} <span className="text-slate-300">|</span> Atual: {stockModal.item.quantity} {stockModal.item.unit}
                        </p>

                        <form onSubmit={handleStockUpdateConfirm} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Quantidade</label>
                                <div className="flex items-center gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setStockAmount(Math.max(1, stockAmount - 1))}
                                        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors text-xl active:scale-95"
                                    >-</button>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-20 text-center p-2 bg-transparent border-none outline-none font-black text-3xl text-slate-700"
                                        value={stockAmount}
                                        onChange={(e) => setStockAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setStockAmount(stockAmount + 1)}
                                        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors text-xl active:scale-95"
                                    >+</button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStockModal(null)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    className={`flex-[1.5] py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 uppercase tracking-wide text-sm ${stockModal.action === 'add' ? 'bg-[#437476] hover:bg-[#356062] shadow-[#437476]/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};