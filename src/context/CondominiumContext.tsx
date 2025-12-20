import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CondominiumService, Condominium } from '../services/condominiumService';

interface CondominiumContextData {
    condominium: Condominium | null;
    loading: boolean;
    refreshCondo: () => Promise<void>;
}

const CondominiumContext = createContext<CondominiumContextData>({} as CondominiumContextData);

export const CondominiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshCondo = async () => {
        try {
            const data = await CondominiumService.getMe();
            setCondominium(data);
        } catch (error) {
            console.error('Failed to load condominium data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCondo();
    }, []);

    return (
        <CondominiumContext.Provider value={{ condominium, loading, refreshCondo }}>
            {children}
        </CondominiumContext.Provider>
    );
};

export function useCondominium() {
    const context = useContext(CondominiumContext);
    return context;
}
