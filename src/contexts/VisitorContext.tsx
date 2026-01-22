import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Visitor } from '@/types/compatibility';
import { API, generateId } from '@/config/constants';

interface VisitorContextType {
    visitors: Visitor[];
    logVisit: (page: string) => void;
    loading: boolean;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

// Helper to detect device type from user agent
const detectDevice = (userAgent: string): string => {
    if (/Mobile|Android|iPhone/.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/.test(userAgent)) return 'Tablet';
    return 'Desktop';
};

export function VisitorProvider({ children }: { children: React.ReactNode }) {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasLoggedSession, setHasLoggedSession] = useState(false);

    // Load visitors from localStorage on mount
    useEffect(() => {
        setLoading(true);
        try {
            const stored = localStorage.getItem('sps_visitors');
            if (stored) {
                setVisitors(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading visitors:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const logVisit = useCallback(async (page: string) => {
        // Avoid duplicate logs in same session
        if (hasLoggedSession) return;

        const sessionId = sessionStorage.getItem('visitor_session') || generateId();
        sessionStorage.setItem('visitor_session', sessionId);
        const now = new Date();

        const baseVisitor: Visitor = {
            id: generateId(),
            ip: '127.0.0.1',
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            location: 'Unknown',
            userAgent: navigator.userAgent,
            page,
            device: detectDevice(navigator.userAgent),
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(API.geoLocationUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('Failed to fetch geo data');

            const data = await res.json();

            const newVisitor: Visitor = {
                ...baseVisitor,
                ip: data?.ip || '127.0.0.1',
                location: data?.country_name && data?.city 
                    ? `${data.city}, ${data.country_name}` 
                    : 'Unknown',
            };

            setVisitors(prev => {
                const updated = [newVisitor, ...prev].slice(0, 100);
                localStorage.setItem('sps_visitors', JSON.stringify(updated));
                return updated;
            });
            setHasLoggedSession(true);

        } catch {
            // Fallback for offline or API failure
            setVisitors(prev => {
                const updated = [baseVisitor, ...prev].slice(0, 100);
                localStorage.setItem('sps_visitors', JSON.stringify(updated));
                return updated;
            });
            setHasLoggedSession(true);
        }
    }, [hasLoggedSession]);

    useEffect(() => {
        // Log initial entry
        logVisit(window.location.pathname);
    }, [logVisit]);

    return (
        <VisitorContext.Provider value={{ visitors, logVisit, loading }}>
            {children}
        </VisitorContext.Provider>
    );
}

export function useVisitor() {
    const context = useContext(VisitorContext);
    if (context === undefined) {
        throw new Error('useVisitor must be used within a VisitorProvider');
    }
    return context;
}
