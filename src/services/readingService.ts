import api from './api';

// --- Interfaces ---
export interface WaterReading {
    id: string;
    unit_id: string;
    reading_date: string;
    value_m3: number;
    image_url?: string;
    created_at: string;
}

export interface ReadingCreateWater {
    unit_id: string;
    reading_date: string;
    value_m3: number;
    image_url?: string;
}

export interface GasReading {
    id: string;
    supplier: string;
    purchase_date: string;
    total_price: number;
    cylinder_1_kg: number;
    cylinder_2_kg: number;
    cylinder_3_kg: number;
    cylinder_4_kg: number;
    created_at: string;
}

export interface ReadingCreateGas {
    supplier: string;
    purchase_date: string;
    total_price: number;
    cylinder_1_kg: number;
    cylinder_2_kg: number;
    cylinder_3_kg: number;
    cylinder_4_kg: number;
}

export interface ElectricityReading {
    id: string;
    due_date: string;
    consumption_kwh: number;
    total_value: number;
    status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
    created_at: string;
}

export interface ReadingCreateElectricity {
    due_date: string;
    consumption_kwh: number;
    total_value: number;
    status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
}

// --- Service ---
export const ReadingService = {
    // Water
    createWater: async (data: ReadingCreateWater) => {
        const response = await api.post<WaterReading>('/readings/water', data);
        return response.data;
    },
    getAllWater: async () => {
        const response = await api.get<WaterReading[]>('/readings/water');
        return response.data;
    },

    // Gas
    createGas: async (data: ReadingCreateGas) => {
        const response = await api.post<GasReading>('/readings/gas', data);
        return response.data;
    },
    getAllGas: async () => {
        const response = await api.get<GasReading[]>('/readings/gas');
        return response.data;
    },

    // Electricity
    createElectricity: async (data: ReadingCreateElectricity) => {
        const response = await api.post<ElectricityReading>('/readings/electricity', data);
        return response.data;
    },
    getAllElectricity: async () => {
        const response = await api.get<ElectricityReading[]>('/readings/electricity');
        return response.data;
    },
};
