import api from './api';

export interface InventoryItem {
    id: string;
    condominium_id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string; // e.g., 'units', 'liters'
    min_quantity: number; // For low stock alert
    location?: string;
    created_at: string;
    // Add other fields as per model
}

export interface InventoryItemCreate {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    min_quantity?: number;
    location?: string;
}

export interface InventoryItemUpdate {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    min_quantity?: number;
    location?: string;
}

export const InventoryService = {
    getAll: async () => {
        const response = await api.get<InventoryItem[]>('/inventory/');
        return response.data;
    },

    create: async (data: InventoryItemCreate) => {
        const response = await api.post<InventoryItem>('/inventory/', data);
        return response.data;
    },

    update: async (id: string, data: InventoryItemUpdate) => {
        const response = await api.put<InventoryItem>(`/inventory/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/inventory/${id}`);
    }
};
