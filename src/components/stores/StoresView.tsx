import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Store,
    Plus,
    Search,
    Edit,
    Trash2,
    Save,
    X,
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Clock,
    User,
    Globe,
    Building2,
    Users,
    Image as ImageIcon,
    Star,
    Shield,
    ChevronDown,
    ChevronUp,
    Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/app/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateId } from '@/config/constants';
import * as StoresAPI from '@/utils/apiStores';

// Store interface
export interface StoreInfo {
    id: string;
    name: string;
    shortName: string;
    country: string;
    city: string;
    address: string;
    postalCode: string;
    phone: string;
    alternatePhone?: string;
    email: string;
    website?: string;
    manager: string;
    managerEmail?: string;
    managerPhone?: string;
    // Working hours
    workingDays: string;
    openTime: string;
    closeTime: string;
    // Additional info
    yearsOfExpertise: number;
    foundedYear: number;
    services: string[];
    features: string[];
    image: string;
    isHeadquarters: boolean;
    isActive: boolean;
    // Tax & legal
    taxId?: string;
    registrationNumber?: string;
    // Coordinates for map
    coordinates?: { lat: number; lng: number };
    createdAt: string;
    updatedAt: string;
}

// User Group interface
export interface UserGroup {
    id: string;
    name: string;
    description: string;
    storeIds: string[]; // Empty means all stores (company-wide)
    isCompanyWide: boolean;
    permissions: string[];
    createdAt: string;
}

interface StoresViewProps {
    onBack?: () => void;
}

const STORAGE_KEY_STORES = 'sps_stores';
const STORAGE_KEY_GROUPS = 'sps_user_groups';

// Default stores data
const defaultStores: StoreInfo[] = [
    {
        id: 'store-yde',
        name: 'Saddle Point Service - Yaoundé',
        shortName: 'SPS Yaoundé',
        country: 'Cameroun',
        city: 'Yaoundé',
        address: 'Bastos, Avenue des Ambassades, Face ambassade du Nigeria',
        postalCode: 'BP 1234',
        phone: '+237 699 00 11 22',
        alternatePhone: '+237 222 20 11 22',
        email: 'yaounde@saddlepoint.cm',
        website: 'https://saddlepoint.cm',
        manager: 'M. Jean-Pierre Manga',
        managerEmail: 'jp.manga@saddlepoint.cm',
        managerPhone: '+237 699 00 11 23',
        workingDays: 'Lundi - Samedi',
        openTime: '08:00',
        closeTime: '18:00',
        yearsOfExpertise: 15,
        foundedYear: 2011,
        services: ['Vente', 'Installation', 'Maintenance', 'Conseil'],
        features: ['Showroom', 'Service Technique', 'Vente Directe', 'Support Pro', 'Parking'],
        image: '',
        isHeadquarters: true,
        isActive: true,
        taxId: 'M012400000000A',
        registrationNumber: 'RC/YDE/2011/B/0001',
        coordinates: { lat: 3.8480, lng: 11.5021 },
        createdAt: '2011-03-15T00:00:00',
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'store-dla',
        name: 'Saddle Point Service - Douala',
        shortName: 'SPS Douala',
        country: 'Cameroun',
        city: 'Douala',
        address: 'Akwa, Boulevard de la Liberté, Ancien immeuble Air France',
        postalCode: 'BP 5678',
        phone: '+237 677 33 44 55',
        alternatePhone: '+237 233 42 33 44',
        email: 'douala@saddlepoint.cm',
        website: 'https://saddlepoint.cm/douala',
        manager: 'Mme. Sarah Eboa',
        managerEmail: 's.eboa@saddlepoint.cm',
        managerPhone: '+237 677 33 44 56',
        workingDays: 'Lundi - Samedi',
        openTime: '08:30',
        closeTime: '18:30',
        yearsOfExpertise: 12,
        foundedYear: 2014,
        services: ['Vente', 'Installation', 'Logistique', 'Formation'],
        features: ['Showroom', 'Vente en Gros', 'Logistique', 'Formation', 'Entrepôt'],
        image: '',
        isHeadquarters: false,
        isActive: true,
        taxId: 'M012400000001B',
        registrationNumber: 'RC/DLA/2014/B/0123',
        coordinates: { lat: 4.0511, lng: 9.7679 },
        createdAt: '2014-06-20T00:00:00',
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'store-de',
        name: 'Saddle Point Service - Deutschland',
        shortName: 'SPS Germany',
        country: 'Allemagne',
        city: 'Frankfurt',
        address: 'Kaiserstraße 45, 60329 Frankfurt am Main',
        postalCode: '60329',
        phone: '+49 69 123 456 78',
        alternatePhone: '+49 69 123 456 79',
        email: 'germany@saddlepoint.de',
        website: 'https://saddlepoint.de',
        manager: 'Herr Klaus Weber',
        managerEmail: 'k.weber@saddlepoint.de',
        managerPhone: '+49 151 123 456 78',
        workingDays: 'Montag - Freitag',
        openTime: '09:00',
        closeTime: '18:00',
        yearsOfExpertise: 3,
        foundedYear: 2023,
        services: ['Sales', 'Installation', 'Consulting', 'Support'],
        features: ['Showroom', 'Technical Support', 'Training Center', 'Warehouse'],
        image: '',
        isHeadquarters: false,
        isActive: true,
        taxId: 'DE123456789',
        registrationNumber: 'HRB 123456',
        coordinates: { lat: 50.1109, lng: 8.6821 },
        createdAt: '2023-01-15T00:00:00',
        updatedAt: new Date().toISOString(),
    }
];

