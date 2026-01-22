/**
 * Store Access Hooks
 * 
 * Custom hooks for implementing store-based access control in components.
 * These hooks automatically filter data based on user's store assignments.
 */

import { useMemo } from 'react';
import { useStoreAccess } from '@/contexts/StoreAccessContext';
import { useData } from '@/contexts/DataContext';

// Type-safe property accessor
function getStoreIdFromItem<T>(item: T): string | undefined {
    if (item && typeof item === 'object') {
        if ('storeId' in item && typeof (item as Record<string, unknown>).storeId === 'string') {
            return (item as Record<string, unknown>).storeId as string;
        }
        if ('store_id' in item && typeof (item as Record<string, unknown>).store_id === 'string') {
            return (item as Record<string, unknown>).store_id as string;
        }
    }
    return undefined;
}

/**
 * Hook to get articles filtered by user's store access
 */
export function useStoreFilteredArticles() {
    const { articles } = useData();
    const { activeStoreId, isGlobalAccess, accessibleStoreIds } = useStoreAccess();

    return useMemo(() => {
        // If no active store and not global access, return empty (safety)
        if (!activeStoreId && !isGlobalAccess) {
            // If user has accessible stores but no active selection, show all accessible
            if (accessibleStoreIds.length > 0) {
                return articles.filter(article => {
                    const storeId = getStoreIdFromItem(article);
                    return !storeId || accessibleStoreIds.includes(storeId);
                });
            }
            return articles; // Show all if no store restrictions
        }

        // Global access with no specific store selected - show all
        if (isGlobalAccess && !activeStoreId) {
            return articles;
        }

        // Specific store selected - filter to that store or global items
        if (activeStoreId) {
            return articles.filter(article => {
                const storeId = getStoreIdFromItem(article);
                return !storeId || storeId === activeStoreId;
            });
        }

        return articles;
    }, [articles, activeStoreId, isGlobalAccess, accessibleStoreIds]);
}

/**
 * Hook to get services filtered by user's store access
 */
export function useStoreFilteredServices() {
    const { services } = useData();
    const { activeStoreId, isGlobalAccess, accessibleStoreIds } = useStoreAccess();

    return useMemo(() => {
        if (!activeStoreId && !isGlobalAccess) {
            if (accessibleStoreIds.length > 0) {
                return services.filter(service => {
                    const storeId = getStoreIdFromItem(service);
                    return !storeId || accessibleStoreIds.includes(storeId);
                });
            }
            return services;
        }

        if (isGlobalAccess && !activeStoreId) {
            return services;
        }

        if (activeStoreId) {
            return services.filter(service => {
                const storeId = getStoreIdFromItem(service);
                return !storeId || storeId === activeStoreId;
            });
        }

        return services;
    }, [services, activeStoreId, isGlobalAccess, accessibleStoreIds]);
}

/**
 * Hook to get clients filtered by user's store access
 */
export function useStoreFilteredClients() {
    const { clients } = useData();
    const { activeStoreId, isGlobalAccess, accessibleStoreIds } = useStoreAccess();

    return useMemo(() => {
        if (!activeStoreId && !isGlobalAccess) {
            if (accessibleStoreIds.length > 0) {
                return clients.filter(client => {
                    const storeId = getStoreIdFromItem(client);
                    return !storeId || accessibleStoreIds.includes(storeId);
                });
            }
            return clients;
        }

        if (isGlobalAccess && !activeStoreId) {
            return clients;
        }

        if (activeStoreId) {
            return clients.filter(client => {
                const storeId = getStoreIdFromItem(client);
                return !storeId || storeId === activeStoreId;
            });
        }

        return clients;
    }, [clients, activeStoreId, isGlobalAccess, accessibleStoreIds]);
}

/**
 * Hook to get sales filtered by user's store access
 */
