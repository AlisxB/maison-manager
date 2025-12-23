import api from './api';

export interface Occurrence {
    id: string;
    condominium_id: string;
    user_id: string;
    title: string;
    description: string;
    category: 'Manutenção' | 'Barulho' | 'Segurança' | 'Outro';
    status: 'ABERTO' | 'EM ANDAMENTO' | 'RESOLVIDO' | 'FECHADO';
    admin_response?: string;
    photo_url?: string;
    is_anonymous?: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        name: string;
        unit_id?: string;
    };
}

export interface OccurrenceCreate {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    is_anonymous?: boolean;
}

export const OccurrenceService = {
    getAll: async () => {
        const response = await api.get<Occurrence[]>('/occurrences/');
        return response.data;
    },

    create: async (data: OccurrenceCreate) => {
        const response = await api.post<Occurrence>('/occurrences/', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Occurrence>) => {
        const response = await api.patch<Occurrence>(`/occurrences/${id}`, data);
        return response.data;
    }
};
