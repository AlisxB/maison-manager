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
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestão de Documentos</h2>
                    <p className="text-slate-500">Publique e gerencie documentos institucionais.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-[#437476] hover:bg-[#365e5f] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Upload size={20} />
                    Novo Documento
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-900">Documento</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Categoria</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Tamanho</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Data</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Status</th>
                            <th className="px-6 py-3 font-semibold text-slate-900 text-right">Ações</th>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#437476]/10 text-[#437476] rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{doc.title}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{doc.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold uppercase text-slate-600">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{formatSize(doc.file_size)}</td>
                                    <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(doc)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-colors ${doc.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
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
                                                className="p-2 text-slate-400 hover:text-[#437476] hover:bg-[#437476]/10 rounded-lg transition-colors"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                title="Excluir"
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Novo Documento</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#437476] outline-none"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ex: Ata da Assembleia Geral 2024"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#437476] outline-none bg-white"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        <option value="Atas">Atas</option>
                                        <option value="Regimentos">Regimentos</option>
                                        <option value="Financeiro">Financeiro</option>
                                        <option value="Comunicados">Comunicados</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#437476] outline-none resize-none h-20"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Breve descrição do conteúdo..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo (PDF ou Imagem, máx 10MB)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,image/png,image/jpeg"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                                    {uploadFile ? (
                                        <p className="text-sm font-medium text-[#437476]">{uploadFile.name}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500">Clique ou arraste o arquivo aqui</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !uploadFile}
                                    className="bg-[#437476] hover:bg-[#365e5f] disabled:bg-[#437476]/50 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-[#437476]/20 transition-all"
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