export function useStoreFilteredSales() {
    const { sales } = useData();
    const { activeStoreId, isGlobalAccess, accessibleStoreIds } = useStoreAccess();

    return useMemo(() => {
        if (!activeStoreId && !isGlobalAccess) {
            if (accessibleStoreIds.length > 0) {
                return sales.filter(sale => {
                    const storeId = getStoreIdFromItem(sale);
                    return !storeId || accessibleStoreIds.includes(storeId);
                });
            }
            return sales;
        }

        if (isGlobalAccess && !activeStoreId) {
            return sales;
        }

        if (activeStoreId) {
            return sales.filter(sale => {
                const storeId = getStoreIdFromItem(sale);
                return !storeId || storeId === activeStoreId;
            });
        }

        return sales;
    }, [sales, activeStoreId, isGlobalAccess, accessibleStoreIds]);
}

/**
 * Generic hook to filter any array by store access
 */
export function useStoreFilteredData<T>(
    data: T[],
    options?: {
        storeIdField?: string;
        includeGlobalItems?: boolean;
    }
): T[] {
    const { activeStoreId, isGlobalAccess, accessibleStoreIds } = useStoreAccess();
    const storeIdField = options?.storeIdField || 'storeId';
    const includeGlobalItems = options?.includeGlobalItems ?? true;

    return useMemo(() => {
        const getItemStoreId = (item: T): string | undefined => {
            if (item && typeof item === 'object' && storeIdField in item) {
                const value = (item as Record<string, unknown>)[storeIdField];
                return typeof value === 'string' ? value : undefined;
            }
            return undefined;
        };

        if (!activeStoreId && !isGlobalAccess) {
            if (accessibleStoreIds.length > 0) {
                return data.filter(item => {
                    const itemStoreId = getItemStoreId(item);
                    return (includeGlobalItems && !itemStoreId) || 
                           (itemStoreId && accessibleStoreIds.includes(itemStoreId));
                });
            }
            return data;
        }

        if (isGlobalAccess && !activeStoreId) {
            return data;
        }

        if (activeStoreId) {
            return data.filter(item => {
                const itemStoreId = getItemStoreId(item);
                return (includeGlobalItems && !itemStoreId) || itemStoreId === activeStoreId;
            });
        }

        return data;
    }, [data, activeStoreId, isGlobalAccess, accessibleStoreIds, storeIdField, includeGlobalItems]);
}

/**
 * Hook to check if user can perform an action on the current store
 */
export function useStorePermission(permission: 'create' | 'edit' | 'delete' | 'viewReports' | 'manageStock' | 'manageUsers'): boolean {
    const { activeStoreId, canPerformAction, isGlobalAccess } = useStoreAccess();

    return useMemo(() => {
        if (isGlobalAccess) return true;
        if (!activeStoreId) return false;
        return canPerformAction(permission, activeStoreId);
    }, [activeStoreId, canPerformAction, isGlobalAccess, permission]);
}

/**
 * Hook to get the active store info
 */
export function useActiveStore() {
    const { activeStoreId, stores } = useStoreAccess();

    return useMemo(() => {
        if (!activeStoreId) return null;
        return stores.find(s => s.id === activeStoreId) || null;
    }, [activeStoreId, stores]);
}

/**
 * Hook to check if user should see store selector
 */
export function useShouldShowStoreSelector(): boolean {
    const { accessType, isGlobalAccess, accessibleStores } = useStoreAccess();

    return useMemo(() => {
        // Show selector if global access or multiple stores
        if (isGlobalAccess) return true;
        if (accessType === 'multiple') return true;
        if (accessibleStores.length > 1) return true;
        return false;
    }, [accessType, isGlobalAccess, accessibleStores]);
}

/**
 * Hook to get store-aware form defaults
 */
export function useStoreFormDefaults() {
    const { activeStoreId, accessibleStores, isGlobalAccess } = useStoreAccess();

    return useMemo(() => ({
        defaultStoreId: activeStoreId || (accessibleStores[0]?.id || ''),
        availableStores: isGlobalAccess ? [] : accessibleStores,
        shouldShowStoreField: isGlobalAccess || accessibleStores.length > 1,
        isGlobalAccess,
    }), [activeStoreId, accessibleStores, isGlobalAccess]);
}
