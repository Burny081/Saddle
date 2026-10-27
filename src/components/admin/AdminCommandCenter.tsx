import { AlertTriangle, ArrowRight, Boxes, ClipboardList, PackageSearch, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { AppPageHeader } from '@/components/app-shell/AppPageHeader';
import { useData } from '@/contexts/DataContext';
import { buildAdminCommandCenterData, type AdminCommandCenterMetric } from './adminCommandCenterData';

interface AdminCommandCenterProps {
  onNavigate: (view: string) => void;
}

const metricIcons = {
  sales: ClipboardList,
  clients: Users,
  stock: Boxes,
  attention: AlertTriangle,
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(parsedDate);
}

function MetricCard({ metric, onNavigate }: { metric: AdminCommandCenterMetric; onNavigate: (view: string) => void }) {
  const Icon = metricIcons[metric.id];

  return (
    <button
      type="button"
      onClick={() => onNavigate(metric.href)}
      className="group min-h-36 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
      </span>
      <span className="mt-5 block text-3xl font-bold tracking-tight text-foreground">{metric.value}</span>
      <span className="mt-1 block text-sm font-medium text-muted-foreground">{metric.label}</span>
    </button>
  );
}

export function AdminCommandCenter({ onNavigate }: AdminCommandCenterProps) {
  const { articles, clients, sales, isLoading, error, refreshData } = useData();
  const data = buildAdminCommandCenterData({ articles, clients, sales });

  if (isLoading) {
    return (
      <section aria-busy="true" className="space-y-6">
        <AppPageHeader eyebrow="Administration" title="Centre de pilotage" description="Chargement des opérations SaddlePoint." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <AppPageHeader eyebrow="Administration" title="Centre de pilotage" description="Priorités et opérations SaddlePoint." />
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold">Les données ne sont pas disponibles</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-5 min-h-11" onClick={() => void refreshData()}>Réessayer</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <AppPageHeader
        eyebrow="Administration"
        title="Centre de pilotage"
        description="Les priorités opérationnelles, fondées sur vos données SaddlePoint."
        actions={<Button variant="outline" className="min-h-11" onClick={() => onNavigate('reports')}>Voir les rapports</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} onNavigate={onNavigate} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <section aria-labelledby="stock-priorities" className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#b7212d]">À traiter</p>
              <h2 id="stock-priorities" className="mt-1 text-xl font-bold">Priorités de stock</h2>
              <p className="mt-1 text-sm text-muted-foreground">Références au seuil minimal ou en dessous.</p>
            </div>
            <Button variant="outline" className="min-h-11" onClick={() => onNavigate('stock')}>Voir le stock</Button>
          </div>
          {data.lowStockArticles.length ? (
            <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
              {data.lowStockArticles.slice(0, 5).map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{article.name}</span>
                    <span className="text-xs text-muted-foreground">Seuil minimal : {article.minStock}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">{article.stock} restant{article.stock > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">Aucune alerte de stock à traiter.</div>
          )}
        </section>

        <section aria-labelledby="recent-operations" className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#124a93]">Activité</p>
          <h2 id="recent-operations" className="mt-1 text-xl font-bold">Ventes récentes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Les cinq dernières ventes enregistrées.</p>
          {data.recentSales.length ? (
            <ul className="mt-5 space-y-3">
              {data.recentSales.map((sale) => (
                <li key={sale.id} className="rounded-lg bg-muted/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold">{sale.clientName || 'Client non renseigné'}</span>
                    <span className="shrink-0 text-sm font-bold text-primary">{formatAmount(sale.total)}</span>
                  </div>
                  <span className="mt-1 block text-xs text-muted-foreground">{formatDate(sale.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">Aucune vente enregistrée pour le moment.</div>
          )}
          <Button variant="ghost" className="mt-4 min-h-11 w-full justify-between" onClick={() => onNavigate('sales')}>Ouvrir les ventes <ArrowRight className="h-4 w-4" /></Button>
        </section>
      </div>

      <section aria-labelledby="admin-shortcuts" className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#124a93]">Accès rapide</p>
        <h2 id="admin-shortcuts" className="mt-1 text-xl font-bold">Gérer les opérations</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Nouvel article', view: 'articles-new', icon: PackageSearch },
            { label: 'Nouvelle vente', view: 'sales-new', icon: ClipboardList },
            { label: 'Gérer les clients', view: 'clients', icon: Users },
            { label: 'Gérer les utilisateurs', view: 'users', icon: Users },
          ].map(({ label, view, icon: Icon }) => (
            <Button key={view} variant="outline" className="min-h-12 justify-start gap-3" onClick={() => onNavigate(view)}><Icon className="h-4 w-4 text-primary" />{label}</Button>
          ))}
        </div>
      </section>
    </section>
  );
}
