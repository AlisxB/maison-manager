import api from './api';

// Interfaces matching Backend Schemas
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_type: string;
    unit_id?: string;
    status: string;
    created_at: string;
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

    create: async (data: any) => {
        const response = await api.post<User>('/users/', data);
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
