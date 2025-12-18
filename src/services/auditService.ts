import api from './api';

export interface AuditLog {
    id: string;
    actor_id?: string;
    actor_name?: string;
    action: string;
    table_name: string;
    record_id: string;
    old_data?: any;
    new_data?: any;
    ip_address?: string;
    created_at: string;
}

export const AuditService = {
    getLogs: async (limit: number = 50, table?: string, action?: string) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (table) params.append('table', table);
        if (action) params.append('action', action);

        const response = await api.get<AuditLog[]>(`/audit/?${params.toString()}`);
        return response.data;
    }
};
