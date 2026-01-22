import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { generateId, getFromStorage, setToStorage } from '@/config/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type StoreAccessType = 'single' | 'multiple' | 'global';

export interface StoreInfo {
    id: string;
    name: string;
    shortName: string;
    city: string;
    country: string;
    isActive: boolean;
    isHeadquarters: boolean;
}

export interface UserStoreAssignment {
    id: string;
    userId: string;
    storeId: string;
    isPrimary: boolean;      // Primary store for this user
    canManage: boolean;      // Can manage store settings
    canViewReports: boolean; // Can view store reports
    canTransferStock: boolean; // Can transfer stock to/from this store
    assignedAt: string;
    assignedBy: string;
}

export interface UserAccessProfile {
    userId: string;
    accessType: StoreAccessType;
    isGlobalAccess: boolean;        // Can access ALL stores (superadmin, admin)
    assignedStoreIds: string[];     // Specific stores user can access
    primaryStoreId: string | null;  // Default store for user
    permissions: UserStorePermissions;
}

export interface UserStorePermissions {
    canCreateSales: boolean;
    canViewSales: boolean;
    canManageStock: boolean;
    canTransferStock: boolean;
    canViewReports: boolean;
    canManageClients: boolean;
    canViewAllStoresData: boolean;
    canManageStoreSettings: boolean;
}

interface StoreAccessContextType {
    // Store Data
    stores: StoreInfo[];
    activeStoreId: string | null;
    
    // User Access
    userAccessProfile: UserAccessProfile | null;
    accessibleStores: StoreInfo[];
    accessibleStoreIds: string[];  // Just the IDs for easier filtering
    accessType: StoreAccessType;
    isGlobalAccess: boolean;
    
    // Store Selection
    setActiveStore: (storeId: string) => void;
    canAccessStore: (storeId: string) => boolean;
    
    // Store Assignment Management (for admins)
    userStoreAssignments: UserStoreAssignment[];
    assignUserToStore: (userId: string, storeId: string, options?: Partial<UserStoreAssignment>) => void;
    removeUserFromStore: (userId: string, storeId: string) => void;
    updateUserStoreAssignment: (userId: string, storeId: string, updates: Partial<UserStoreAssignment>) => void;
    setUserGlobalAccess: (userId: string, isGlobal: boolean) => void;
    getUserAssignedStores: (userId: string) => string[];
    getUserAccessType: (userId: string) => StoreAccessType;
    getUserAccessProfile: (userId: string) => UserAccessProfile | null;
    getDefaultPermissions: (role: string) => { canCreate: boolean; canEdit: boolean; canDelete: boolean; canViewReports: boolean; canManageStock: boolean; canManageUsers: boolean };
    
    // Data Filtering Helpers
    filterByStore: <T extends { storeId?: string }>(items: T[]) => T[];
    filterByAccessibleStores: <T extends { storeId?: string }>(items: T[]) => T[];
    
    // Permissions
    hasPermission: (permission: keyof UserStorePermissions) => boolean;
    canPerformAction: (action: 'sale' | 'stock' | 'transfer' | 'report' | 'client' | 'settings' | 'create' | 'edit' | 'delete' | 'viewReports' | 'manageStock' | 'manageUsers', storeId?: string) => boolean;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    stores: 'sps_stores',
    storeAssignments: 'sps_user_store_assignments',
    userAccessProfiles: 'sps_user_access_profiles',
    activeStore: 'sps_active_store',
};

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultStores: StoreInfo[] = [
    {
        id: 'store-dla',
        name: 'Saddle Point Service - Douala (Siège)',
        shortName: 'SPS Douala',
        city: 'Douala',
        country: 'Cameroun',
        isActive: true,
        isHeadquarters: true,
    },
    {
        id: 'store-yde',
        name: 'Saddle Point Service - Yaoundé',
        shortName: 'SPS Yaoundé',
        city: 'Yaoundé',
        country: 'Cameroun',
        isActive: true,
        isHeadquarters: false,
    },
    {
        id: 'store-de',
        name: 'Saddle Point Service - Deutschland',
        shortName: 'SPS Germany',
        city: 'Frankfurt',
        country: 'Allemagne',
        isActive: true,
        isHeadquarters: false,
    },
];

