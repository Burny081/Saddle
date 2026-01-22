import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Eye,
    Search,
    Filter,
    Calendar,
    ArrowLeft,
    ShoppingBag,
    DollarSign,
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
} from '@/app/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/config/constants';
import type { Sale } from '@/types/compatibility';

interface OrdersViewProps {
    onBack?: () => void;
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

interface ExtendedSale extends Sale {
    orderStatus?: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: { fr: string; en: string }; icon: any; color: string; bgColor: string }> = {
    pending: {
        label: { fr: 'En attente', en: 'Pending' },
        icon: Clock,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    confirmed: {
        label: { fr: 'Confirmée', en: 'Confirmed' },
        icon: CheckCircle,
        color: 'text-blue-700',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    preparing: {
        label: { fr: 'En préparation', en: 'Preparing' },
        icon: Package,
        color: 'text-purple-700',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    shipped: {
        label: { fr: 'Expédiée', en: 'Shipped' },
        icon: Truck,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    delivered: {
        label: { fr: 'Livrée', en: 'Delivered' },
        icon: CheckCircle,
        color: 'text-green-700',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    cancelled: {
        label: { fr: 'Annulée', en: 'Cancelled' },
        icon: XCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
};

export function OrdersView({ onBack }: OrdersViewProps) {
    const { user } = useAuth();
    const { language } = useLanguage();
    const { sales } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<ExtendedSale | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    // Filter orders for current client
    const clientOrders = useMemo(() => {
        if (!user) return [];
        return sales
            .filter(sale => sale.clientName === user.name || sale.createdBy === user.id)
            .map(sale => ({
                ...sale,
                orderStatus: (sale.status === 'completed' ? 'delivered' : 
                             sale.status === 'pending' ? 'pending' : 
                             'confirmed') as OrderStatus
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, user]);

    // Apply filters
    const filteredOrders = useMemo(() => {
        return clientOrders.filter(order => {
            const invoiceNum = order.invoiceNumber || '';
            const matchesSearch = searchQuery === '' || 
                invoiceNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [clientOrders, searchQuery, statusFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = clientOrders.length;
        const totalAmount = clientOrders.reduce((sum, order) => sum + order.total, 0);
        const pending = clientOrders.filter(o => o.orderStatus === 'pending').length;
        const delivered = clientOrders.filter(o => o.orderStatus === 'delivered').length;
        
        return { total, totalAmount, pending, delivered };
    }, [clientOrders]);

    const handleViewDetails = (order: ExtendedSale) => {
        setSelectedOrder(order);
        setShowDetailsDialog(true);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Vous devez être connecté pour voir vos commandes</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="h-8 w-8 text-blue-600" />
                            Mes Commandes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Suivez l'état de vos commandes
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Commandes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <ShoppingBag className="h-10 w-10 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <DollarSign className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">En Attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="h-10 w-10 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Livrées</p>
                                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Rechercher par numéro de commande ou article..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Filtrer les commandes par statut"
                            >
                                <option value="all">Tous les statuts</option>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <option key={key} value={key}>
                                        {config.label[language]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 text-lg">
                            {searchQuery || statusFilter !== 'all' 
                                ? 'Aucune commande ne correspond à vos critères'
                                : 'Vous n\'avez pas encore de commande'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => {
                        const status = order.orderStatus || 'pending';
                        const StatusIcon = statusConfig[status].icon;

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {order.invoiceNumber}
                                                    </h3>
                                                    <Badge className={`${statusConfig[status].bgColor} ${statusConfig[status].color} flex items-center gap-1`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusConfig[status].label[language]}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(order.date).toLocaleDateString('fr-FR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                                                        >
                                                            {item.name} x{item.quantity}
                                                        </span>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end gap-2">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {formatCurrency(order.total)}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(order)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Voir détails
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Order Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Package className="h-6 w-6 text-blue-600" />
                            Détails de la commande {selectedOrder?.invoiceNumber}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-semibold">Statut:</span>
                                <Badge className={`${statusConfig[selectedOrder.orderStatus || 'pending'].bgColor} ${statusConfig[selectedOrder.orderStatus || 'pending'].color} flex items-center gap-1 text-base px-3 py-1`}>
                                    {(() => {
                                        const StatusIcon = statusConfig[selectedOrder.orderStatus || 'pending'].icon;
                                        return <StatusIcon className="h-4 w-4" />;
                                    })()}
                                    {statusConfig[selectedOrder.orderStatus || 'pending'].label[language]}
                                </Badge>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Date de commande</p>
                                    <p className="font-semibold">{new Date(selectedOrder.date).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Numéro de commande</p>
                                    <p className="font-semibold">{selectedOrder.invoiceNumber}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold mb-3 text-lg">Articles commandés</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
