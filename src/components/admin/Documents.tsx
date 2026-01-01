import React, { useEffect, useState } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Eye,
    EyeOff,
    MoreVertical,
    Download,
    X,
    Filter,
    Plus
} from 'lucide-react';
import { DocumentService, Document } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';

export const AdminDocuments: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Atas');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) loadDocuments();
    }, [user]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await DocumentService.getAll();
            setDocuments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !title) return;

        try {
            setIsSubmitting(true);
            await DocumentService.upload(uploadFile, title, category, description);
            setIsUploadModalOpen(false);
            resetForm();
            loadDocuments();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao fazer upload do documento.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este documento?")) {
            try {
                await DocumentService.delete(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir.");
            }
        }
    };

    const handleToggleStatus = async (doc: Document) => {
        try {
            const updated = await DocumentService.toggleStatus(doc.id, !doc.is_active);
            setDocuments(prev => prev.map(d => d.id === doc.id ? updated : d));
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setUploadFile(null);
        setTitle('');
        setCategory('Atas');
        setDescription('');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header Responsivo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestão de Documentos</h2>
                    <p className="text-slate-500">Publique e gerencie documentos institucionais.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full sm:w-auto bg-[#437476] hover:bg-[#365e5f] text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#437476]/20 active:scale-95"
                >
                    <Upload size={20} />
                    Novo Documento
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Carregando...</div>
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">Nenhum documento cadastrado.</div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:scale-[0.99] transition-transform">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2.5 bg-[#437476]/10 text-[#437476] rounded-xl shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{doc.title}</h3>
                                    {doc.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.description}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Categoria</p>
                                    <p className="font-bold text-slate-700 text-xs">{doc.category}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Tamanho</p>
                                    <p className="font-bold text-slate-700 text-xs">{formatSize(doc.file_size)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleToggleStatus(doc)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${doc.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                                >
                                    {doc.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {doc.is_active ? 'Visível' : 'Oculto'}
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => DocumentService.download(doc.id, doc.title, doc.mime_type)}
                                        className="p-2 text-slate-400 hover:text-[#437476] bg-slate-50 hover:bg-[#437476]/10 rounded-lg transition-colors"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Documento</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Tamanho</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center">Carregando...</td></tr>
                        ) : documents.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum documento cadastrado.</td></tr>
                        ) : (
                            documents.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[#437476]/10 text-[#437476] rounded-lg mt-0.5">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{doc.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-600">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{formatSize(doc.file_size)}</td>
                                    <td className="px-6 py-4 font-medium">{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(doc)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide transition-all active:scale-95 ${doc.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}
                                        >
                                            {doc.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {doc.is_active ? 'Visível' : 'Oculto'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                title="Baixar"
                                                onClick={() => DocumentService.download(doc.id, doc.title, doc.mime_type)}
                                                className="p-1.5 text-slate-400 hover:text-[#437476] hover:bg-[#437476]/10 rounded-lg transition-colors"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                title="Excluir"
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#fcfbf9] rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-white/50">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Novo Documento</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Preencha os dados do arquivo.</p>
                            </div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm transition-all hover:scale-105">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#437476]/10 focus:border-[#437476] outline-none transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ex: Ata da Assembleia Geral 2024"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#437476]/10 focus:border-[#437476] outline-none appearance-none text-sm font-medium text-slate-700"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                        >
                                            <option value="Atas">Atas</option>
                                            <option value="Regimentos">Regimentos</option>
                                            <option value="Financeiro">Financeiro</option>
                                            <option value="Comunicados">Comunicados</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                        <Filter size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descrição (Opcional)</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#437476]/10 focus:border-[#437476] outline-none transition-all text-sm font-medium text-slate-700 placeholder-slate-400 resize-none h-24"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Breve descrição do conteúdo..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Arquivo (PDF/Imagem - Máx 10MB)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-[#437476]/50 transition-all cursor-pointer relative group bg-slate-50/50">
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,image/png,image/jpeg"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-[#437476]">
                                            <Upload size={24} />
                                        </div>
                                        {uploadFile ? (
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-[#437476]">{uploadFile.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{formatSize(uploadFile.size)}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-bold text-slate-600">Clique para selecionar</p>
                                                <p className="text-xs text-slate-400 mt-1">ou arraste o arquivo aqui</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !uploadFile}
                                    className="flex-[2] bg-[#437476] hover:bg-[#365e5f] disabled:bg-[#437476]/50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-xl shadow-[#437476]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Publicar Documento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
