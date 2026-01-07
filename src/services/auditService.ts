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

export interface AccessLog {
    id: string;
    user_id: string;
    user_name: string;
    user_role: string;
    user_email: string;
    ip_address: string;
    device: string;
    user_agent: string;
    location?: string;
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
    },

    getAccessLogs: async (limit: number = 50, userId?: string) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (userId) params.append('user_id', userId);

        const response = await api.get<AccessLog[]>(`/audit/access-logs?${params.toString()}`);
        return response.data;
    }
};
