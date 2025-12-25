import api from './api';

export interface Document {
    id: string;
    condominium_id: string;
    title: string;
    description?: string;
    category: string;
    mime_type: string;
    file_size: number;
    is_active: boolean;
    created_at: string;
    created_by?: string;
}

export const DocumentService = {
    getAll: async () => {
        const response = await api.get<Document[]>('/documents/');
        return response.data;
    },

    upload: async (file: File, title: string, category: string, description?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('category', category);
        if (description) formData.append('description', description);

        const response = await api.post<Document>('/documents/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/documents/${id}`);
    },

    toggleStatus: async (id: string, is_active: boolean) => {
        const response = await api.patch<Document>(`/documents/${id}/status`, { is_active });
        return response.data;
    },

    getDownloadUrl: (id: string) => {
        // Return the direct URL to the download endpoint
        // The browser will handle the request with the auth cookie/header if configured, 
        // OR we might need to fetch blob and create object URL if using Bearer tokens in headers.
        // Since we use 'api' instance which uses interceptors for Headers, a simple <a> tag won't work easily for protected routes 
        // UNLESS we use a specialized download function.
        return `${api.defaults.baseURL}/documents/${id}/download`;
    },

    // Safer download method handling Auth Headers
    download: async (id: string, title: string, mimeType: string) => {
        const response = await api.get(`/documents/${id}/download`, {
            responseType: 'blob',
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
        const link = document.createElement('a');
        link.href = url;

        // Try to guess extension
        const ext = mimeType.split('/')[1] || 'pdf';
        link.setAttribute('download', `${title}.${ext}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
