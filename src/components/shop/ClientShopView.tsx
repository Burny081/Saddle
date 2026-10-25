import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Plus,
    Trash2,
    ShoppingCart,
    Receipt,
    CheckCircle2,
    Heart,
    Eye,
    ArrowLeft,
    Grid,
    List,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Star,
    PackageSearch
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/app/components/ui/drawer';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Article, Service } from '@/types/compatibility';
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { LoginModal } from '@/components/LoginModal';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/config/constants';
import { hasFavorite, readFavorites, writeFavorites, type FavoriteReference } from '@/utils/favorites';

interface CartItem {
    id: string;
    type: 'article' | 'service';
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export const SHOP_PAGE_SIZE = 24;


interface ClientShopViewProps {
    initialCategory?: string;
    initialSubCategory?: string;
    onBack?: () => void;
    showBackButton?: boolean;
    onLoginRequired?: () => void;
}

interface CartPanelProps {
    cart: CartItem[];
    orderPlaced: boolean;
    totalAmount: number;
    onQuantityChange: (index: number, delta: number) => void;
    onRemove: (index: number) => void;
    onCheckout: () => void;
}

function CartPanel({ cart, orderPlaced, totalAmount, onQuantityChange, onRemove, onCheckout }: CartPanelProps) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-slate-950 px-5 py-4 text-white">
                <div>
                    <p className="flex items-center gap-2 text-lg font-bold">
                        <ShoppingCart className="h-5 w-5" /> Mon panier
                    </p>
                    <p className="mt-1 text-xs text-slate-300">Vos articles restent disponibles ici.</p>
                </div>
                {cart.length > 0 && (
                    <span className="border border-white/25 bg-white/10 px-2.5 py-1 text-sm font-bold">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                )}
            </div>
            {orderPlaced ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Commande confirmée</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Nous traiterons votre demande dans les plus brefs délais.</p>
                </div>
            ) : (
                <>
                    <div className="min-h-[14rem] flex-1 space-y-3 overflow-y-auto p-4">
                        <AnimatePresence initial={false}>
                            {cart.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                                    <div className="mb-4 border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                                        <ShoppingCart className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Panier vide</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Ajoutez des produits pour commencer.</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <motion.div
                                        key={`${item.type}-${item.id}`}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        className="flex gap-3 border border-border bg-card p-3 shadow-sm"
                                    >
                                        {item.image && <img src={item.image} alt="" className="h-16 w-16 shrink-0 object-cover" />}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(index, -1)} aria-label={`Retirer une unité de ${item.name}`}>−</Button>
                                                <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(index, 1)} aria-label={`Ajouter une unité de ${item.name}`}>+</Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#b7212d] hover:bg-red-50 hover:text-[#941b25]" onClick={() => onRemove(index)} aria-label={`Supprimer ${item.name}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-bold text-[#124a93]">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                    {cart.length > 0 && (
                        <div className="space-y-4 border-t border-border bg-muted/35 p-5">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Total estimé</p>
                                    <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-700">Livraison à confirmer</span>
                            </div>
                            <Button className="h-12 w-full bg-[#124a93] font-bold text-white hover:bg-[#0b3978]" onClick={onCheckout}>
                                <Receipt className="mr-2 h-5 w-5" /> Valider la commande
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export function ClientShopView({ initialCategory, initialSubCategory, onBack, showBackButton = true, onLoginRequired }: ClientShopViewProps) {
    const { user } = useAuth();
    const { articles, services, addSale } = useData();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [itemSearch, setItemSearch] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'popular'>('popular');
    const [currentPage, setCurrentPage] = useState(1);

    // Favorites State
    const [favorites, setFavorites] = useState<FavoriteReference[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Dialog State
    const [selectedItem, setSelectedItem] = useState<((Article | Service) & { type: 'article' | 'service' }) | null>(null);

    // Filter Logic State
    const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
    const [_activeSubCategory, setActiveSubCategory] = useState<string | undefined>(initialSubCategory);

    // Update internal state when props change
    useEffect(() => {
        if (initialCategory) setActiveCategory(initialCategory);
        if (initialSubCategory) setActiveSubCategory(initialSubCategory);
    }, [initialCategory, initialSubCategory]);

    // _activeSubCategory is declared for future subcategory filtering implementation
    void _activeSubCategory;

    // Load favorites from local storage on mount
    useEffect(() => {
        setFavorites(readFavorites(user?.id));
    }, [user?.id]);

    const toggleFavorite = (item: (Article | Service) & { type: 'article' | 'service' }) => {
        let nextFavorites: FavoriteReference[];
        if (hasFavorite(favorites, item.type, item.id)) {
            nextFavorites = favorites.filter((favorite) => !(favorite.id === item.id && (!favorite.type || favorite.type === item.type)));
        } else {
            nextFavorites = [...favorites, { id: item.id, type: item.type }];
        }
        setFavorites(nextFavorites);
        writeFavorites(user?.id, nextFavorites);
    };

    // Filter items based on search, favorites, and category
    const filteredItems = useMemo(() => {
        const searchLower = itemSearch.toLowerCase();
        const arts = articles.map(a => ({ ...a, type: 'article' as const }));
        const servs = services.map(s => ({ ...s, type: 'service' as const }));
        let all = [...arts, ...servs];

        if (showFavoritesOnly) {
            all = all.filter(item => hasFavorite(favorites, item.type, item.id));
        }

        if (activeCategory) {
            // Flexible matching for demo purposes since mock data might not perfectly align yet
            all = all.filter(item => {
                const itemCategory = 'category' in item ? (item as { category?: string }).category : undefined;
                return (itemCategory && itemCategory === activeCategory) ||
                    item.name.toLowerCase().includes(activeCategory.toLowerCase());
            });
        }

        if (searchLower) {
            all = all.filter(item => item.name.toLowerCase().includes(searchLower));
        }

        // Sort items
        switch (sortBy) {
            case 'name':
                all.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                all.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                all.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
            default:
                // Keep original order (most popular first in mock data)
                break;
        }

        return all;
    }, [articles, services, itemSearch, showFavoritesOnly, favorites, activeCategory, sortBy]);

    const categories = useMemo(() => Array.from(new Set([
        ...articles.map((article) => article.category),
        ...services.map((service) => service.category),
    ].filter(Boolean))).sort((a, b) => a.localeCompare(b)), [articles, services]);

    const pageCount = Math.max(1, Math.ceil(filteredItems.length / SHOP_PAGE_SIZE));
    const pageItems = useMemo(
        () => filteredItems.slice((currentPage - 1) * SHOP_PAGE_SIZE, currentPage * SHOP_PAGE_SIZE),
        [currentPage, filteredItems],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [itemSearch, showFavoritesOnly, activeCategory, sortBy]);

    useEffect(() => {
        if (currentPage > pageCount) setCurrentPage(pageCount);
    }, [currentPage, pageCount]);


    const addToCart = (item: (Article | Service) & { type: 'article' | 'service' }) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id && i.type === item.type);
            if (existing) {
                return prev.map(i =>
                    (i.id === item.id && i.type === item.type) ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, {
                id: item.id,
                type: item.type,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            }];
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [showLogin, setShowLogin] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        if (!user) {
            if (onLoginRequired) {
                onLoginRequired();
            } else {
                setShowLogin(true);
            }
            return;
        }

        // Simulate order placement
        const newSale = {
            clientName: user.name,
            total: totalAmount,
            paid: false, // Not paid yet
            status: 'pending' as const,
            items: cart.map(i => ({
                id: i.id,
                type: i.type,
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`
        };

        addSale(newSale);
        setOrderPlaced(true);
        setCart([]);

        // Reset success message after 3 seconds
        setTimeout(() => {
            setOrderPlaced(false);
        }, 3000);
    };

    return (
        <div className="flex h-full flex-col space-y-6 pb-24 lg:pb-0">
            <header className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                            {onBack && showBackButton && (
                                <Button
                                    variant="outline"
                                    onClick={onBack}
                                    className="h-11 shrink-0 border-slate-300 bg-white px-3 font-bold text-slate-900 hover:border-[#124a93] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    aria-label="Retour"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour
                                </Button>
                            )}
                            <div>
                                <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#b7212d]">
                                    <PackageSearch className="h-4 w-4" />
                                    Catalogue SaddlePoint
                                </p>
                                <h1 className="mb-1 mt-2 font-[var(--font-display)] text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">Boutique</h1>
                                <p className="text-sm text-muted-foreground sm:text-base">
                                    {filteredItems.length} produits disponibles
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant={showFavoritesOnly ? "secondary" : "ghost"}
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={showFavoritesOnly ? "bg-red-50 text-[#b7212d] hover:bg-red-100" : "border border-border bg-card hover:bg-muted"}
                            >
                                <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                                {showFavoritesOnly ? `Favoris (${favorites.length})` : "Mes Favoris"}
                            </Button>
                            <div className="relative hidden border border-border bg-card p-3 lg:block" aria-label="Résumé du panier">
                                <ShoppingCart className="h-6 w-6 text-[#124a93]" />
                                {cart.length > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#b7212d] text-xs font-bold text-white">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                        </div>
            </header>

            {/* Filters & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Rechercher un produit..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="pl-12 h-12 text-base rounded-xl border-2 shadow-sm"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <select
                        value={activeCategory ?? ''}
                        onChange={(e) => setActiveCategory(e.target.value || undefined)}
                        className="min-w-[170px] border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground shadow-sm"
                        aria-label="Filtrer par catégorie"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="min-w-[170px] border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground shadow-sm"
                        aria-label="Trier par"
                    >
                        <option value="popular">Plus populaires</option>
                        <option value="name">Nom (A–Z)</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                    </select>

                    <div className="flex gap-1 border border-border bg-card p-1 shadow-sm">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className={`h-10 w-10 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}`}
                            aria-label="Vue grille"
                        >
                            <Grid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className={`h-10 w-10 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : ''}`}
                            aria-label="Vue liste"
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                {/* Left Col: Item Selection */}
                <div className="flex h-full flex-col space-y-4 overflow-hidden">
                    <Card className="flex min-h-[34rem] flex-1 flex-col overflow-hidden">
                        <CardContent className="flex-1 overflow-y-auto p-6">
                            {filteredItems.length > 0 ? (
                                <div className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                                    : "space-y-4"
                                }>
                                    {pageItems.map(item => (
                                        viewMode === 'grid' ? (
                                            // Grid View
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={`${item.type}-${item.id}`}
                                                className="group relative flex flex-col overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                                            >
                                                {/* New Badge */}
                                                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 bg-[#124a93] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                                    <Star className="h-3 w-3 fill-white" />
                                                    Nouveau
                                                </div>

                                                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />

                                                    {/* Quick Action Overlay */}
                                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-white text-black hover:bg-white/90 font-semibold shadow-lg"
                                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Ajouter
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${hasFavorite(favorites, item.type, item.id) ? "fill-red-500 text-red-500" : ""}`} />
                                                    </Button>
                                                </div>

                                                <div className="p-4 flex flex-col flex-1">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-base line-clamp-2 mb-1" title={item.name}>{item.name}</p>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                item.type === 'service' 
                                                                    ? 'bg-purple-100 text-purple-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {item.type === 'service' ? 'Service' : 'Produit'}
                                                            </span>
                                                            <div className="flex items-center text-yellow-500">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                <span className="text-xs ml-1 text-gray-600">4.8</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <div>
                                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-[#124a93] text-white hover:bg-[#0b3978]"
                                                            onClick={() => addToCart(item)}
                                                        >
                                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                                            Acheter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            // List View
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={`${item.type}-${item.id}`}
                                                className="group flex gap-4 p-4 bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all hover:-translate-x-1"
                                            >
                                                <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white"
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${hasFavorite(favorites, item.type, item.id) ? "fill-red-500 text-red-500" : ""}`} />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                item.type === 'service' 
                                                                    ? 'bg-purple-100 text-purple-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {item.type === 'service' ? 'Service' : 'Produit'}
                                                            </span>
                                                            <div className="flex items-center text-yellow-500">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                <span className="text-xs ml-1 text-gray-600">4.8 (120 avis)</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            Description du produit ou service...
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setSelectedItem(item)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Détails
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                                onClick={() => addToCart(item)}
                                                            >
                                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                                Acheter
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                                    <div className="bg-slate-100 rounded-full p-8 mb-4">
                                        <Search className="h-16 w-16 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun produit trouvé</h3>
                                    <p className="text-slate-500">Essayez de modifier vos filtres ou votre recherche</p>
                                </div>
                            )}
                            {filteredItems.length > SHOP_PAGE_SIZE && (
                                <nav aria-label="Pagination du catalogue" className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {Math.min((currentPage - 1) * SHOP_PAGE_SIZE + 1, filteredItems.length)}–{Math.min(currentPage * SHOP_PAGE_SIZE, filteredItems.length)} sur {filteredItems.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(page => page - 1)}>
                                            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
                                        </Button>
                                        <span className="px-2 text-sm font-bold text-foreground">Page {currentPage} / {pageCount}</span>
                                        <Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setCurrentPage(page => page + 1)}>
                                            Suivant <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </nav>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Cart */}
                <aside className="hidden h-full flex-col space-y-6 lg:sticky lg:top-6 lg:flex">
                    <Card className="flex max-h-[calc(100vh-8rem)] min-h-[28rem] flex-1 flex-col overflow-hidden">
                        <CardHeader className="border-b border-border bg-slate-950 text-white">
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xl">
                                    <ShoppingCart className="h-6 w-6" /> Mon Panier
                                </span>
                                {cart.length > 0 && (
                                    <span className="bg-white px-2.5 py-1 text-sm font-bold text-[#124a93]">
                                        {cart.length} {cart.length === 1 ? 'article' : 'articles'}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0">
                            {orderPlaced ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
                                    <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                                        <CheckCircle2 className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                        Commande confirmée
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                                        Nous traiterons votre commande dans les plus brefs délais.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span>Un email de confirmation vous a été envoyé</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                                        <AnimatePresence>
                                            {cart.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex flex-col items-center justify-center h-full text-slate-400 py-10"
                                                >
                                                    <div className="mb-4 border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                                                        <ShoppingCart className="h-12 w-12 text-slate-300" />
                                                    </div>
                                                    <h3 className="font-semibold text-slate-700 mb-1">Panier vide</h3>
                                                    <p className="text-sm text-center">Ajoutez des produits pour commencer</p>
                                                </motion.div>
                                            ) : (
                                                cart.map((item, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="relative flex gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
                                                    >
                                                        {item.image && (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm truncate mb-1">{item.name}</p>
                                                            <p className="text-xs text-slate-500 mb-2">
                                                                {formatCurrency(item.price)} × {item.quantity}
                                                            </p>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg"
                                                                    onClick={() => updateQuantity(index, -1)}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="text-sm w-8 text-center font-bold bg-blue-50 rounded px-2 py-1">
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg"
                                                                    onClick={() => updateQuantity(index, 1)}
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end justify-between">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                onClick={() => removeFromCart(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {formatCurrency(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {cart.length > 0 && (
                                        <div className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-t-2 border-slate-200 rounded-b-2xl space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Sous-total</span>
                                                    <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Livraison</span>
                                                    <span className="font-semibold text-green-600">Gratuite</span>
                                                </div>
                                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="font-bold">Total</span>
                                                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                        {formatCurrency(totalAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-14 text-lg font-bold shadow-xl shadow-blue-600/30 rounded-xl relative overflow-hidden group"
                                                disabled={cart.length === 0}
                                                onClick={handleCheckout}
                                            >
                                                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                                <Receipt className="mr-2 h-6 w-6" />
                                                Valider la Commande
                                            </Button>
                                            
                                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span>Paiement 100% sécurisé</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:hidden">
                <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <DrawerTrigger aria-label="Ouvrir le panier" className="mx-auto flex h-14 w-full max-w-md items-center justify-between bg-[#124a93] px-5 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgba(18,74,147,.72)] transition-colors hover:bg-[#0b3978]">
                            <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Voir le panier</span>
                            <span className="border-l border-white/25 pl-4">{cart.length ? `${cart.reduce((total, item) => total + item.quantity, 0)} · ${formatCurrency(totalAmount)}` : 'Vide'}</span>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[86vh] rounded-t-2xl">
                        <DrawerHeader className="sr-only">
                            <DrawerTitle>Votre panier</DrawerTitle>
                            <DrawerDescription>Articles ajoutés à votre commande.</DrawerDescription>
                        </DrawerHeader>
                        <CartPanel
                            cart={cart}
                            orderPlaced={orderPlaced}
                            totalAmount={totalAmount}
                            onQuantityChange={updateQuantity}
                            onRemove={removeFromCart}
                            onCheckout={handleCheckout}
                        />
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Details Dialog */}
            {selectedItem && (
                <ProductDetailsDialog
                    open={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    item={selectedItem}
                    onAddToCart={addToCart}
                    isFavorite={hasFavorite(favorites, selectedItem.type, selectedItem.id)}
                    onToggleFavorite={() => toggleFavorite(selectedItem)}
                />
            )}

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
}
