
import api from './api';

export interface Announcement {
    id: string;
    condominium_id: string;
    title: string;
    description: string;
    type: 'Aviso' | 'Urgente' | 'Evento' | 'Manutenção';
    target_audience: string;
    created_at: string;
}

export interface AnnouncementCreate {
    title: string;
    description: string;
    type: string;
    target_audience: string;
}

export const AnnouncementService = {
    getAll: async () => {
        const response = await api.get<Announcement[]>('/announcements/');
        return response.data;
    },

    create: async (data: AnnouncementCreate) => {
        const response = await api.post<Announcement>('/announcements/', data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/announcements/${id}`);
    }
};
