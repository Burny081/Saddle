import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
    Trash2, 
    Shield, 
    Mail, 
    Search, 
    ArrowLeft, 
    UserPlus, 
    Building2, 
    Globe,
    Settings2,
    Check,
    X,
    Store
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Switch } from '@/app/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/app/components/ui/accordion';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth, User as UserType } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStoreAccess, UserStoreAssignment, StoreAccessType } from '@/contexts/StoreAccessContext';
import * as UserAPI from '@/utils/apiUserManagement';

interface UsersViewProps {
    onBack?: () => void;
}

export function UsersView({ onBack }: UsersViewProps) {
    const { users, addUser, deleteUser, user: currentUser } = useAuth();
    const { t } = useLanguage();
    const { 
        stores, 
        userStoreAssignments, 
        assignUserToStore, 
        removeUserFromStore, 
        setUserGlobalAccess,
        getUserAccessProfile,
        getDefaultPermissions
    } = useStoreAccess();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isStoreAssignmentOpen, setIsStoreAssignmentOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    
    // User groups from DB
    const [userGroups, setUserGroups] = useState<UserAPI.UserGroup[]>([]);

    // Load user groups from DB
    const loadUserGroups = useCallback(async () => {
        try {
            const groups = await UserAPI.getUserGroups();
            setUserGroups(groups);
        } catch (error) {
            console.error('Error loading user groups:', error);
        }
    }, []);
    
    useEffect(() => {
        loadUserGroups();
    }, [loadUserGroups]);
    
    // Keep userGroups for future use
    console.log('User groups loaded:', userGroups.length);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'secretaire' as string,
        accessType: 'single' as StoreAccessType,
        selectedStores: [] as string[],
        isGlobal: false,
    });

    // Store assignment form state
    const [storeAssignmentData, setStoreAssignmentData] = useState<{
        selectedStores: string[];
        isGlobal: boolean;
        permissions: Record<string, {
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canViewReports: boolean;
            canManageStock: boolean;
            canManageUsers: boolean;
        }>;
    }>({
        selectedStores: [],
        isGlobal: false,
        permissions: {},
    });

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if current user can add new users
    const canAddUsers = currentUser && ['superadmin', 'admin'].includes(currentUser.role);
    const canManageStoreAccess = currentUser && ['superadmin', 'admin', 'manager'].includes(currentUser.role);

    // Get available roles based on current user's role
    const availableRoles = useMemo(() => {
        const allRoles = [
            { value: 'admin', label: t('role.admin') },
            { value: 'manager', label: t('role.manager') },
            { value: 'secretaire', label: t('role.secretaire') },
            { value: 'comptable', label: t('role.comptable') },
            { value: 'commercial', label: t('role.commercial') },
            { value: 'client', label: t('role.clientLimited') },
        ];

        // Only superadmin can create admin users
        if (currentUser?.role === 'superadmin') {
            return allRoles; // Superadmin can create all roles except superadmin
        }

        // Admin can create all roles except admin and superadmin
        if (currentUser?.role === 'admin') {
            return allRoles.filter(role => role.value !== 'admin');
        }

        // Others cannot create users (but this shouldn't happen due to canAddUsers check)
        return [];
    }, [currentUser?.role, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Security check: prevent admin/superadmin creation by non-superadmin users
        if (formData.role === 'admin' && currentUser?.role !== 'superadmin') {
            alert(t('error.noPermissionAdmin'));
            return;
        }
        if (formData.role === 'superadmin') {
            alert(t('error.noPermissionSuperAdmin'));
            return;
        }

        const newUser: UserType = {
            id: crypto.randomUUID(),
            name: formData.name,
            email: formData.email,
            role: formData.role as UserType['role'],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        addUser(newUser, formData.password);

        // Set global access if selected
        if (formData.isGlobal) {
            setUserGlobalAccess(newUser.id, true);
        } else if (formData.selectedStores.length > 0) {
            // Assign to selected stores
            const defaultPerms = getDefaultPermissions(newUser.role);
            formData.selectedStores.forEach(storeId => {
                assignUserToStore(newUser.id, storeId, defaultPerms);
            });
        }

        setIsDialogOpen(false);
        setFormData({ 
            name: '', 
            email: '', 
            password: '', 
            role: 'secretaire',
            accessType: 'single',
            selectedStores: [],
            isGlobal: false,
        });
    };

    // Get user's store assignments
    const getUserStoreAssignments = (userId: string): UserStoreAssignment[] => {
        return userStoreAssignments.filter(a => a.userId === userId);
    };

    // Get user's access type
    const getUserAccessType = (userId: string): { type: StoreAccessType; isGlobal: boolean; storeCount: number } => {
        const profile = getUserAccessProfile(userId);
        if (!profile) {
            return { type: 'single', isGlobal: false, storeCount: 0 };
        }
        return { type: profile.accessType, isGlobal: profile.isGlobalAccess, storeCount: profile.assignedStoreIds.length };
    };

    const openStoreAssignment = (user: UserType) => {
        setSelectedUser(user);
        const assignments = getUserStoreAssignments(user.id);
        const profile = getUserAccessProfile(user.id);
        
        const permissions: Record<string, {
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canViewReports: boolean;
            canManageStock: boolean;
            canManageUsers: boolean;
        }> = {};
        
        assignments.forEach(a => {
            permissions[a.storeId] = {
                canCreate: a.canManage,
                canEdit: a.canManage,
                canDelete: a.canManage,
                canViewReports: a.canViewReports,
                canManageStock: a.canTransferStock,
                canManageUsers: a.canManage,
            };
        });

        setStoreAssignmentData({
            selectedStores: assignments.map(a => a.storeId),
            isGlobal: profile?.isGlobalAccess || false,
            permissions,
        });
        setIsStoreAssignmentOpen(true);
    };

    const handleStoreToggle = (storeId: string, checked: boolean) => {
        if (checked) {
            const defaultPerms = getDefaultPermissions(selectedUser?.role || 'secretaire');
            setStoreAssignmentData(prev => ({
                ...prev,
                selectedStores: [...prev.selectedStores, storeId],
                permissions: {
                    ...prev.permissions,
                    [storeId]: {
                        canCreate: defaultPerms.canCreate,
                        canEdit: defaultPerms.canEdit,
                        canDelete: defaultPerms.canDelete,
                        canViewReports: defaultPerms.canViewReports,
                        canManageStock: defaultPerms.canManageStock,
                        canManageUsers: defaultPerms.canManageUsers,
                    }
                }
            }));
        } else {
            setStoreAssignmentData(prev => {
                const newPermissions = { ...prev.permissions };
                delete newPermissions[storeId];
                return {
                    ...prev,
                    selectedStores: prev.selectedStores.filter(id => id !== storeId),
                    permissions: newPermissions,
                };
            });
        }
    };

    const handlePermissionChange = (storeId: string, permission: string, checked: boolean) => {
        setStoreAssignmentData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [storeId]: {
                    ...prev.permissions[storeId],
                    [permission]: checked,
                }
            }
        }));
    };

    const saveStoreAssignments = async () => {
        if (!selectedUser) return;

        try {
            // Get current assignments
            const currentAssignments = getUserStoreAssignments(selectedUser.id);
            
            // Remove stores that are no longer selected
            for (const a of currentAssignments) {
                if (!storeAssignmentData.selectedStores.includes(a.storeId)) {
                    removeUserFromStore(selectedUser.id, a.storeId);
                    // Also remove from DB
                    await UserAPI.removeUserFromStore(selectedUser.id, a.storeId);
                }
            }

            // Set global access
            setUserGlobalAccess(selectedUser.id, storeAssignmentData.isGlobal);

            // Add/update stores
            if (!storeAssignmentData.isGlobal) {
                for (const storeId of storeAssignmentData.selectedStores) {
                    const perms = storeAssignmentData.permissions[storeId];
                    if (perms) {
                        assignUserToStore(selectedUser.id, storeId, perms);
                        // Also save to DB
                        await UserAPI.assignUserToStore({
                            user_id: selectedUser.id,
                            store_id: storeId,
                            can_create: perms.canCreate,
                            can_edit: perms.canEdit,
                            can_delete: perms.canDelete,
                            can_view_reports: perms.canViewReports,
                            can_manage_stock: perms.canManageStock,
                            can_manage_users: perms.canManageUsers,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error saving store assignments:', error);
        } finally {
            setIsStoreAssignmentOpen(false);
            setSelectedUser(null);
        }
    };

    const getAccessTypeBadge = (userId: string) => {
        const { type, isGlobal, storeCount } = getUserAccessType(userId);
        
        if (isGlobal) {
            return (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('store.globalAccess')}
                </Badge>
            );
        }
        
        if (storeCount === 0) {
            return (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400">
                    <X className="h-3 w-3 mr-1" />
                    {t('store.noAssignedStores')}
                </Badge>
            );
        }
        
        if (type === 'single') {
            return (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                    <Building2 className="h-3 w-3 mr-1" />
                    {t('store.singleStore')}
                </Badge>
            );
        }
        
        return (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400">
                <Store className="h-3 w-3 mr-1" />
                {storeCount} {t('store.stores')}
            </Badge>
        );
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-600';
            case 'admin': return 'bg-red-600';
            case 'manager': return 'bg-green-600';
            case 'comptable': return 'bg-yellow-600';
            case 'client': return 'bg-cyan-600';
            default: return 'bg-blue-600';
        }
    };

    // Check if current user can delete the target user
    const canDeleteUser = (targetUser: UserType) => {
        if (!currentUser) return false;
        if (currentUser.id === targetUser.id) return false; // Can't delete self
        if (targetUser.role === 'superadmin') return false; // Can't delete superadmin
        if (currentUser.role === 'superadmin') return true; // Superadmin can delete anyone else
        if (currentUser.role === 'admin' && targetUser.role !== 'admin') return true; // Admin can delete non-admins
        return false;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                            aria-label={t('action.backToDashboard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{t('users.title')}</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {t('users.subtitle')}
                        </p>
                    </div>
                </div>
                {canAddUsers && (
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('users.addUser')}
                    </Button>
                )}
            </div>

            <Card className="border-none shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Liste des utilisateurs ({users.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('placeholder.search')}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label={t('placeholder.searchUser')}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers.map((u, index) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg ${getRoleBadgeColor(u.role)}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{u.name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Mail className="mr-1 h-3 w-3" />
                                                {u.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {canManageStoreAccess && u.role !== 'superadmin' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                onClick={() => openStoreAssignment(u)}
                                                aria-label={`${t('store.assignStores')} ${u.name}`}
                                            >
                                                <Settings2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDeleteUser(u) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => {
                                                    if (confirm(t('confirm.deleteUser'))) {
                                                        deleteUser(u.id);
                                                    }
                                                }}
                                                aria-label={`${t('action.delete')} ${u.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className={`${getRoleBadgeColor(u.role)} text-white`}>
                                            <Shield className="mr-1 h-3 w-3" />
                                            {u.role.toUpperCase()}
                                        </Badge>
                                        {u.role !== 'superadmin' && getAccessTypeBadge(u.id)}
                                    </div>
                                    
                                    {/* Show assigned stores preview */}
                                    {u.role !== 'superadmin' && !getUserAccessType(u.id).isGlobal && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {getUserStoreAssignments(u.id).slice(0, 2).map(assignment => {
                                                const store = stores.find(s => s.id === assignment.storeId);
                                                return store ? (
                                                    <Badge 
                                                        key={assignment.storeId} 
                                                        variant="outline" 
                                                        className="text-[10px] bg-slate-50 dark:bg-slate-800"
                                                    >
                                                        {store.shortName || store.city}
                                                    </Badge>
                                                ) : null;
                                            })}
                                            {getUserStoreAssignments(u.id).length > 2 && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    +{getUserStoreAssignments(u.id).length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('users.newUser')}</DialogTitle>
                        <DialogDescription>
                            {currentUser?.role === 'superadmin'
                                ? t('users.newUserDesc')
                                : t('users.newUserDescLimited')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="info">{t('label.details')}</TabsTrigger>
                                <TabsTrigger value="access">{t('store.accessProfile')}</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="info" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('label.fullName')}</Label>
                                        <Input
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('label.email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t('auth.password')}</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            minLength={8}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">{t('users.passwordMin8')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">{t('label.role')}</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRoles.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>
                                                        {role.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="access" className="space-y-4 py-4">
                                {/* Global Access Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">{t('store.globalAccess')}</p>
                                            <p className="text-sm text-muted-foreground">{t('store.viewAllData')}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isGlobal}
                                        onCheckedChange={(checked) => setFormData({ 
                                            ...formData, 
                                            isGlobal: checked,
                                            selectedStores: checked ? [] : formData.selectedStores
                                        })}
                                    />
                                </div>

                                {!formData.isGlobal && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <Label>{t('store.assignStores')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('store.accessType')}: {formData.selectedStores.length === 1 ? t('store.singleStore') : formData.selectedStores.length > 1 ? t('store.multipleStores') : t('store.noAssignedStores')}
                                            </p>
                                            <ScrollArea className="h-[200px] rounded-md border p-4">
                                                <div className="space-y-3">
                                                    {stores.map((store) => (
                                                        <div 
                                                            key={store.id} 
                                                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                                                        >
                                                            <Checkbox
                                                                id={`store-new-${store.id}`}
                                                                checked={formData.selectedStores.includes(store.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            selectedStores: [...formData.selectedStores, store.id]
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            selectedStores: formData.selectedStores.filter(id => id !== store.id)
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                                                store.isHeadquarters 
                                                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                                                                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
                                                            }`}>
                                                                <Building2 className="h-4 w-4 text-white" />
                                                            </div>
                                                            <label 
                                                                htmlFor={`store-new-${store.id}`} 
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="font-medium text-sm">{store.name}</p>
                                                                <p className="text-xs text-muted-foreground">{store.city}, {store.country}</p>
                                                            </label>
                                                            {store.isHeadquarters && (
                                                                <Badge variant="outline" className="text-[10px]">HQ</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                {t('action.cancel')}
                            </Button>
                            <Button type="submit" className="bg-blue-600 text-white">
                                {t('users.createUser')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Store Assignment Dialog */}
            <Dialog open={isStoreAssignmentOpen} onOpenChange={setIsStoreAssignmentOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {t('store.assignStores')} - {selectedUser?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {t('store.accessType')}: {selectedUser?.role}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {/* Global Access Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">{t('store.globalAccess')}</p>
                                    <p className="text-sm text-muted-foreground">{t('store.viewAllData')}</p>
                                </div>
                            </div>
                            <Switch
                                checked={storeAssignmentData.isGlobal}
                                onCheckedChange={(checked) => setStoreAssignmentData({ 
                                    ...storeAssignmentData, 
                                    isGlobal: checked
                                })}
                            />
                        </div>

                        {!storeAssignmentData.isGlobal && (
                            <>
                                <Separator />
                                
                                {/* Store Selection with Permissions */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base">{t('store.assignedStores')}</Label>
                                        <Badge variant="secondary">
                                            {storeAssignmentData.selectedStores.length} {t('store.stores')}
                                        </Badge>
                                    </div>
                                    
                                    <Accordion type="multiple" className="w-full">
                                        {stores.map((store) => {
                                            const isSelected = storeAssignmentData.selectedStores.includes(store.id);
                                            const perms = storeAssignmentData.permissions[store.id];
                                            
                                            return (
                                                <AccordionItem key={store.id} value={store.id}>
                                                    <div className="flex items-center gap-3 py-2 px-1">
                                                        <Checkbox
                                                            id={`store-${store.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleStoreToggle(store.id, !!checked)}
                                                        />
                                                        <AccordionTrigger className="flex-1 hover:no-underline py-0">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                                                    store.isHeadquarters 
                                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                                                                        : 'bg-gradient-to-br from-slate-500 to-slate-600'
                                                                }`}>
                                                                    <Building2 className="h-4 w-4 text-white" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-medium text-sm">{store.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{store.city}</p>
                                                                </div>
                                                                {store.isHeadquarters && (
                                                                    <Badge variant="outline" className="text-[10px] ml-2">HQ</Badge>
                                                                )}
                                                            </div>
                                                        </AccordionTrigger>
                                                    </div>
                                                    
                                                    <AccordionContent>
                                                        {isSelected && perms ? (
                                                            <div className="ml-11 p-4 rounded-lg bg-muted/30 space-y-3">
                                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                                    {t('store.permissions')}
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-create`}
                                                                            checked={perms.canCreate}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canCreate', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-create`} className="text-sm cursor-pointer">
                                                                            {t('store.canCreate')}
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-edit`}
                                                                            checked={perms.canEdit}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canEdit', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-edit`} className="text-sm cursor-pointer">
                                                                            {t('store.canEdit')}
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-delete`}
                                                                            checked={perms.canDelete}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canDelete', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-delete`} className="text-sm cursor-pointer">
                                                                            {t('store.canDelete')}
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-reports`}
                                                                            checked={perms.canViewReports}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canViewReports', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-reports`} className="text-sm cursor-pointer">
                                                                            {t('store.canViewReports')}
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-stock`}
                                                                            checked={perms.canManageStock}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canManageStock', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-stock`} className="text-sm cursor-pointer">
                                                                            {t('store.canManageStock')}
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`${store.id}-users`}
                                                                            checked={perms.canManageUsers}
                                                                            onCheckedChange={(checked) => handlePermissionChange(store.id, 'canManageUsers', !!checked)}
                                                                        />
                                                                        <label htmlFor={`${store.id}-users`} className="text-sm cursor-pointer">
                                                                            {t('store.canManageUsers')}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="ml-11 p-4 text-sm text-muted-foreground italic">
                                                                {t('store.addStore')}
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsStoreAssignmentOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={saveStoreAssignments} className="bg-blue-600 text-white">
                            <Check className="mr-2 h-4 w-4" />
                            {t('action.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
