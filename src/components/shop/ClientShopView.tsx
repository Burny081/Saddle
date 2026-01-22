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
    ArrowLeft
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

        return all;
    }, [articles, services, itemSearch, showFavoritesOnly, favorites, activeCategory]);


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
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                            aria-label="Retour au tableau de bord"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">Boutique en ligne</h1>
                        <p className="mt-1 text-muted-foreground">Commandez nos produits et services directement</p>
                    </div>
                </div>
                <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={showFavoritesOnly ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                >
                    <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    {showFavoritesOnly ? "Voir Tout" : "Mes Favoris"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left Col: Item Selection */}
                <div className="lg:col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Catalogue</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={itemSearch}
                                    onChange={(e) => setItemSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
                            {filteredItems.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredItems.map(item => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={`${item.type}-${item.id}`}
                                            className="group relative flex flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />

                                                {/* Quick Action Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-white text-black hover:bg-white/90"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Ajouter
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-8 w-8"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                >
                                                    <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                                                </Button>
                                            </div>

                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-base line-clamp-1" title={item.name}>{item.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize mb-2">{item.type === 'service' ? 'Service' : 'Article'}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs"
                                                        onClick={() => setSelectedItem(item)}
                                                    >
                                                        Détails
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Search className="h-12 w-12 mb-2" />
                                    <p>Aucun article trouvé</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Cart */}
                <div className="space-y-6 flex flex-col h-full">
                    <Card className="flex-1 border-none shadow-lg flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        {/* ... Cart Content ... */}
                        {/* Re-using existing cart content structure but ensuring it fits the new style */}
                        <CardHeader className="bg-white dark:bg-slate-900 rounded-t-xl border-b">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" /> Votre Panier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0">
                            {orderPlaced ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                                    <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-700 dark:text-green-500">Commande Reçue !</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Nous la traiterons dans les plus brefs délais.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                                        <AnimatePresence>
                                            {cart.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                                                    <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
                                                    <p>Le panier est vide</p>
                                                </div>
                                            ) : (
                                                cart.map((item, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex-1 min-w-0 mr-2">
                                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                                            <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(index, -1)}
                                                            >-</Button>
                                                            <span className="text-sm w-4 text-center font-medium">{item.quantity}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(index, 1)}
                                                            >+</Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-500 hover:text-red-600 ml-1"
                                                                onClick={() => removeFromCart(index)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="p-4 bg-white dark:bg-slate-900 border-t rounded-b-xl space-y-4 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Sous-total</span>
                                            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                                            <span>Total</span>
                                            <span>{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg shadow-blue-600/20"
                                            disabled={cart.length === 0}
                                            onClick={handleCheckout}
                                        >
                                            <Receipt className="mr-2 h-5 w-5" />
                                            Commander
                                        </Button>
                                    </div>
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
