import api from './api';

// Interfaces matching Backend Schemas
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'ADMIN' | 'RESIDENTE' | 'PORTEIRO' | 'FINANCEIRO' | 'SINDICO' | 'SUBSINDICO' | 'CONSELHO';
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
    type?: string;
}

export const UserService = {
    getAll: async (params?: any) => {
        const response = await api.get<User[]>('/users/', { params });
        return response.data;
    },

    getResidents: async () => {
        const response = await api.get<User[]>('/users/');
        // Filtra qualquer usuário que tenha uma unidade vinculada (independente do cargo)
        return response.data.filter(u => u.unit_id || u.unit);
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
    },

    getAccessHistory: async () => {
        const response = await api.get<AccessLog[]>('/users/me/access-history');
        return response.data;
    }
};

export interface AccessLog {
    id: string;
    ip_address: string;
    user_agent: string;
    location: string;
    created_at: string;
}

export interface OccupationHistory {
    id: string;
    user_id: string;
    profile_type: string;
    start_date: string;
    end_date?: string;
    created_at: string;
    user_name?: string;
}

export interface UnitDetails extends Unit {
    current_residents: User[];
    occupation_history: OccupationHistory[];
}

export const UnitService = {
    getAll: async (): Promise<Unit[]> => {
        const response = await api.get('/units');
        return response.data;
    },
    create: async (payload: Partial<Unit>): Promise<Unit> => {
        const response = await api.post('/units', payload);
        return response.data;
    },
    getDetails: async (id: string): Promise<UnitDetails> => {
        const response = await api.get(`/units/${id}/details`);
        return response.data;
    }
};
