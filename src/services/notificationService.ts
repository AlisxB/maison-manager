import api from './api';

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'ANNOUNCEMENT' | 'VIOLATION' | 'SYSTEM';
    created_at: string;
    read: boolean;
    link?: string;
}

export const NotificationService = {
    getAll: async () => {
        const response = await api.get<Notification[]>('/notifications/');
        return response.data;
    },
    markAllAsRead: async () => {
        await api.post('/notifications/read-all');
    }
};
