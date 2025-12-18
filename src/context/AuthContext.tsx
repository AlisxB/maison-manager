import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';
import { Role } from '../types';

interface User {
    id: string;
    condo_id: string;
    role: Role;
    sub: string;
}

interface AuthContextData {
    signed: boolean;
    user: User | null;
    loading: boolean;
    signIn: (token: string) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storagedToken = localStorage.getItem('token');

        if (storagedToken) {
            try {
                const decoded = jwtDecode<any>(storagedToken);
                // Validar expiração
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    signOut();
                } else {
                    // Reconstituir user a partir do token
                    setUser({
                        id: decoded.sub,
                        condo_id: decoded.condo_id,
                        role: decoded.role as Role,
                        sub: decoded.sub
                    });
                    api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
                }
            } catch (error) {
                signOut();
            }
        }
        setLoading(false);
    }, []);

    const signIn = (token: string) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decoded = jwtDecode<any>(token);
        setUser({
            id: decoded.sub,
            condo_id: decoded.condo_id,
            role: decoded.role as Role,
            sub: decoded.sub
        });
    };

    const signOut = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
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
