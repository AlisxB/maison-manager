import api from './api';

// Interfaces matching Backend Schemas
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    profile_type: string;
    unit_id?: string;
    unit?: Unit;
    status: string;
    created_at: string;
    department?: string;
    work_hours?: string;
    pets?: { type: string; quantity: number }[];
}

export interface Unit {
    id: string;
    block?: string;
    number: string;
    condominium_id: string;
}

export const UserService = {
    getAll: async () => {
        const response = await api.get<User[]>('/users/');
        return response.data;
    },

    getResidents: async () => {
        const response = await api.get<User[]>('/users/');
        return response.data.filter(u => u.role === 'RESIDENT');
    },

    create: async (data: any) => {
        const response = await api.post<User>('/users/', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};

export const UnitService = {
    getAll: async () => {
        const response = await api.get<Unit[]>('/units/');
        return response.data;
    },

    create: async (data: { block: string; number: string; type: string }) => {
        const response = await api.post<Unit>('/units/', data);
        return response.data;
    }
};
