import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock3, DollarSign, Eye, Package, Search, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { AppPageHeader } from '@/components/app-shell/AppPageHeader';
import { AppPanel } from '@/components/app-shell/AppPanel';
import { DataState } from '@/components/app-shell/DataState';
import { StatusBadge } from '@/components/app-shell/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/config/constants';
import type { Sale } from '@/types/compatibility';

interface OrdersViewProps { onBack?: () => void; }
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
interface ExtendedSale extends Sale { orderStatus: OrderStatus; }

const statusConfig = {
  pending: { label: { fr: 'En attente', en: 'Pending' }, tone: 'warning' as const, icon: Clock3 },
  confirmed: { label: { fr: 'Confirmée', en: 'Confirmed' }, tone: 'info' as const, icon: CheckCircle2 },
  preparing: { label: { fr: 'En préparation', en: 'Preparing' }, tone: 'info' as const, icon: Package },
  shipped: { label: { fr: 'Expédiée', en: 'Shipped' }, tone: 'info' as const, icon: Truck },
  delivered: { label: { fr: 'Livrée', en: 'Delivered' }, tone: 'success' as const, icon: CheckCircle2 },
  cancelled: { label: { fr: 'Annulée', en: 'Cancelled' }, tone: 'danger' as const, icon: Clock3 },
};

function statusForSale(sale: Sale): OrderStatus {
  if (sale.status === 'completed' || sale.status === 'delivered') return 'delivered';
  return sale.status === 'pending' ? 'pending' : 'confirmed';
}

export function OrdersView({ onBack }: OrdersViewProps) {
  const { user } = useAuth();
  const { sales } = useData();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedSale | null>(null);

  const orders = useMemo(() => !user ? [] : sales.filter((sale) => sale.clientName === user.name || sale.createdBy === user.id).map((sale) => ({ ...sale, orderStatus: statusForSale(sale) })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sales, user]);
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return (!query || (order.invoiceNumber || '').toLocaleLowerCase().includes(query) || order.items.some((item) => item.name.toLocaleLowerCase().includes(query))) && (statusFilter === 'all' || order.orderStatus === statusFilter);
  }), [orders, searchQuery, statusFilter]);
  const stats = useMemo(() => ({ count: orders.length, amount: orders.reduce((sum, order) => sum + order.total, 0), pending: orders.filter((order) => order.orderStatus === 'pending').length, delivered: orders.filter((order) => order.orderStatus === 'delivered').length }), [orders]);

  if (!user) return <div className="p-4 sm:p-6"><DataState kind="error" title="Connexion requise" description="Connectez-vous pour consulter vos commandes." /></div>;

  const metrics = [
    { label: 'Commandes', value: stats.count, icon: ShoppingBag, tone: 'text-primary' },
    { label: 'Montant cumulé', value: formatCurrency(stats.amount), icon: DollarSign, tone: 'text-emerald-600' },
    { label: 'À traiter', value: stats.pending, icon: Clock3, tone: 'text-amber-600' },
    { label: 'Livrées', value: stats.delivered, icon: CheckCircle2, tone: 'text-emerald-600' },
  ];

  return <div className="space-y-6 p-4 sm:p-6 lg:p-8">
    <AppPageHeader eyebrow="Espace client" title="Mes commandes" description="Suivez vos achats, leur préparation et leur livraison." actions={onBack ? <Button variant="outline" className="min-h-11" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button> : undefined} />
    <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex min-h-28 items-center justify-between bg-card px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-2 font-[var(--font-display)] text-2xl font-bold tracking-[-0.03em] text-foreground">{value}</p></div><Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" /></div>)}</div>
    <AppPanel title="Historique des commandes" description="Recherchez une facture ou filtrez par statut.">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:p-5"><label className="relative flex-1"><span className="sr-only">Rechercher une commande</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="N° de facture ou article" className="h-11 pl-10" /></label><label><span className="sr-only">Filtrer les commandes par statut</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'all')} className="h-11 min-w-52 border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Filtrer les commandes par statut"><option value="all">Tous les statuts</option>{Object.entries(statusConfig).map(([status, config]) => <option key={status} value={status}>{config.label[language]}</option>)}</select></label></div>
      {filteredOrders.length === 0 ? <DataState kind="empty" title={searchQuery || statusFilter !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'} description={searchQuery || statusFilter !== 'all' ? 'Modifiez vos critères de recherche pour élargir le résultat.' : 'Vos futures commandes apparaîtront ici avec leur statut.'} /> : <div className="divide-y divide-border">{filteredOrders.map((order) => { const config = statusConfig[order.orderStatus]; const Icon = config.icon; return <article key={order.id} className="grid gap-4 p-4 transition-colors hover:bg-muted/40 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-[var(--font-display)] text-base font-bold text-foreground">{order.invoiceNumber || `Commande ${order.id}`}</h3><StatusBadge tone={config.tone}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{config.label[language]}</StatusBadge></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />{new Date(order.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4" aria-hidden="true" />{order.items.length} article{order.items.length > 1 ? 's' : ''}</span></div><p className="mt-3 truncate text-sm text-muted-foreground">{order.items.map((item) => `${item.name} ×${item.quantity}`).join(' · ')}</p></div><div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end"><p className="font-[var(--font-display)] text-lg font-bold text-foreground">{formatCurrency(order.total)}</p><Button variant="outline" className="min-h-10" onClick={() => setSelectedOrder(order)} aria-label={`Voir les détails de ${order.invoiceNumber || order.id}`}><Eye className="mr-2 h-4 w-4" />Détails</Button></div></article>; })}</div>}
    </AppPanel>
    <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto p-0">{selectedOrder && <><DialogHeader className="border-b border-border px-5 py-4 sm:px-6"><DialogTitle className="font-[var(--font-display)] text-xl">Commande {selectedOrder.invoiceNumber || selectedOrder.id}</DialogTitle></DialogHeader><div className="space-y-5 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/40 p-4"><span className="text-sm font-medium text-muted-foreground">Statut de la commande</span>{(() => { const config = statusConfig[selectedOrder.orderStatus]; const Icon = config.icon; return <StatusBadge tone={config.tone}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{config.label[language]}</StatusBadge>; })()}</div><div className="divide-y divide-border border border-border">{selectedOrder.items.map((item) => <div key={`${item.id}-${item.name}`} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">Quantité : {item.quantity}</p></div><p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p></div>)}</div><div className="flex items-center justify-between border-t border-border pt-5"><span className="font-[var(--font-display)] text-lg font-bold">Total</span><span className="font-[var(--font-display)] text-xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span></div></div></>}</DialogContent></Dialog>
  </div>;
}
