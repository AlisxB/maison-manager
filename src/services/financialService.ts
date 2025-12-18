import api from './api';

export interface Transaction {
    id: string;
    condominium_id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    category?: string;
    date: string;
    status: 'paid' | 'pending';
    observation?: string;
    created_at?: string;
}

export interface TransactionCreate {
    type: 'income' | 'expense';
    description: string;
    amount: number;
    category?: string;
    date: string;
    status?: 'paid' | 'pending';
    observation?: string;
}

export interface TransactionUpdate {
    type?: 'income' | 'expense';
    description?: string;
    amount?: number;
    category?: string;
    date?: string;
    status?: 'paid' | 'pending';
    observation?: string;
}

export interface FinancialSummary {
    income: number;
    expense: number;
    balance: number;
}

export const FinancialService = {
    getAll: async (filters?: { month?: string; year?: string; category?: string; type?: string }) => {
        const params: any = {};
        if (filters?.month) {
            // Convert month name to number if necessary, or assume UI sends number.
            // Let's assume UI sends number as string or int.
            // If UI sends 'Janeiro', we need mapping. Let's handle mapping in UI.
            params.month = filters.month;
        }
        if (filters?.year) params.year = filters.year;
        if (filters?.category) params.category = filters.category;

        const response = await api.get<Transaction[]>('/financial/', { params });
        return response.data;
    },

    create: async (data: TransactionCreate) => {
        const response = await api.post<Transaction>('/financial/', data);
        return response.data;
    },

    update: async (id: string, data: TransactionUpdate) => {
        const response = await api.put<Transaction>(`/financial/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/financial/${id}`);
        return response.data;
    },

    getSummary: async (month: number, year: number) => {
        const response = await api.get<FinancialSummary>('/financial/summary', { params: { month, year } });
        return response.data;
    }
};
