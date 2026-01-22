import { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Building2,
    Mail,
    Phone,
    MapPin,
    ArrowLeft,
    Package,
    Globe,
    FileText
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
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
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/config/constants';

// Supplier type definition
export interface Supplier {
    id: string;
    code: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    website?: string;
    category: 'electrical' | 'automation' | 'solar' | 'cables' | 'general';
    status: 'active' | 'inactive' | 'pending';
    paymentTerms: string;
    notes?: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
}

// Mock suppliers data
const mockSuppliers: Supplier[] = [
    {
        id: '1',
        code: 'FOUR-001',
        name: 'ElectroPro Distribution',
        contactName: 'Jean Dupont',
        email: 'contact@electropro.cm',
        phone: '+237 677 123 456',
        address: '123 Rue de l\'Industrie',
        city: 'Douala',
        country: 'Cameroun',
        website: 'www.electropro.cm',
        category: 'electrical',
        status: 'active',
        paymentTerms: '30 jours',
        notes: 'Fournisseur principal pour équipements MT/BT',
        totalOrders: 45,
        totalSpent: 125000000,
        createdAt: '2023-01-15'
    },
    {
        id: '2',
        code: 'FOUR-002',
        name: 'SolarTech Cameroun',
        contactName: 'Marie Ngono',
        email: 'info@solartech.cm',
        phone: '+237 699 456 789',
        address: '45 Avenue Ahmadou Ahidjo',
        city: 'Yaoundé',
        country: 'Cameroun',
        category: 'solar',
        status: 'active',
        paymentTerms: '15 jours',
        totalOrders: 28,
        totalSpent: 85000000,
        createdAt: '2023-03-20'
    },
    {
        id: '3',
        code: 'FOUR-003',
        name: 'AutomaTion Systems',
        contactName: 'Pierre Kamga',
        email: 'sales@automation-sys.com',
        phone: '+237 655 789 012',
        address: '78 Zone Industrielle',
        city: 'Douala',
        country: 'Cameroun',
        website: 'www.automation-sys.com',
        category: 'automation',
        status: 'active',
        paymentTerms: '45 jours',
        notes: 'Spécialiste PLC et SCADA',
        totalOrders: 15,
        totalSpent: 65000000,
        createdAt: '2023-06-10'
    }
];

interface SuppliersViewProps {
    onBack?: () => void;
}

export function SuppliersView({ onBack }: SuppliersViewProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { user } = useAuth();
    const { t } = useLanguage();

    // Permission check
    const canManageSuppliers = user && ['superadmin', 'admin', 'manager'].includes(user.role);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Cameroun',
        website: '',
        category: 'electrical' as Supplier['category'],
        status: 'active' as Supplier['status'],
        paymentTerms: '30 jours',
        notes: ''
    });

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) => {
            const matchesSearch =
                supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.code.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [suppliers, searchQuery, categoryFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: suppliers.length,
        active: suppliers.filter(s => s.status === 'active').length,
        totalSpent: suppliers.reduce((sum, s) => sum + s.totalSpent, 0)
    }), [suppliers]);

    const handleOpenCreate = useCallback(() => {
        setEditingSupplier(null);
        setFormData({
            name: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: 'Cameroun',
            website: '',
            category: 'electrical',
            status: 'active',
            paymentTerms: '30 jours',
            notes: ''
        });
        setIsDialogOpen(true);
    }, []);

    const handleOpenEdit = useCallback((supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactName: supplier.contactName,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            country: supplier.country,
            website: supplier.website || '',
            category: supplier.category,
            status: supplier.status,
            paymentTerms: supplier.paymentTerms,
            notes: supplier.notes || ''
        });
        setIsDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        setEditingSupplier(null);
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (editingSupplier) {
            // Update existing supplier
            setSuppliers(prev => prev.map(s =>
                s.id === editingSupplier.id
                    ? { ...s, ...formData }
                    : s
            ));
        } else {
            // Create new supplier
            const newSupplier: Supplier = {
                id: crypto.randomUUID(),
                code: `FOUR-${String(suppliers.length + 1).padStart(3, '0')}`,
                ...formData,
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setSuppliers(prev => [...prev, newSupplier]);
        }

        handleCloseDialog();
    }, [editingSupplier, formData, suppliers.length, handleCloseDialog]);

    const handleDelete = useCallback((id: string) => {
        if (window.confirm(t('confirm.deleteSupplier'))) {
            setSuppliers(prev => prev.filter(s => s.id !== id));
        }
    }, [t]);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            electrical: t('supplier.category.electrical'),
            automation: t('supplier.category.automation'),
            solar: t('supplier.category.solar'),
            cables: t('supplier.category.cables'),
            general: t('supplier.category.general')
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            electrical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            automation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            solar: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            cables: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            general: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        };
        return colors[category] || colors.general;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: t('active'),
            inactive: t('inactive'),
            pending: t('sales.pending')
        };
        return labels[status] || status;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                        <h1 className="text-2xl sm:text-3xl font-bold">{t('suppliers.title')}</h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            {t('suppliers.subtitle')}
                        </p>
                    </div>
                </div>
                {canManageSuppliers && (
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('suppliers.newSupplier')}
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('suppliers.totalSuppliers')}</p>
                                <p className="mt-1 text-2xl sm:text-3xl font-bold">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white">
                                <Building2 className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('suppliers.activeSuppliers')}</p>
                                <p className="mt-1 text-2xl sm:text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white">
                                <Package className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('supplier.totalPurchases')}</p>
                                <p className="mt-1 text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder={t('placeholder.searchSupplier')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder={t('label.category')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="electrical">{t('supplier.category.electrical')}</SelectItem>
                                <SelectItem value="automation">{t('supplier.category.automation')}</SelectItem>
                                <SelectItem value="solar">{t('supplier.category.solar')}</SelectItem>
                                <SelectItem value="cables">{t('supplier.category.cables')}</SelectItem>
                                <SelectItem value="general">{t('supplier.category.general')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder={t('label.status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                                <SelectItem value="pending">{t('sales.pending')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Suppliers Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSuppliers.map((supplier, index) => (
                    <motion.div
                        key={supplier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="group border-none shadow-lg transition-all hover:shadow-xl h-full">
                            <CardContent className="p-4 sm:p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                            <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm sm:text-base truncate">{supplier.name}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500">{supplier.code}</p>
                                        </div>
                                    </div>
                                    {canManageSuppliers && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(supplier)}
                                                className="h-8 w-8"
                                            >
                                                <Edit className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(supplier.id)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="truncate">{supplier.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span>{supplier.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="truncate">{supplier.city}, {supplier.country}</span>
                                    </div>
                                    {supplier.website && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span className="truncate">{supplier.website}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge className={getCategoryColor(supplier.category)}>
                                        {getCategoryLabel(supplier.category)}
                                    </Badge>
                                    <Badge className={getStatusColor(supplier.status)}>
                                        {getStatusLabel(supplier.status)}
                                    </Badge>
                                </div>

                                <div className="mt-4 border-t pt-4 dark:border-slate-800">
                                    <div className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-slate-500">{t('supplier.totalPurchases')}</span>
                                        <span className="font-bold">{formatCurrency(supplier.totalSpent)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                                        <span className="text-slate-500">{t('supplier.orders')}</span>
                                        <span className="font-medium">{supplier.totalOrders}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">{t('supplier.noSuppliersFound')}</p>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSupplier ? t('suppliers.editSupplier') : t('suppliers.newSupplier')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSupplier
                                ? t('supplier.editDescription')
                                : t('supplier.addDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('supplier.companyName')} *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactName">{t('supplier.contactName')} *</Label>
                                <Input
                                    id="contactName"
                                    required
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('label.email')} *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('label.phone')} *</Label>
                                <Input
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('label.address')}</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="city">{t('label.city')} *</Label>
                                <Input
                                    id="city"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">{t('label.country')}</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">{t('supplier.website')}</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="www.example.com"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>{t('label.category')} *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val as Supplier['category'] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="electrical">{t('supplier.category.electrical')}</SelectItem>
                                        <SelectItem value="automation">{t('supplier.category.automation')}</SelectItem>
                                        <SelectItem value="solar">{t('supplier.category.solar')}</SelectItem>
                                        <SelectItem value="cables">{t('supplier.category.cables')}</SelectItem>
                                        <SelectItem value="general">{t('supplier.category.general')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('label.status')}</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val as Supplier['status'] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">{t('active')}</SelectItem>
                                        <SelectItem value="inactive">{t('inactive')}</SelectItem>
                                        <SelectItem value="pending">{t('sales.pending')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">{t('supplier.paymentTerms')}</Label>
                                <Input
                                    id="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    placeholder="30 jours"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">{t('label.notes')}</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                placeholder={t('supplier.additionalInfo')}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                {t('action.cancel')}
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                {editingSupplier ? t('suppliers.updateSupplier') : t('suppliers.createSupplier')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
