import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Alert } from '@/types/compatibility';
import { generateId, getFromStorage, setToStorage } from '@/config/constants';

const STORAGE_KEY = 'sps_alerts';

// Fallback mock data
const fallbackAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Stock faible',
    message: 'Le stock de "iPhone 15 Pro" est bas (5 unités restantes)',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Nouvelle vente',
    message: 'Vente #V-2024-001 effectuée - 1,250,000 FCFA',
    date: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

interface AlertContextType {
    alerts: Alert[];
    unreadCount: number;
    addAlert: (alert: Omit<Alert, 'id' | 'date' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteAlert: (id: string) => void;
    clearAllAlerts: () => void;
    loading: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    // Load alerts from localStorage on mount
    useEffect(() => {
        setLoading(true);
        try {
            const stored = getFromStorage<Alert[] | null>(STORAGE_KEY, null);
            setAlerts(stored && stored.length > 0 ? stored : fallbackAlerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
            setAlerts(fallbackAlerts);
        } finally {
            setLoading(false);
        }
    }, []);

    const unreadCount = alerts.filter(a => !a.read).length;

    // Persist alerts to localStorage
    const persistAlerts = useCallback((newAlerts: Alert[]) => {
        setAlerts(newAlerts);
        setToStorage(STORAGE_KEY, newAlerts);
    }, []);

    const addAlert = useCallback((alertData: Omit<Alert, 'id' | 'date' | 'read'>) => {
        const newAlert: Alert = {
            ...alertData,
            id: generateId(),
            date: new Date().toISOString(),
            read: false,
        };
        persistAlerts([newAlert, ...alerts]);
    }, [alerts, persistAlerts]);

    const markAsRead = useCallback((id: string) => {
        const updated = alerts.map(a => 
            a.id === id ? { ...a, read: true } : a
        );
        persistAlerts(updated);
    }, [alerts, persistAlerts]);

    const markAllAsRead = useCallback(() => {
        const updated = alerts.map(a => ({ ...a, read: true }));
        persistAlerts(updated);
    }, [alerts, persistAlerts]);

    const deleteAlertHandler = useCallback((id: string) => {
        const updated = alerts.filter(a => a.id !== id);
        persistAlerts(updated);
    }, [alerts, persistAlerts]);

    const clearAllAlerts = useCallback(() => {
        persistAlerts([]);
    }, [persistAlerts]);

    return (
        <AlertContext.Provider value={{
            alerts,
            unreadCount,
            addAlert,
            markAsRead,
            markAllAsRead,
            deleteAlert: deleteAlertHandler,
            clearAllAlerts,
            loading,
        }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
}
