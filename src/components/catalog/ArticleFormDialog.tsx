import { useState, useEffect } from 'react';
import type { Article } from '@/types/compatibility';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { useStoreAccess } from '@/contexts/StoreAccessContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2 } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface ArticleFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (article: Omit<Article, 'id'>) => void;
    initialData?: Article;
    categories: string[];
}

export function ArticleFormDialog({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    categories
}: ArticleFormDialogProps) {
    const { t } = useLanguage();
    const { accessibleStores, activeStoreId, isGlobalAccess } = useStoreAccess();
    
    const [formData, setFormData] = useState<Partial<Article>>({
        name: '',
        category: '',
        description: '',
        price: 0,
        purchasePrice: 0,
        stock: 0,
        minStock: 5,
        image: '',
        unit: 'pièce',
        status: 'active',
        storeId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Set default store based on current active store or first accessible store
            const defaultStoreId = activeStoreId || accessibleStores[0]?.id || '';
            setFormData({
                name: '',
                category: categories[0] || 'Général',
                description: '',
                price: 0,
                purchasePrice: 0,
                stock: 0,
                minStock: 5,
                image: '',
                unit: 'pièce',
                status: 'active',
                storeId: defaultStoreId
            });
        }
    }, [initialData, categories, isOpen, activeStoreId, accessibleStores]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Omit<Article, 'id'>);
        onClose();
    };

    // Get store name for display
    const getStoreName = (storeId: string) => {
        const store = accessibleStores.find(s => s.id === storeId);
        return store?.shortName || store?.name || storeId;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Store Selection - Show when user has access to multiple stores */}
                        {(isGlobalAccess || accessibleStores.length > 1) && (
                            <div className="col-span-2">
                                <Label htmlFor="store" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {t('store.selectStore')}
                                </Label>
                                <Select
                                    value={formData.storeId || ''}
                                    onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder={t('store.selectStore')}>
                                            {formData.storeId && (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {getStoreName(formData.storeId)}
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accessibleStores.map((store) => (
                                            <SelectItem key={store.id} value={store.id}>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    <span>{store.shortName || store.name}</span>
                                                    {store.isHeadquarters && (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">
                                                            HQ
                                                        </Badge>
                                                    )}
                                                    <span className="text-muted-foreground text-xs">
                                                        ({store.city})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('stock.title')}: {t('stock.fromStore')}
                                </p>
                            </div>
                        )}
                        
                        {/* Show selected store for single-store users */}
                        {!isGlobalAccess && accessibleStores.length === 1 && (
                            <div className="col-span-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{accessibleStores[0]?.shortName || accessibleStores[0]?.name}</span>
                                    <span className="text-muted-foreground">({accessibleStores[0]?.city})</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="col-span-2">
                            <Label htmlFor="name">Nom de l'article</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    <SelectItem value="new">+ Nouvelle Catégorie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1">
                            <Label htmlFor="unit">Unité</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="ex: pièce, mètre, kg"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="purchasePrice">Prix d'Achat (FCFA)</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Prix de Vente (FCFA)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="stock">Stock Initial</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="minStock">Seuil d'Alerte</Label>
                            <Input
                                id="minStock"
                                type="number"
                                min="0"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <ImageUpload
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                label="Image de l'article"
                                placeholder="Choisir une image ou saisir une URL"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {initialData ? 'Mettre à jour' : 'Créer l\'article'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
