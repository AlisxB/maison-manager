import api from './api';
import { User } from './userService';

// Types matching Backend
export interface CommonArea {
    id: string;
    name: string;
    capacity: number;
    price_per_hour: number;
    min_booking_hours: number;
    max_booking_hours: number;
    is_active: boolean;
}

export interface Reservation {
    id: string;
    condominium_id: string;
    common_area_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'BLOQUEADO';
    total_price?: number;
    created_at: string;
    reason?: string;

    // Nested object from API
    common_area?: {
        name: string;
        price_per_hour: number;
    };
}

export interface ReservationCreate {
    common_area_id: string;
    start_time: string;
    end_time: string;
    user_id?: string;
    status?: string;
    reason?: string;
}

export const CommonAreaService = {
    getAll: async () => {
        const response = await api.get<CommonArea[]>('/reservations/areas');
        return response.data;
    }
};

export const ReservationService = {
    getAll: async () => {
        const response = await api.get<Reservation[]>('/reservations/');
        return response.data;
    },

    create: async (data: ReservationCreate) => {
        const response = await api.post<Reservation>('/reservations/', data);
        return response.data;
    },

    updateStatus: async (id: string, status: 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO') => {
        const response = await api.patch<Reservation>(`/reservations/${id}`, { status });
        return response.data;
    }
};
