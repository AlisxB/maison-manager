import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { Role } from '../types';

interface User {
    id: string;
    condo_id: string;
    role: Role;
    sub: string;
    email: string;
    name?: string;
    unit?: string;
}

interface AuthContextData {
    signed: boolean;
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            console.log('Checking session...');
            const response = await api.get('/profile/me');
            console.log('Session valid:', response.data);
            const data = response.data;
            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as Role,
                condo_id: 'derived',
                sub: data.id,
                unit: data.unit_block ? `${data.unit_block} - ${data.unit_number}` : undefined
            });
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
        } finally {
            console.log('Finished loading');
            setLoading(false);
        }
    };

    const signIn = async () => {
        // Just reload session data
        await checkSession();
    };

    const signOut = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed on backend:', error);
        } finally {
            setUser(null);
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