// Default user groups
const defaultUserGroups: UserGroup[] = [
    {
        id: 'group-company',
        name: 'Équipe Globale',
        description: 'Accès à toutes les boutiques de l\'entreprise',
        storeIds: [],
        isCompanyWide: true,
        permissions: ['view_all', 'edit_all', 'manage_stock', 'manage_sales'],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'group-cameroon',
        name: 'Équipe Cameroun',
        description: 'Accès aux boutiques du Cameroun uniquement',
        storeIds: ['store-yde', 'store-dla'],
        isCompanyWide: false,
        permissions: ['view_store', 'edit_store', 'manage_stock'],
        createdAt: new Date().toISOString(),
    },
];

const emptyStore: Omit<StoreInfo, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    shortName: '',
    country: '',
    city: '',
    address: '',
    postalCode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    website: '',
    manager: '',
    managerEmail: '',
    managerPhone: '',
    workingDays: 'Lundi - Samedi',
    openTime: '08:00',
    closeTime: '18:00',
    yearsOfExpertise: 0,
    foundedYear: new Date().getFullYear(),
    services: [],
    features: [],
    image: '',
    isHeadquarters: false,
    isActive: true,
    taxId: '',
    registrationNumber: '',
};

export function StoresView({ onBack }: StoresViewProps) {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State
    const [stores, setStores] = useState<StoreInfo[]>([]);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<StoreInfo | null>(null);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [formData, setFormData] = useState<Omit<StoreInfo, 'id' | 'createdAt' | 'updatedAt'>>(emptyStore);
    const [newService, setNewService] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [expandedStore, setExpandedStore] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('stores');

    // Group form state
    const [groupFormData, setGroupFormData] = useState({
        name: '',
        description: '',
        storeIds: [] as string[],
        isCompanyWide: false,
        permissions: [] as string[],
    });

    // Load data from Supabase (with localStorage fallback)
    useEffect(() => {
        const loadStores = async () => {
            try {
                const apiStores = await StoresAPI.getStores();
                if (apiStores.length > 0) {
                    // Map API data to local interface
                    const mappedStores: StoreInfo[] = apiStores.map(s => ({
                        id: s.id,
                        name: s.name,
                        shortName: s.short_name || '',
                        country: s.country,
                        city: s.city,
                        address: s.address || '',
                        postalCode: s.postal_code || '',
                        phone: s.phone || '',
                        alternatePhone: s.alternate_phone,
                        email: s.email || '',
                        website: s.website,
                        manager: s.manager || '',
                        managerEmail: s.manager_email,
                        managerPhone: s.manager_phone,
                        workingDays: s.working_days || 'Lundi - Samedi',
                        openTime: s.open_time || '08:00',
                        closeTime: s.close_time || '18:00',
                        yearsOfExpertise: s.years_of_expertise || 0,
                        foundedYear: s.founded_year || new Date().getFullYear(),
                        services: [],
                        features: [],
                        image: s.image || '',
                        isHeadquarters: s.is_headquarters,
                        isActive: s.is_active,
                        taxId: s.tax_id,
                        registrationNumber: s.registration_number,
                        coordinates: s.latitude && s.longitude ? { lat: s.latitude, lng: s.longitude } : undefined,
                        createdAt: s.created_at || new Date().toISOString(),
                        updatedAt: s.updated_at || new Date().toISOString(),
                    }));
                    setStores(mappedStores);
                } else {
                    setStores(defaultStores);
                }
            } catch (err) {
                console.warn('Failed to load stores from Supabase:', err);
                // Fallback to localStorage
                const savedStores = localStorage.getItem(STORAGE_KEY_STORES);
                if (savedStores) {
                    setStores(JSON.parse(savedStores));
                } else {
                    setStores(defaultStores);
                }
            }
        };

        const loadGroups = () => {
            const savedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
            if (savedGroups) {
                setUserGroups(JSON.parse(savedGroups));
            } else {
                setUserGroups(defaultUserGroups);
                localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(defaultUserGroups));
            }
        };

        loadStores();
        loadGroups();
    }, []);

    // Save stores to Supabase (with localStorage backup)
    const saveStores = async (newStores: StoreInfo[]) => {
        setStores(newStores);
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(newStores));
    };

    // Save groups to localStorage
    const saveGroups = (newGroups: UserGroup[]) => {
        setUserGroups(newGroups);
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(newGroups));
    };

    // Get unique countries
    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(stores.map(s => s.country))];
        return uniqueCountries.sort();
    }, [stores]);

    // Filtered stores
    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            const matchesSearch =
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.manager.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCountry = selectedCountry === 'all' || store.country === selectedCountry;
            return matchesSearch && matchesCountry;
        });
    }, [stores, searchTerm, selectedCountry]);

    // Handle create/edit store
    const handleSaveStore = async () => {
        if (!formData.name || !formData.city || !formData.country || !formData.email || !formData.phone) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const now = new Date().toISOString();

        // Map local data to API format
        const apiStoreData: Parameters<typeof StoresAPI.createStore>[0] = {
            id: editingStore?.id || `store-${generateId()}`,
            name: formData.name,
            short_name: formData.shortName,
            country: formData.country,
            city: formData.city,
            address: formData.address,
            postal_code: formData.postalCode,
            phone: formData.phone,
            alternate_phone: formData.alternatePhone || undefined,
            email: formData.email,
            website: formData.website || undefined,
            manager: formData.manager,
            manager_email: formData.managerEmail || undefined,
            manager_phone: formData.managerPhone || undefined,
            working_days: formData.workingDays,
            open_time: formData.openTime,
            close_time: formData.closeTime,
            years_of_expertise: formData.yearsOfExpertise,
            founded_year: formData.foundedYear,
            image: formData.image,
            is_headquarters: formData.isHeadquarters,
            is_active: formData.isActive,
            tax_id: formData.taxId || undefined,
            registration_number: formData.registrationNumber || undefined,
            latitude: formData.coordinates?.lat,
            longitude: formData.coordinates?.lng
        };

        try {
            if (editingStore) {
                // Update existing store in Supabase
                await StoresAPI.updateStore(editingStore.id, apiStoreData);
                const updatedStores = stores.map(store =>
                    store.id === editingStore.id
                        ? { ...store, ...formData, updatedAt: now }
                        : store
                );
                saveStores(updatedStores);
            } else {
                // Create new store in Supabase
                await StoresAPI.createStore(apiStoreData);
                const newStore: StoreInfo = {
                    ...formData,
                    id: apiStoreData.id,
                    createdAt: now,
                    updatedAt: now,
                };
                saveStores([...stores, newStore]);
            }
        } catch (err) {
            console.error('Failed to save store to Supabase:', err);
            // Still update local state
            if (editingStore) {
                const updatedStores = stores.map(store =>
                    store.id === editingStore.id
                        ? { ...store, ...formData, updatedAt: now }
                        : store
                );
                saveStores(updatedStores);
            } else {
                const newStore: StoreInfo = {
                    ...formData,
                    id: apiStoreData.id,
                    createdAt: now,
                    updatedAt: now,
                };
                saveStores([...stores, newStore]);
            }
        }

        setIsDialogOpen(false);
        setEditingStore(null);
        setFormData(emptyStore);
    };

    // Handle delete store
    const handleDeleteStore = async (storeId: string) => {
        try {
            await StoresAPI.deleteStore(storeId);
        } catch (err) {
            console.error('Failed to delete store from Supabase:', err);
        }
        const updatedStores = stores.filter(store => store.id !== storeId);
        saveStores(updatedStores);
    };

    // Handle edit store
    const handleEditStore = (store: StoreInfo) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            shortName: store.shortName,
            country: store.country,
            city: store.city,
            address: store.address,
            postalCode: store.postalCode,
            phone: store.phone,
            alternatePhone: store.alternatePhone || '',
            email: store.email,
            website: store.website || '',
            manager: store.manager,
            managerEmail: store.managerEmail || '',
            managerPhone: store.managerPhone || '',
            workingDays: store.workingDays,
            openTime: store.openTime,
            closeTime: store.closeTime,
            yearsOfExpertise: store.yearsOfExpertise,
            foundedYear: store.foundedYear,
            services: store.services,
            features: store.features,
            image: store.image,
            isHeadquarters: store.isHeadquarters,
            isActive: store.isActive,
            taxId: store.taxId || '',
            registrationNumber: store.registrationNumber || '',
            coordinates: store.coordinates,
        });
        setIsDialogOpen(true);
    };

    // Handle toggle store active
    const handleToggleActive = (storeId: string) => {
        const updatedStores = stores.map(store =>
            store.id === storeId
                ? { ...store, isActive: !store.isActive, updatedAt: new Date().toISOString() }
                : store
        );
        saveStores(updatedStores);
    };

    // Add service
    const addService = () => {
        if (newService.trim() && !formData.services.includes(newService.trim())) {
            setFormData({ ...formData, services: [...formData.services, newService.trim()] });
            setNewService('');
        }
    };

    // Remove service
    const removeService = (service: string) => {
        setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
    };

    // Add feature
    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    // Remove feature
    const removeFeature = (feature: string) => {
        setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
    };

    // Handle save user group
    const handleSaveGroup = () => {
        if (!groupFormData.name) {
            alert('Veuillez entrer un nom pour le groupe');
            return;
        }

        const now = new Date().toISOString();

        if (editingGroup) {
            const updatedGroups = userGroups.map(group =>
                group.id === editingGroup.id
                    ? { ...group, ...groupFormData }
                    : group
            );
            saveGroups(updatedGroups);
        } else {
            const newGroup: UserGroup = {
                id: `group-${generateId()}`,
                ...groupFormData,
                createdAt: now,
            };
            saveGroups([...userGroups, newGroup]);
        }

        setIsGroupDialogOpen(false);
        setEditingGroup(null);
        setGroupFormData({
            name: '',
            description: '',
            storeIds: [],
            isCompanyWide: false,
            permissions: [],
        });
    };

    // Handle edit group
    const handleEditGroup = (group: UserGroup) => {
        setEditingGroup(group);
        setGroupFormData({
            name: group.name,
            description: group.description,
            storeIds: group.storeIds,
            isCompanyWide: group.isCompanyWide,
            permissions: group.permissions,
        });
        setIsGroupDialogOpen(true);
    };

    // Handle delete group
    const handleDeleteGroup = (groupId: string) => {
        const updatedGroups = userGroups.filter(group => group.id !== groupId);
        saveGroups(updatedGroups);
    };

    // Toggle store in group
    const toggleStoreInGroup = (storeId: string) => {
        const newStoreIds = groupFormData.storeIds.includes(storeId)
            ? groupFormData.storeIds.filter(id => id !== storeId)
            : [...groupFormData.storeIds, storeId];
        setGroupFormData({ ...groupFormData, storeIds: newStoreIds });
    };

    // Permission options
    const permissionOptions = [
        { id: 'view_store', label: 'Voir les informations' },
        { id: 'edit_store', label: 'Modifier les informations' },
        { id: 'manage_stock', label: 'Gérer le stock' },
        { id: 'manage_sales', label: 'Gérer les ventes' },
        { id: 'view_reports', label: 'Voir les rapports' },
        { id: 'manage_users', label: 'Gérer les utilisateurs' },
    ];

    // Toggle permission
    const togglePermission = (permissionId: string) => {
        const newPermissions = groupFormData.permissions.includes(permissionId)
            ? groupFormData.permissions.filter(p => p !== permissionId)
            : [...groupFormData.permissions, permissionId];
        setGroupFormData({ ...groupFormData, permissions: newPermissions });
    };

    const canEdit = user && ['superadmin', 'admin'].includes(user.role);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Store className="h-7 w-7 text-blue-600" />
                            {t('stores.title')}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {t('stores.storeCount', { count: stores.length, active: stores.filter(s => s.isActive).length })}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <Button
                        onClick={() => {
                            setEditingStore(null);
                            setFormData(emptyStore);
                            setIsDialogOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('stores.newStore')}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="stores" className="gap-2">
                        <Store className="h-4 w-4" />
                        {t('stores.stores')}
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="gap-2">
                        <Users className="h-4 w-4" />
                        {t('stores.userGroups')}
                    </TabsTrigger>
                </TabsList>

                {/* Stores Tab */}
                <TabsContent value="stores" className="space-y-4">
                    {/* Filters */}
                    <Card className="border-none shadow-md">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('placeholder.searchStore')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder={t('stores.allCountries')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('stores.allCountries')}</SelectItem>
                                        {countries.map(country => (
                                            <SelectItem key={country} value={country}>{country}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Store Cards */}
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {filteredStores.map((store) => (
                                <motion.div
                                    key={store.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Card className={`border-none shadow-lg overflow-hidden ${!store.isActive ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Image */}
                                            <div className="relative w-full lg:w-64 h-48 lg:h-auto flex-shrink-0">
                                                {store.image ? (
                                                    <img
                                                        src={store.image}
                                                        alt={store.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {store.isHeadquarters && (
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className="bg-amber-500 text-white">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            {t('headquarters')}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {!store.isActive && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge variant="secondary">{t('inactive')}</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-4 lg:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{store.name}</h3>
                                                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {store.city}, {store.country}
                                                        </p>
                                                    </div>
                                                    {canEdit && (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditStore(store)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Switch
                                                                checked={store.isActive}
                                                                onCheckedChange={() => handleToggleActive(store.id)}
                                                            />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>{t('confirm.deleteStore')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('confirm.deleteStoreDesc')}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                            onClick={() => handleDeleteStore(store.id)}
                                                                        >
                                                                            {t('action.delete')}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quick Info Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-blue-500" />
                                                        <span className="truncate">{store.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-green-500" />
                                                        <span className="truncate">{store.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-4 w-4 text-amber-500" />
                                                        <span>{store.openTime} - {store.closeTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-purple-500" />
                                                        <span className="truncate">{store.manager}</span>
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {store.features.slice(0, 4).map((feature) => (
                                                        <Badge key={feature} variant="secondary">{feature}</Badge>
                                                    ))}
                                                    {store.features.length > 4 && (
                                                        <Badge variant="outline">+{store.features.length - 4}</Badge>
                                                    )}
                                                </div>

                                                {/* Expand/Collapse Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                                                    className="text-muted-foreground"
                                                >
                                                    {expandedStore === store.id ? (
                                                        <>
                                                            <ChevronUp className="mr-1 h-4 w-4" />
                                                            {t('stores.seeLess')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="mr-1 h-4 w-4" />
                                                            {t('stores.seeMore')}
                                                        </>
                                                    )}
                                                </Button>

                                                {/* Expanded Details */}
                                                <AnimatePresence>
                                                    {expandedStore === store.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-4 pt-4 border-t grid gap-4 sm:grid-cols-2">
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                                        <Building2 className="h-4 w-4" />
                                                                        Informations Légales
                                                                    </h4>
                                                                    <div className="space-y-1 text-sm">
                                                                        <p><span className="text-muted-foreground">N° Fiscal:</span> {store.taxId || 'N/A'}</p>
                                                                        <p><span className="text-muted-foreground">RCCM:</span> {store.registrationNumber || 'N/A'}</p>
                                                                        <p><span className="text-muted-foreground">Fondée en:</span> {store.foundedYear}</p>
                                                                        <p><span className="text-muted-foreground">Expertise:</span> {store.yearsOfExpertise} ans</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                                        <User className="h-4 w-4" />
                                                                        Contact Manager
                                                                    </h4>
                                                                    <div className="space-y-1 text-sm">
                                                                        <p><span className="text-muted-foreground">Nom:</span> {store.manager}</p>
                                                                        <p><span className="text-muted-foreground">Email:</span> {store.managerEmail || 'N/A'}</p>
                                                                        <p><span className="text-muted-foreground">Tél:</span> {store.managerPhone || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4" />
                                                                        Adresse Complète
                                                                    </h4>
                                                                    <p className="text-sm">{store.address}</p>
                                                                    <p className="text-sm text-muted-foreground">{store.postalCode} {store.city}</p>
                                                                    {store.alternatePhone && (
                                                                        <p className="text-sm mt-1">
                                                                            <span className="text-muted-foreground">Tél. alt:</span> {store.alternatePhone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                                        <Settings className="h-4 w-4" />
                                                                        Services Disponibles
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {store.services.map(service => (
                                                                            <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredStores.length === 0 && (
                            <Card className="border-none shadow-lg">
                                <CardContent className="py-12 text-center">
                                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">{t('stores.noStoresFound')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* User Groups Tab */}
                <TabsContent value="groups" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">
                            {t('stores.groupsDescription')}
                        </p>
                        {canEdit && (
                            <Button
                                onClick={() => {
                                    setEditingGroup(null);
                                    setGroupFormData({
                                        name: '',
                                        description: '',
                                        storeIds: [],
                                        isCompanyWide: false,
                                        permissions: [],
                                    });
                                    setIsGroupDialogOpen(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t('stores.newGroup')}
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {userGroups.map(group => (
                            <Card key={group.id} className="border-none shadow-lg">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {group.isCompanyWide ? (
                                                    <Globe className="h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <Shield className="h-5 w-5 text-purple-500" />
                                                )}
                                                {group.name}
                                            </CardTitle>
                                            <CardDescription>{group.description}</CardDescription>
                                        </div>
                                        {canEdit && (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('confirm.deleteGroup')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t('confirm.deleteGroupDesc')}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive"
                                                                onClick={() => handleDeleteGroup(group.id)}
                                                            >
                                                                {t('action.delete')}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium mb-1">Boutiques:</p>
                                            {group.isCompanyWide ? (
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    Toutes les boutiques
                                                </Badge>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {group.storeIds.map(storeId => {
                                                        const store = stores.find(s => s.id === storeId);
                                                        return store ? (
                                                            <Badge key={storeId} variant="secondary">
                                                                {store.shortName}
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Permissions:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {group.permissions.map(perm => {
                                                    const permLabel = permissionOptions.find(p => p.id === perm)?.label;
                                                    return (
                                                        <Badge key={perm} variant="outline" className="text-xs">
                                                            {permLabel || perm}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Store Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingStore ? 'Modifier la Boutique' : 'Nouvelle Boutique'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="name">Nom de la boutique *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Saddle Point Service - City"
                                />
                            </div>
                            <div>
                                <Label htmlFor="shortName">Nom court</Label>
                                <Input
                                    id="shortName"
                                    value={formData.shortName}
                                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                                    placeholder="SPS City"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Pays *</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Cameroun"
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Ville *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Douala"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">Code Postal</Label>
                                <Input
                                    id="postalCode"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    placeholder="BP 1234"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="address">Adresse complète *</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Rue Principale, Quartier"
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+237 6XX XX XX XX"
                                />
                            </div>
                            <div>
                                <Label htmlFor="alternatePhone">Téléphone secondaire</Label>
                                <Input
                                    id="alternatePhone"
                                    value={formData.alternatePhone}
                                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                                    placeholder="+237 2XX XX XX XX"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="boutique@saddlepoint.cm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="website">Site Web</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://saddlepoint.cm"
                                />
                            </div>
                        </div>

                        {/* Manager Info */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="manager">Responsable</Label>
                                <Input
                                    id="manager"
                                    value={formData.manager}
                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                    placeholder="M. John Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="managerEmail">Email Responsable</Label>
                                <Input
                                    id="managerEmail"
                                    type="email"
                                    value={formData.managerEmail}
                                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                                    placeholder="manager@saddlepoint.cm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="managerPhone">Tél. Responsable</Label>
                                <Input
                                    id="managerPhone"
                                    value={formData.managerPhone}
                                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                                    placeholder="+237 6XX XX XX XX"
                                />
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="workingDays">Jours ouvrables</Label>
                                <Input
                                    id="workingDays"
                                    value={formData.workingDays}
                                    onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                                    placeholder="Lundi - Samedi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="openTime">Heure d'ouverture</Label>
                                <Input
                                    id="openTime"
                                    type="time"
                                    value={formData.openTime}
                                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="closeTime">Heure de fermeture</Label>
                                <Input
                                    id="closeTime"
                                    type="time"
                                    value={formData.closeTime}
                                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Legal & Years */}
                        <div className="grid gap-4 sm:grid-cols-4">
                            <div>
                                <Label htmlFor="foundedYear">Année de création</Label>
                                <Input
                                    id="foundedYear"
                                    type="number"
                                    value={formData.foundedYear}
                                    onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="yearsOfExpertise">Années d'expertise</Label>
                                <Input
                                    id="yearsOfExpertise"
                                    type="number"
                                    value={formData.yearsOfExpertise}
                                    onChange={(e) => setFormData({ ...formData, yearsOfExpertise: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="taxId">N° Fiscal</Label>
                                <Input
                                    id="taxId"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="M012400000000A"
                                />
                            </div>
                            <div>
                                <Label htmlFor="registrationNumber">N° RCCM</Label>
                                <Input
                                    id="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    placeholder="RC/DLA/2024/B/0000"
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <ImageUpload
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                label="Image du magasin"
                                placeholder="Choisir une image ou saisir une URL"
                            />
                        </div>

                        {/* Services */}
                        <div>
                            <Label>Services disponibles</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                    placeholder="Ajouter un service"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                                />
                                <Button type="button" variant="outline" onClick={addService}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.services.map(service => (
                                    <Badge key={service} variant="secondary" className="gap-1">
                                        {service}
                                        <button 
                                            onClick={() => removeService(service)} 
                                            className="ml-1 hover:text-destructive"
                                            aria-label={t('action.delete')}
                                            title={t('action.delete')}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <Label>Caractéristiques</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Ajouter une caractéristique"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button type="button" variant="outline" onClick={addFeature}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.features.map(feature => (
                                    <Badge key={feature} variant="outline" className="gap-1">
                                        {feature}
                                        <button 
                                            onClick={() => removeFeature(feature)} 
                                            className="ml-1 hover:text-destructive"
                                            aria-label={t('action.delete')}
                                            title={t('action.delete')}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Siège social</Label>
                                <p className="text-sm text-muted-foreground">Cette boutique est le siège principal</p>
                            </div>
                            <Switch
                                checked={formData.isHeadquarters}
                                onCheckedChange={(checked) => setFormData({ ...formData, isHeadquarters: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveStore} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            {editingStore ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* User Group Dialog */}
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingGroup ? 'Modifier le Groupe' : 'Nouveau Groupe d\'Utilisateurs'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="groupName">Nom du groupe *</Label>
                            <Input
                                id="groupName"
                                value={groupFormData.name}
                                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                placeholder="Équipe Douala"
                            />
                        </div>

                        <div>
                            <Label htmlFor="groupDescription">Description</Label>
                            <Textarea
                                id="groupDescription"
                                value={groupFormData.description}
                                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                                placeholder="Description du groupe..."
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label>Accès à toutes les boutiques</Label>
                                <p className="text-sm text-muted-foreground">Groupe avec accès entreprise complet</p>
                            </div>
                            <Switch
                                checked={groupFormData.isCompanyWide}
                                onCheckedChange={(checked) => setGroupFormData({ ...groupFormData, isCompanyWide: checked, storeIds: [] })}
                            />
                        </div>

                        {!groupFormData.isCompanyWide && (
                            <div>
                                <Label>Boutiques assignées</Label>
                                <div className="mt-2 space-y-2">
                                    {stores.map(store => (
                                        <div key={store.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`store-${store.id}`}
                                                checked={groupFormData.storeIds.includes(store.id)}
                                                onChange={() => toggleStoreInGroup(store.id)}
                                                className="rounded"
                                            />
                                            <label htmlFor={`store-${store.id}`} className="text-sm">
                                                {store.shortName} ({store.city})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Permissions</Label>
                            <div className="mt-2 space-y-2">
                                {permissionOptions.map(perm => (
                                    <div key={perm.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`perm-${perm.id}`}
                                            checked={groupFormData.permissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                            className="rounded"
                                        />
                                        <label htmlFor={`perm-${perm.id}`} className="text-sm">{perm.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveGroup} className="bg-purple-600 hover:bg-purple-700">
                            <Save className="mr-2 h-4 w-4" />
                            {editingGroup ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