// Default permissions by role
const getDefaultPermissionsByRole = (role: string): UserStorePermissions => {
    switch (role) {
        case 'superadmin':
            return {
                canCreateSales: true,
                canViewSales: true,
                canManageStock: true,
                canTransferStock: true,
                canViewReports: true,
                canManageClients: true,
                canViewAllStoresData: true,
                canManageStoreSettings: true,
            };
        case 'admin':
            return {
                canCreateSales: true,
                canViewSales: true,
                canManageStock: true,
                canTransferStock: true,
                canViewReports: true,
                canManageClients: true,
                canViewAllStoresData: true,
                canManageStoreSettings: true,
            };
        case 'manager':
            return {
                canCreateSales: true,
                canViewSales: true,
                canManageStock: true,
                canTransferStock: true,
                canViewReports: true,
                canManageClients: true,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
        case 'commercial':
            return {
                canCreateSales: true,
                canViewSales: true,
                canManageStock: false,
                canTransferStock: false,
                canViewReports: true,
                canManageClients: true,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
        case 'secretaire':
            return {
                canCreateSales: true,
                canViewSales: true,
                canManageStock: false,
                canTransferStock: false,
                canViewReports: false,
                canManageClients: true,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
        case 'comptable':
            return {
                canCreateSales: false,
                canViewSales: true,
                canManageStock: false,
                canTransferStock: false,
                canViewReports: true,
                canManageClients: false,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
        case 'client':
            return {
                canCreateSales: false,
                canViewSales: false,
                canManageStock: false,
                canTransferStock: false,
                canViewReports: false,
                canManageClients: false,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
        default:
            return {
                canCreateSales: false,
                canViewSales: false,
                canManageStock: false,
                canTransferStock: false,
                canViewReports: false,
                canManageClients: false,
                canViewAllStoresData: false,
                canManageStoreSettings: false,
            };
    }
};

// ============================================================================
// CONTEXT
// ============================================================================

const StoreAccessContext = createContext<StoreAccessContextType | undefined>(undefined);

export function StoreAccessProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    
    // State
    const [stores, setStores] = useState<StoreInfo[]>([]);
    const [userStoreAssignments, setUserStoreAssignments] = useState<UserStoreAssignment[]>([]);
    const [userAccessProfiles, setUserAccessProfiles] = useState<UserAccessProfile[]>([]);
    const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    useEffect(() => {
        // Load stores
        const savedStores = getFromStorage<StoreInfo[]>(STORAGE_KEYS.stores, []);
        if (savedStores.length > 0) {
            setStores(savedStores);
        } else {
            setStores(defaultStores);
            setToStorage(STORAGE_KEYS.stores, defaultStores);
        }
        
        // Load assignments
        const savedAssignments = getFromStorage<UserStoreAssignment[]>(STORAGE_KEYS.storeAssignments, []);
        setUserStoreAssignments(savedAssignments);
        
        // Load access profiles
        const savedProfiles = getFromStorage<UserAccessProfile[]>(STORAGE_KEYS.userAccessProfiles, []);
        setUserAccessProfiles(savedProfiles);
        
        // Load active store
        const savedActiveStore = getFromStorage<string | null>(STORAGE_KEYS.activeStore, null);
        setActiveStoreId(savedActiveStore);
    }, []);
    
    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================
    
    // Get current user's access profile
    const userAccessProfile = useMemo((): UserAccessProfile | null => {
        if (!user) return null;
        
        // Check if user already has a profile
        const existingProfile = userAccessProfiles.find(p => p.userId === user.id);
        if (existingProfile) return existingProfile;
        
        // Create default profile based on role
        const isGlobal = ['superadmin', 'admin'].includes(user.role);
        const assignments = userStoreAssignments.filter(a => a.userId === user.id);
        const assignedStoreIds = assignments.map(a => a.storeId);
        const primaryAssignment = assignments.find(a => a.isPrimary);
        
        let accessType: StoreAccessType = 'global';
        if (!isGlobal) {
            if (assignedStoreIds.length === 0) {
                // No assignment - assign to first store by default
                accessType = 'single';
            } else if (assignedStoreIds.length === 1) {
                accessType = 'single';
            } else {
                accessType = 'multiple';
            }
        }
        
        return {
            userId: user.id,
            accessType,
            isGlobalAccess: isGlobal,
            assignedStoreIds: isGlobal ? stores.map(s => s.id) : assignedStoreIds,
            primaryStoreId: primaryAssignment?.storeId || (assignedStoreIds[0] ?? stores[0]?.id ?? null),
            permissions: getDefaultPermissionsByRole(user.role),
        };
    }, [user, userAccessProfiles, userStoreAssignments, stores]);
    
    // Get accessible stores for current user
    const accessibleStores = useMemo((): StoreInfo[] => {
        if (!userAccessProfile) return [];
        
        if (userAccessProfile.isGlobalAccess) {
            return stores.filter(s => s.isActive);
        }
        
        return stores.filter(s => 
            s.isActive && userAccessProfile.assignedStoreIds.includes(s.id)
        );
    }, [userAccessProfile, stores]);
    
    const accessType = userAccessProfile?.accessType ?? 'single';
    const isGlobalAccess = userAccessProfile?.isGlobalAccess ?? false;
    
    // Set default active store if not set
    useEffect(() => {
        if (!activeStoreId && accessibleStores.length > 0 && userAccessProfile) {
            const defaultStore = userAccessProfile.primaryStoreId || accessibleStores[0]?.id;
            if (defaultStore) {
                setActiveStoreId(defaultStore);
                setToStorage(STORAGE_KEYS.activeStore, defaultStore);
            }
        }
    }, [activeStoreId, accessibleStores, userAccessProfile]);
    
    // ========================================================================
    // STORE SELECTION
    // ========================================================================
    
    const setActiveStore = useCallback((storeId: string) => {
        if (!userAccessProfile) return;
        
        // Verify user can access this store
        const canAccess = userAccessProfile.isGlobalAccess || 
                          userAccessProfile.assignedStoreIds.includes(storeId);
        
        if (canAccess) {
            setActiveStoreId(storeId);
            setToStorage(STORAGE_KEYS.activeStore, storeId);
        }
    }, [userAccessProfile]);
    
    const canAccessStore = useCallback((storeId: string): boolean => {
        if (!userAccessProfile) return false;
        return userAccessProfile.isGlobalAccess || 
               userAccessProfile.assignedStoreIds.includes(storeId);
    }, [userAccessProfile]);
    
    // ========================================================================
    // STORE ASSIGNMENT MANAGEMENT
    // ========================================================================
    
    const persistAssignments = useCallback((newAssignments: UserStoreAssignment[]) => {
        setUserStoreAssignments(newAssignments);
        setToStorage(STORAGE_KEYS.storeAssignments, newAssignments);
    }, []);
    
    const persistProfiles = useCallback((newProfiles: UserAccessProfile[]) => {
        setUserAccessProfiles(newProfiles);
        setToStorage(STORAGE_KEYS.userAccessProfiles, newProfiles);
    }, []);
    
    const assignUserToStore = useCallback((
        userId: string, 
        storeId: string, 
        options?: Partial<UserStoreAssignment>
    ) => {
        // Check if assignment already exists
        const existingIndex = userStoreAssignments.findIndex(
            a => a.userId === userId && a.storeId === storeId
        );
        
        if (existingIndex >= 0) {
            // Update existing assignment
            const updated = [...userStoreAssignments];
            updated[existingIndex] = { ...updated[existingIndex], ...options };
            persistAssignments(updated);
        } else {
            // Create new assignment
            const newAssignment: UserStoreAssignment = {
                id: generateId(),
                userId,
                storeId,
                isPrimary: options?.isPrimary ?? userStoreAssignments.filter(a => a.userId === userId).length === 0,
                canManage: options?.canManage ?? false,
                canViewReports: options?.canViewReports ?? true,
                canTransferStock: options?.canTransferStock ?? false,
                assignedAt: new Date().toISOString(),
                assignedBy: user?.id ?? 'system',
            };
            persistAssignments([...userStoreAssignments, newAssignment]);
        }
        
        // Update user's access profile
        updateUserAccessProfile(userId);
    }, [userStoreAssignments, user, persistAssignments]);
    
    const removeUserFromStore = useCallback((userId: string, storeId: string) => {
        const updated = userStoreAssignments.filter(
            a => !(a.userId === userId && a.storeId === storeId)
        );
        persistAssignments(updated);
        
        // Update user's access profile
        updateUserAccessProfile(userId);
    }, [userStoreAssignments, persistAssignments]);
    
    const updateUserStoreAssignment = useCallback((
        userId: string, 
        storeId: string, 
        updates: Partial<UserStoreAssignment>
    ) => {
        const updated = userStoreAssignments.map(a => 
            (a.userId === userId && a.storeId === storeId) 
                ? { ...a, ...updates } 
                : a
        );
        persistAssignments(updated);
    }, [userStoreAssignments, persistAssignments]);
    
    const setUserGlobalAccess = useCallback((userId: string, isGlobal: boolean) => {
        const existingProfile = userAccessProfiles.find(p => p.userId === userId);
        
        if (existingProfile) {
            const updated = userAccessProfiles.map(p => 
                p.userId === userId 
                    ? { 
                        ...p, 
                        isGlobalAccess: isGlobal,
                        accessType: isGlobal ? 'global' as StoreAccessType : p.accessType,
                        assignedStoreIds: isGlobal ? stores.map(s => s.id) : p.assignedStoreIds,
                    } 
                    : p
            );
            persistProfiles(updated);
        } else {
            const newProfile: UserAccessProfile = {
                userId,
                accessType: isGlobal ? 'global' : 'single',
                isGlobalAccess: isGlobal,
                assignedStoreIds: isGlobal ? stores.map(s => s.id) : [],
                primaryStoreId: stores[0]?.id ?? null,
                permissions: getDefaultPermissionsByRole('admin'),
            };
            persistProfiles([...userAccessProfiles, newProfile]);
        }
    }, [userAccessProfiles, stores, persistProfiles]);
    
    const updateUserAccessProfile = useCallback((userId: string) => {
        const assignments = userStoreAssignments.filter(a => a.userId === userId);
        const assignedStoreIds = assignments.map(a => a.storeId);
        const primaryAssignment = assignments.find(a => a.isPrimary);
        
        let accessType: StoreAccessType;
        if (assignedStoreIds.length === 0) {
            accessType = 'single';
        } else if (assignedStoreIds.length === 1) {
            accessType = 'single';
        } else {
            accessType = 'multiple';
        }
        
        const existingProfile = userAccessProfiles.find(p => p.userId === userId);
        
        if (existingProfile && !existingProfile.isGlobalAccess) {
            const updated = userAccessProfiles.map(p => 
                p.userId === userId 
                    ? { 
                        ...p, 
                        accessType,
                        assignedStoreIds,
                        primaryStoreId: primaryAssignment?.storeId || assignedStoreIds[0] || null,
                    } 
                    : p
            );
            persistProfiles(updated);
        }
    }, [userStoreAssignments, userAccessProfiles, persistProfiles]);
    
    const getUserAssignedStores = useCallback((userId: string): string[] => {
        return userStoreAssignments
            .filter(a => a.userId === userId)
            .map(a => a.storeId);
    }, [userStoreAssignments]);
    
    const getUserAccessType = useCallback((userId: string): StoreAccessType => {
        const profile = userAccessProfiles.find(p => p.userId === userId);
        if (profile?.isGlobalAccess) return 'global';
        
        const assignments = userStoreAssignments.filter(a => a.userId === userId);
        if (assignments.length === 0) return 'single';
        if (assignments.length === 1) return 'single';
        return 'multiple';
    }, [userAccessProfiles, userStoreAssignments]);
    
    // ========================================================================
    // DATA FILTERING
    // ========================================================================
    
    const filterByStore = useCallback(<T extends { storeId?: string }>(items: T[]): T[] => {
        if (!activeStoreId) return items;
        return items.filter(item => !item.storeId || item.storeId === activeStoreId);
    }, [activeStoreId]);
    
    const filterByAccessibleStores = useCallback(<T extends { storeId?: string }>(items: T[]): T[] => {
        if (!userAccessProfile) return [];
        
        if (userAccessProfile.isGlobalAccess) {
            return items;
        }
        
        return items.filter(item => 
            !item.storeId || userAccessProfile.assignedStoreIds.includes(item.storeId)
        );
    }, [userAccessProfile]);
    
    // ========================================================================
    // PERMISSIONS
    // ========================================================================
    
    const hasPermission = useCallback((permission: keyof UserStorePermissions): boolean => {
        if (!userAccessProfile) return false;
        return userAccessProfile.permissions[permission] ?? false;
    }, [userAccessProfile]);
    
    const canPerformAction = useCallback((
        action: 'sale' | 'stock' | 'transfer' | 'report' | 'client' | 'settings' | 'create' | 'edit' | 'delete' | 'viewReports' | 'manageStock' | 'manageUsers',
        _storeId?: string
    ): boolean => {
        if (!userAccessProfile) return false;
        
        switch (action) {
            case 'sale':
            case 'create':
                return userAccessProfile.permissions.canCreateSales;
            case 'stock':
            case 'edit':
            case 'manageStock':
                return userAccessProfile.permissions.canManageStock;
            case 'transfer':
                return userAccessProfile.permissions.canTransferStock;
            case 'report':
            case 'viewReports':
                return userAccessProfile.permissions.canViewReports;
            case 'client':
                return userAccessProfile.permissions.canManageClients;
            case 'settings':
            case 'delete':
            case 'manageUsers':
                return isGlobalAccess || userAccessProfile.permissions.canManageStoreSettings;
            default:
                return false;
        }
    }, [userAccessProfile, isGlobalAccess]);

    // Get accessible store IDs array
    const accessibleStoreIds = useMemo(() => {
        return accessibleStores.map(s => s.id);
    }, [accessibleStores]);

    // Get user access profile by user ID
    const getUserAccessProfile = useCallback((userId: string): UserAccessProfile | null => {
        return userAccessProfiles.find(p => p.userId === userId) || null;
    }, [userAccessProfiles]);

    // Get default permissions for a role
    const getDefaultPermissions = useCallback((role: string) => {
        switch (role) {
            case 'superadmin':
            case 'admin':
                return {
                    canCreate: true,
                    canEdit: true,
                    canDelete: true,
                    canViewReports: true,
                    canManageStock: true,
                    canManageUsers: true,
                };
            case 'manager':
                return {
                    canCreate: true,
                    canEdit: true,
                    canDelete: false,
                    canViewReports: true,
                    canManageStock: true,
                    canManageUsers: false,
                };
            case 'comptable':
                return {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canViewReports: true,
                    canManageStock: false,
                    canManageUsers: false,
                };
            case 'secretaire':
                return {
                    canCreate: true,
                    canEdit: true,
                    canDelete: false,
                    canViewReports: false,
                    canManageStock: false,
                    canManageUsers: false,
                };
            default:
                return {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canViewReports: false,
                    canManageStock: false,
                    canManageUsers: false,
                };
        }
    }, []);
    
    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================
    
    const value: StoreAccessContextType = {
        stores,
        activeStoreId,
        userAccessProfile,
        accessibleStores,
        accessibleStoreIds,
        accessType,
        isGlobalAccess,
        setActiveStore,
        canAccessStore,
        userStoreAssignments,
        assignUserToStore,
        removeUserFromStore,
        updateUserStoreAssignment,
        setUserGlobalAccess,
        getUserAssignedStores,
        getUserAccessType,
        getUserAccessProfile,
        getDefaultPermissions,
        filterByStore,
        filterByAccessibleStores,
        hasPermission,
        canPerformAction,
    };
    
    return (
        <StoreAccessContext.Provider value={value}>
            {children}
        </StoreAccessContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useStoreAccess() {
    const context = useContext(StoreAccessContext);
    if (context === undefined) {
        throw new Error('useStoreAccess must be used within a StoreAccessProvider');
    }
    return context;
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get only data for the currently active store
 */
export function useStoreFilteredData<T extends { storeId?: string }>(data: T[]): T[] {
    const { filterByStore } = useStoreAccess();
    return useMemo(() => filterByStore(data), [data, filterByStore]);
}

/**
 * Hook to get data for all accessible stores
 */
export function useAccessibleStoreData<T extends { storeId?: string }>(data: T[]): T[] {
    const { filterByAccessibleStores } = useStoreAccess();
    return useMemo(() => filterByAccessibleStores(data), [data, filterByAccessibleStores]);
}

/**
 * Hook to check if current user can access a specific store
 */
export function useCanAccessStore(storeId: string): boolean {
    const { canAccessStore } = useStoreAccess();
    return canAccessStore(storeId);
}
