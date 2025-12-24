import api from './api';

export interface Violation {
    id: string;
    condominium_id: string;
    resident_id: string;
    bylaw_id?: string;
    type: 'ADVERTENCIA' | 'MULTA';
    status: 'ABERTO' | 'PAGO' | 'RECORRIDO' | 'RESOLVIDO';
    description: string;
    amount?: number;
    occurred_at?: string;
    created_at: string;
}

export interface ViolationCreate {
    resident_id: string;
    bylaw_id?: string;
    type: 'ADVERTENCIA' | 'MULTA';
    description: string;
    amount?: number;
    occurred_at?: string;
}

export const ViolationService = {
    getAll: async (filters?: { type?: string, resident_id?: string }): Promise<Violation[]> => {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.resident_id) params.append('resident_id', filters.resident_id);

        const response = await api.get(`/violations/?${params.toString()}`);
        return response.data;
    },

    create: async (data: ViolationCreate): Promise<Violation> => {
        const response = await api.post('/violations/', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Violation>): Promise<Violation> => {
        const response = await api.put(`/violations/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/violations/${id}`);
    }
};
