import { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    Tag,
    Palette,
    FolderTree,
    ChevronDown,
    ChevronRight,
    Package,
    Briefcase,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { generateId } from '@/config/constants';
import * as CatalogAPI from '@/utils/apiCatalog';

// Color display component for dynamic background colors
const ColorDot = ({ color, className = '', size = 'sm' }: { color: string; className?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'h-2 w-2',
        md: 'h-3 w-3',
        lg: 'h-8 w-8'
    };
    const dynamicStyle: CSSProperties = { backgroundColor: color || '#6B7280' };
    return (
        <span 
            className={`rounded-full flex-shrink-0 ${sizeClasses[size]} ${className}`}
            style={dynamicStyle}
            aria-hidden="true"
        />
    );
};

// Color button for color picker
const ColorButton = ({ 
    color, 
    isSelected, 
    onClick, 
    title 
}: { 
    color: string; 
    isSelected: boolean; 
    onClick: () => void; 
    title: string;
}) => {
    const dynamicStyle: CSSProperties = { backgroundColor: color };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
                isSelected
                    ? 'border-slate-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
            }`}
            data-color={color}
            style={dynamicStyle}
            title={title}
            aria-label={title}
        />
    );
};

// Category interface
export interface Category {
    id: string;
    name: string;
    nameEn?: string;
    type: 'article' | 'service';
    color: string;
    icon?: string;
    parentId?: string; // For subcategories
    order: number;
    isActive: boolean;
    createdAt: string;
}

const STORAGE_KEY = 'sps_categories';

// Default categories
const defaultCategories: Category[] = [
    // Article categories
    { id: 'cat-elec', name: 'Protection Électrique', nameEn: 'Electrical Protection', type: 'article', color: '#3B82F6', order: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-dist', name: 'Distribution Électrique', nameEn: 'Electrical Distribution', type: 'article', color: '#8B5CF6', order: 2, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-solar', name: 'Énergies Renouvelables', nameEn: 'Renewable Energy', type: 'article', color: '#F59E0B', order: 3, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-cable', name: 'Câblage et Connectique', nameEn: 'Cables and Wiring', type: 'article', color: '#EF4444', order: 4, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-auto', name: 'Automatismes Industriels', nameEn: 'Industrial Automation', type: 'article', color: '#10B981', order: 5, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-motor', name: 'Entraînement Moteurs', nameEn: 'Motor Drives', type: 'article', color: '#06B6D4', order: 6, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-measure', name: 'Mesure et Comptage', nameEn: 'Measurement and Metering', type: 'article', color: '#EC4899', order: 7, isActive: true, createdAt: new Date().toISOString() },
    // Service categories
    { id: 'cat-install', name: 'Installation', nameEn: 'Installation', type: 'service', color: '#3B82F6', order: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-conseil', name: 'Conseil', nameEn: 'Consulting', type: 'service', color: '#8B5CF6', order: 2, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-maint', name: 'Maintenance', nameEn: 'Maintenance', type: 'service', color: '#10B981', order: 3, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-depan', name: 'Dépannage', nameEn: 'Repair', type: 'service', color: '#EF4444', order: 4, isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-renew', name: 'Énergies Renouvelables', nameEn: 'Renewable Energy', type: 'service', color: '#F59E0B', order: 5, isActive: true, createdAt: new Date().toISOString() },
];

// Color options
const colorOptions = [
    { value: '#3B82F6', key: 'color.blue' },
    { value: '#8B5CF6', key: 'color.purple' },
    { value: '#EC4899', key: 'color.pink' },
    { value: '#EF4444', key: 'color.red' },
    { value: '#F59E0B', key: 'color.orange' },
    { value: '#10B981', key: 'color.green' },
    { value: '#06B6D4', key: 'color.cyan' },
    { value: '#6B7280', key: 'color.gray' },
    { value: '#1F2937', key: 'color.black' },
];

interface CategoryManagerProps {
    type?: 'article' | 'service' | 'all';
    onCategorySelect?: (categoryId: string | null) => void;
    selectedCategoryId?: string | null;
    compact?: boolean;
}

export function CategoryManager({
    type = 'all',
    onCategorySelect,
    selectedCategoryId,
    compact = false
}: CategoryManagerProps) {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [activeTab, setActiveTab] = useState<'article' | 'service'>('article');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        type: 'article' as 'article' | 'service',
        color: '#3B82F6',
        parentId: '',
        isActive: true,
    });

    // Load categories from Supabase (with localStorage fallback)
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const apiCategories = await CatalogAPI.getCategories();
                if (apiCategories.length > 0) {
                    // Map API data to local interface
                    const mappedCategories: Category[] = apiCategories.map(c => ({
                        id: c.id,
                        name: c.name_fr,
                        nameEn: c.name_en,
                        type: 'article' as const, // Default type, could be enhanced
                        color: '#3B82F6', // Default color
                        icon: c.icon,
                        order: c.display_order,
                        isActive: c.is_active,
                        createdAt: c.created_at || new Date().toISOString(),
                    }));
                    setCategories(mappedCategories);
                } else {
                    // Fallback to localStorage/default
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        setCategories(JSON.parse(saved));
                    } else {
                        setCategories(defaultCategories);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
                    }
                }
            } catch (err) {
                console.warn('Failed to load categories from Supabase:', err);
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setCategories(JSON.parse(saved));
                } else {
                    setCategories(defaultCategories);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
                }
            }
        };
        loadCategories();
    }, []);

    // Save categories to localStorage (and attempt Supabase sync)
    const saveCategories = async (newCategories: Category[]) => {
        setCategories(newCategories);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
    };

    // Filter categories by type
    const filteredCategories = categories
        .filter(c => type === 'all' || c.type === type)
        .sort((a, b) => a.order - b.order);

    const articleCategories = categories.filter(c => c.type === 'article').sort((a, b) => a.order - b.order);
    const serviceCategories = categories.filter(c => c.type === 'service').sort((a, b) => a.order - b.order);

    // Handle create/edit category
    const handleSaveCategory = () => {
        if (!formData.name.trim()) {
            alert(t('placeholder.enterCategoryName'));
            return;
        }

        const now = new Date().toISOString();

        if (editingCategory) {
            // Update existing
            const updated = categories.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, ...formData, parentId: formData.parentId || undefined }
                    : cat
            );
            saveCategories(updated);
        } else {
            // Create new
            const maxOrder = Math.max(0, ...categories.filter(c => c.type === formData.type).map(c => c.order));
            const newCategory: Category = {
                id: `cat-${generateId()}`,
                name: formData.name,
                nameEn: formData.nameEn || undefined,
                type: formData.type,
                color: formData.color,
                parentId: formData.parentId || undefined,
                order: maxOrder + 1,
                isActive: formData.isActive,
                createdAt: now,
            };
            saveCategories([...categories, newCategory]);
        }

        setIsDialogOpen(false);
        setEditingCategory(null);
        resetForm();
    };

    // Handle delete category
    const handleDeleteCategory = (categoryId: string) => {
        // Also delete subcategories
        const toDelete = [categoryId, ...categories.filter(c => c.parentId === categoryId).map(c => c.id)];
        const updated = categories.filter(cat => !toDelete.includes(cat.id));
        saveCategories(updated);
    };

    // Handle edit category
    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            nameEn: category.nameEn || '',
            type: category.type,
            color: category.color,
            parentId: category.parentId || '',
            isActive: category.isActive,
        });
        setIsDialogOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            nameEn: '',
            type: activeTab,
            color: '#3B82F6',
            parentId: '',
            isActive: true,
        });
    };

    // Toggle expand subcategories
    const toggleExpand = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Get subcategories
    const getSubcategories = (parentId: string) => {
        return categories.filter(c => c.parentId === parentId);
    };

    // Render category item
    const renderCategoryItem = (category: Category, isSubcategory = false) => {
        const subcategories = getSubcategories(category.id);
        const hasSubcategories = subcategories.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = selectedCategoryId === category.id;

        return (
            <div key={category.id}>
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        isSubcategory ? 'ml-6' : ''
                    } ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'} ${
                        !category.isActive ? 'opacity-50' : ''
                    }`}
                >
                    {hasSubcategories && (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    {!hasSubcategories && <div className="w-6" />}

                    <ColorDot color={category.color || '#6B7280'} size="md" />

                    <span
                        className={`flex-1 cursor-pointer ${isSelected ? 'font-semibold' : ''}`}
                        onClick={() => onCategorySelect?.(isSelected ? null : category.id)}
                    >
                        {language === 'en' && category.nameEn ? category.nameEn : category.name}
                    </span>

                    {!compact && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditCategory(category)}
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('confirm.deleteCategory')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('categories.deleteSubcategoriesWarning')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            {t('action.delete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>

                {/* Subcategories */}
                <AnimatePresence>
                    {hasSubcategories && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            {subcategories.map(sub => renderCategoryItem(sub, true))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Compact mode - just show filter dropdown
    if (compact) {
        return (
            <Select
                value={selectedCategoryId || 'all'}
                onValueChange={(value) => onCategorySelect?.(value === 'all' ? null : value)}
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t('label.category')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <span className="flex items-center gap-2">
                            {t('categories.allCategories')}
                        </span>
                    </SelectItem>
                    {filteredCategories.filter(c => !c.parentId && c.isActive).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                            <span className="flex items-center gap-2">
                                <ColorDot color={category.color || '#6B7280'} size="sm" />
                                {language === 'en' && category.nameEn ? category.nameEn : category.name}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-blue-500" />
                            {t('categories.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('categories.description')}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ ...formData, type: activeTab });
                            setIsDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('action.add')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'article' | 'service')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="article" className="gap-2">
                            <Package className="h-4 w-4" />
                            {t('categories.articles')} ({articleCategories.length})
                        </TabsTrigger>
                        <TabsTrigger value="service" className="gap-2">
                            <Briefcase className="h-4 w-4" />
                            {t('categories.services')} ({serviceCategories.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="article" className="space-y-1">
                        {articleCategories.filter(c => !c.parentId).length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                {t('categories.noArticleCategories')}
                            </p>
                        ) : (
                            <div className="space-y-1 group">
                                {articleCategories.filter(c => !c.parentId).map(cat => renderCategoryItem(cat))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="service" className="space-y-1">
                        {serviceCategories.filter(c => !c.parentId).length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                {t('categories.noServiceCategories')}
                            </p>
                        ) : (
                            <div className="space-y-1 group">
                                {serviceCategories.filter(c => !c.parentId).map(cat => renderCategoryItem(cat))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Category Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? t('categories.editCategory') : t('categories.newCategory')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cat-name">{t('categories.categoryName')} *</Label>
                            <Input
                                id="cat-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('categories.categoryNamePlaceholder')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="cat-name-en">{t('categories.categoryNameEn')}</Label>
                            <Input
                                id="cat-name-en"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                placeholder={t('categories.categoryNameEnPlaceholder')}
                            />
                        </div>

                        <div>
                            <Label>{t('label.type')}</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as 'article' | 'service', parentId: '' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="article">
                                        <span className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Article
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="service">
                                        <span className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Service
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>{t('categories.parentCategory')}</Label>
                            <Select
                                value={formData.parentId || 'none'}
                                onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('categories.noParent')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t('categories.noParent')}</SelectItem>
                                    {categories
                                        .filter(c => c.type === formData.type && !c.parentId && c.id !== editingCategory?.id)
                                        .map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {language === 'en' && cat.nameEn ? cat.nameEn : cat.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                {t('label.color')}
                            </Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {colorOptions.map(color => (
                                    <ColorButton
                                        key={color.value}
                                        color={color.value}
                                        isSelected={formData.color === color.value}
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        title={t(color.key)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            {editingCategory ? t('action.update') : t('action.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

// Export helper function to get categories
export function useCategories(type?: 'article' | 'service') {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved) as Category[];
            setCategories(type ? parsed.filter(c => c.type === type && c.isActive) : parsed.filter(c => c.isActive));
        } else {
            const filtered = type ? defaultCategories.filter(c => c.type === type) : defaultCategories;
            setCategories(filtered);
        }
    }, [type]);

    return categories;
}

// Export function to get category by id
export function getCategoryById(categoryId: string): Category | undefined {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const categories = JSON.parse(saved) as Category[];
        return categories.find(c => c.id === categoryId);
    }
    return defaultCategories.find(c => c.id === categoryId);
}

// Export function to get all categories for a type
export function getCategoriesForType(type: 'article' | 'service'): Category[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const categories = JSON.parse(saved) as Category[];
        return categories.filter(c => c.type === type && c.isActive).sort((a, b) => a.order - b.order);
    }
    return defaultCategories.filter(c => c.type === type).sort((a, b) => a.order - b.order);
}
