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
    TrendingUp,
    Star,
    Sparkles
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Article, Service } from '@/types/compatibility';
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { LoginModal } from '@/components/LoginModal';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/config/constants';

interface CartItem {
    id: string;
    type: 'article' | 'service';
    name: string;
    price: number;
    quantity: number;
    image?: string;
}


interface ClientShopViewProps {
    initialCategory?: string;
    initialSubCategory?: string;
    onBack?: () => void;
}

export function ClientShopView({ initialCategory, initialSubCategory, onBack }: ClientShopViewProps) {
    const { user } = useAuth();
    const { articles, services, addSale } = useData();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [itemSearch, setItemSearch] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'popular'>('popular');

    // Favorites State
    const [favorites, setFavorites] = useState<string[]>([]);
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
        const saved = localStorage.getItem(`favorites_${user?.id}`);
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    }, [user?.id]);

    const toggleFavorite = (id: string) => {
        let newFavs;
        if (favorites.includes(id)) {
            newFavs = favorites.filter(favId => favId !== id);
        } else {
            newFavs = [...favorites, id];
        }
        setFavorites(newFavs);
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavs));
    };

    // Filter items based on search, favorites, and category
    const filteredItems = useMemo(() => {
        const searchLower = itemSearch.toLowerCase();
        const arts = articles.map(a => ({ ...a, type: 'article' as const }));
        const servs = services.map(s => ({ ...s, type: 'service' as const }));
        let all = [...arts, ...servs];

        if (showFavoritesOnly) {
            all = all.filter(item => favorites.includes(item.id));
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

    const handleCheckout = () => {
        if (cart.length === 0) return;

        if (!user) {
            setShowLogin(true);
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
        <div className="space-y-6 h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 rounded-2xl">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white opacity-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onBack}
                                    className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                                    aria-label="Retour au tableau de bord"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            )}
                            <div>
                                <p className="text-blue-100 text-sm font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Découvrez nos produits
                                </p>
                                <h1 className="text-4xl font-bold mt-1 mb-1">Boutique Premium</h1>
                                <p className="text-blue-100 text-lg">
                                    {filteredItems.length} produits disponibles
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant={showFavoritesOnly ? "secondary" : "ghost"}
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`rounded-xl ${showFavoritesOnly ? "bg-white text-red-600 hover:bg-white/90" : "bg-white/20 hover:bg-white/30 text-white border-0"}`}
                            >
                                <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                                {showFavoritesOnly ? `Favoris (${favorites.length})` : "Mes Favoris"}
                            </Button>
                            <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                <ShoppingCart className="h-6 w-6 text-white" />
                                {cart.length > 0 && (
                                    <span className="absolute -mt-8 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                
                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-3 border-2 rounded-xl bg-white shadow-sm font-medium min-w-[160px]"
                        aria-label="Trier par"
                    >
                        <option value="popular">🔥 Plus populaires</option>
                        <option value="name">🔤 Nom (A-Z)</option>
                        <option value="price-asc">💰 Prix croissant</option>
                        <option value="price-desc">💎 Prix décroissant</option>
                    </select>

                    <div className="flex gap-1 bg-white border-2 rounded-xl p-1 shadow-sm">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left Col: Item Selection */}
                <div className="lg:col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl rounded-2xl">
                        <CardContent className="flex-1 overflow-y-auto p-6">
                            {filteredItems.length > 0 ? (
                                <div className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
                                    : "space-y-4"
                                }>
                                    {filteredItems.map(item => (
                                        viewMode === 'grid' ? (
                                            // Grid View
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={`${item.type}-${item.id}`}
                                                className="group relative flex flex-col rounded-2xl border-2 bg-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                                            >
                                                {/* New Badge */}
                                                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-white" />
                                                    Nouveau
                                                </div>

                                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
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
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`} />
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
                                                                {item.type === 'service' ? '🎯 Service' : '📦 Produit'}
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
                                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
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
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`} />
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
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Cart */}
                <div className="space-y-6 flex flex-col h-full">
                    <Card className="flex-1 border-0 shadow-2xl flex flex-col bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl border-0 shadow-lg">
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xl">
                                    <ShoppingCart className="h-6 w-6" /> Mon Panier
                                </span>
                                {cart.length > 0 && (
                                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
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
                                        Commande Confirmée ! 🎉
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
                                                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full p-8 mb-4">
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
                </div>
            </div>

            {/* Details Dialog */}
            {selectedItem && (
                <ProductDetailsDialog
                    open={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    item={selectedItem}
                    onAddToCart={addToCart}
                    isFavorite={favorites.includes(selectedItem.id)}
                    onToggleFavorite={() => toggleFavorite(selectedItem.id)}
                />
            )}

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
}
