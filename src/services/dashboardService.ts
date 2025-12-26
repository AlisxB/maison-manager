import api from './api';

export interface DashboardStats {
    financial: {
        revenue: number;
        revenue_growth: number;
        expense: number;
        expense_growth: number;
        balance: number;
    };
    occupancy: {
        total_units: number;
        occupied_units: number;
        residents_count: number;
    };
    readings: {
        water_total: number;
        water_growth: number;
        gas_total: number;
        gas_growth: number;
        energy_total: number;
        energy_growth: number;
    };
    charts: Array<{
        name: string;
        water: number;
        gas: number;
        energy: number;
    }>;
    recent_residents: Array<{
        id: string;
        name: string;
        unit: string;
        start_date: string;
        status: string;
    }>;
    pending_counts?: {
        occurrences: number;
        access_requests: number;
        reservations: number;
    };
}

export const DashboardService = {
    getStats: async () => {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    }
};
