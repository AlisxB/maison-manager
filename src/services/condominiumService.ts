import api from './api';

export interface Condominium {
    id: string;
    name: string;
    cnpj: string; // Decrypted
    address: string;
    contact_email?: string; // Decrypted
    gate_phone?: string; // Decrypted
    created_at: string;
}

export interface CondominiumUpdate {
    name?: string;
    address?: string;
    contact_email?: string;
    gate_phone?: string;
}

export const CondominiumService = {
    getMe: async () => {
        const response = await api.get<Condominium>('/condominium/me');
        return response.data;
    },

    updateMe: async (data: CondominiumUpdate) => {
        const response = await api.put<Condominium>('/condominium/me', data);
        return response.data;
    }
};
