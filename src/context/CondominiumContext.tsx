import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CondominiumService, Condominium } from '../services/condominiumService';
import { useAuth } from './AuthContext';

interface CondominiumContextData {
    condominium: Condominium | null;
    loading: boolean;
    refreshCondo: () => Promise<void>;
}

const CondominiumContext = createContext<CondominiumContextData>({} as CondominiumContextData);

export const CondominiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { signed } = useAuth();
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshCondo = async () => {
        try {
            if (signed) {
                // If logged in, get full details (private)
                const data = await CondominiumService.getMe();
                setCondominium(data);
            } else {
                // If not logged in, get public details (for login screen)
                const data = await CondominiumService.getPublic();
                // Merge with existing null or partial to avoid overwriting if we had full data? 
                // Actually, if we are not signed, we only need these fields.
                // We cast to Condominium for state compatibility, missing fields will be undefined
                setCondominium(data as Condominium);
            }
        } catch (error) {
            console.error('Failed to load condominium data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Run on mount (for public info) AND when signed state changes
        refreshCondo();
    }, [signed]);

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
