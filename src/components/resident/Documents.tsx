import React, { useEffect, useState } from 'react';
import {
    FileText,
    Download,
    Search,
    File,
    FileImage,
    FolderOpen,
    Calendar,
    Filter
} from 'lucide-react';
import { DocumentService, Document } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';

export const ResidentDocuments: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (user) {
            loadDocuments();
        }
    }, [user]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await DocumentService.getAll();
            setDocuments(data);
        } catch (error) {
            console.error("Error loading documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc: Document) => {
        DocumentService.download(doc.id, doc.title, doc.mime_type);
    };

    // Filter Logic
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Extract Categories
    const categories = Array.from(new Set(documents.map(d => d.category)));

    const getIcon = (mime: string) => {
        if (mime.includes('pdf')) return <FileText size={24} className="text-red-500" />;
        if (mime.includes('image')) return <FileImage size={24} className="text-blue-500" />;
        return <File size={24} className="text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FolderOpen className="text-indigo-600" />
                        Documentos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Acesse atas, regimentos e documentos importantes do condomínio.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título ou descrição..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Carregando documentos...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        {getIcon(doc.mime_type)}
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">
                                        {doc.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-2">{doc.title}</h3>
                                {doc.description && (
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{doc.description}</p>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex flex-col">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(doc.created_at).toLocaleDateString()}</span>
                                    <span>{formatSize(doc.file_size)}</span>
                                </div>
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline"
                                >
                                    <Download size={16} />
                                    Baixar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                    <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Nenhum documento encontrado</h3>
                    <p className="text-slate-500">Tente ajustar seus filtros de busca.</p>
                </div>
            )}
        </div>
    );
};
