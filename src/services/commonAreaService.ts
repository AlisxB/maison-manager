import api from './api';

export interface CommonArea {
    id: string;
    condominium_id: string;
    name: string;
    capacity: number;
    price_per_hour: number;
    min_booking_hours: number;
    max_booking_hours: number;
    monthly_limit_per_unit: number;
    opening_hours?: any;
    is_active: boolean;
    created_at: string;
}

export interface CommonAreaCreate {
    name: string;
    capacity: number;
    price_per_hour: number;
}

export interface CommonAreaUpdate extends Partial<CommonAreaCreate> {
    min_booking_hours?: number;
    max_booking_hours?: number;
    monthly_limit_per_unit?: number;
    is_active?: boolean;
}

export const CommonAreaService = {
    getAll: async () => {
        const response = await api.get<CommonArea[]>('/reservations/areas');
        return response.data;
    },

    create: async (data: CommonAreaCreate) => {
        const response = await api.post<CommonArea>('/reservations/areas', data);
        return response.data;
    },

    update: async (id: string, data: CommonAreaUpdate) => {
        const response = await api.put<CommonArea>(`/reservations/areas/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/reservations/areas/${id}`);
    }
};
