import api from './api';

export interface Bylaw {
    id: string;
    condominium_id: string;
    title: string;
    description?: string;
    category: string;
    created_at: string;
}

export const BylawService = {
    getAll: async (): Promise<Bylaw[]> => {
        const response = await api.get('/bylaws/');
        return response.data;
    },

    create: async (data: Partial<Bylaw>): Promise<Bylaw> => {
        const response = await api.post('/bylaws/', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Bylaw>): Promise<Bylaw> => {
        const response = await api.put(`/bylaws/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/bylaws/${id}`);
    }
};
