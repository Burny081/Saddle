import { useState, useMemo } from 'react';
import {
    Search,
    Plus,
    Trash2,
    ShoppingCart,
    User,
    Save,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Article, Service } from '@/types/compatibility';
import { formatCurrency } from '@/config/constants';

interface CartItem {
    id: string;
    type: 'article' | 'service';
    name: string;
    price: number;
    quantity: number;
}

interface CreateSaleViewProps {
    onBack: () => void;
}

export function CreateSaleView({ onBack }: CreateSaleViewProps) {
    const { clients, articles, services, addSale } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [itemSearch, setItemSearch] = useState('');

    // Filter items based on search - show all by default
    const filteredItems = useMemo(() => {
        const searchLower = itemSearch.toLowerCase();
        const arts = articles.filter(a => 
            a.status === 'active' && 
            (itemSearch === '' || a.name.toLowerCase().includes(searchLower))
        );
        const servs = services.filter(s => 
            s.status === 'active' && 
            (itemSearch === '' || s.name.toLowerCase().includes(searchLower))
        );
        return [...arts.map(a => ({ ...a, type: 'article' as const })), ...servs.map(s => ({ ...s, type: 'service' as const }))];
    }, [articles, services, itemSearch]);

    const addToCart = (item: Article | Service, type: 'article' | 'service') => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id && i.type === type);
            if (existing) {
                return prev.map(i =>
                    (i.id === item.id && i.type === type) ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, {
                id: item.id,
                type,
                name: item.name,
                price: item.price,
                quantity: 1
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

    const handleSaveSale = () => {
        if (!selectedClientId || cart.length === 0) return;

        const client = clients.find(c => c.id === selectedClientId);

        const newSale = {
            clientName: client?.name || 'Unknown',
            total: totalAmount,
            paid: true, // Sale is fully paid
            status: 'completed' as const,
            invoiceNumber: `INV-${Date.now()}`, // Simple invoice number generation
            createdBy: user?.id,        // Track who created the sale
            createdByName: user?.name,  // Store the name of who created the sale
            items: cart.map(item => ({
                id: item.id,
                type: item.type,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        addSale(newSale);
        onBack();
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('action.back')}
                </Button>
                <h1 className="text-2xl font-bold">{t('sales.newSale')}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left Col: Item Selection */}
                <div className="lg:col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>{t('sales.catalog')}</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder={t('sales.searchArticleOrService')}
                                    value={itemSearch}
                                    onChange={(e) => setItemSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredItems.map(item => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className="group relative cursor-pointer rounded-lg border p-4 hover:border-blue-500 hover:shadow-md transition-all"
                                        onClick={() => addToCart(item, item.type)}
                                    >
                                        <div className="aspect-square mb-2 overflow-hidden rounded-md bg-slate-100">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <p className="font-semibold text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{item.type === 'article' ? t('articles.title') : t('services.title')}</p>
                                        <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <Plus className="text-blue-600 h-8 w-8" />
                                        </div>
                                    </div>
                                ))}
                                {filteredItems.length === 0 && (
                                    <p className="text-muted-foreground col-span-full text-center py-8">{t('empty.noResults')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Cart & Client */}
                <div className="space-y-6 flex flex-col h-full overflow-y-auto">
                    {/* Client Selection */}
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> {t('clients.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('sales.selectClient')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Cart */}
                    <Card className="flex-1 border-none shadow-lg flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" /> {t('sales.cart')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                                {cart.length === 0 ? (
                                    <p className="text-center text-sm text-slate-400 py-8">{t('sales.cartEmpty')}</p>
                                ) : (
                                    cart.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(index, -1)}
                                                >-</Button>
                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(index, 1)}
                                                >+</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-600"
                                                    onClick={() => removeFromCart(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t space-y-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>{t('field.total')}</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={!selectedClientId || cart.length === 0}
                                    onClick={handleSaveSale}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('sales.validateSale')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
