import type { Article, Client, Sale } from '@/types/compatibility';

export type AdminMetricId = 'sales' | 'clients' | 'stock' | 'attention';

export interface AdminCommandCenterMetric {
  id: AdminMetricId;
  value: number;
  label: string;
  href: 'sales' | 'clients' | 'stock';
}

export interface AdminStockAlert {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface AdminRecentSale {
  id: string;
  clientName: string;
  total: number;
  date: string;
}

export interface AdminCommandCenterData {
  metrics: AdminCommandCenterMetric[];
  lowStockArticles: AdminStockAlert[];
  recentSales: AdminRecentSale[];
}

interface AdminCommandCenterInput {
  articles: Article[];
  sales: Sale[];
  clients: Client[];
}

export function buildAdminCommandCenterData({
  articles,
  sales,
  clients,
}: AdminCommandCenterInput): AdminCommandCenterData {
  const lowStockArticles = articles
    .filter((article) => article.stock <= article.minStock)
    .map(({ id, name, stock, minStock }) => ({ id, name, stock, minStock }));

  return {
    metrics: [
      { id: 'sales', value: sales.length, label: 'Ventes enregistrées', href: 'sales' },
      { id: 'clients', value: clients.length, label: 'Clients suivis', href: 'clients' },
      { id: 'stock', value: articles.length, label: 'Références en stock', href: 'stock' },
      { id: 'attention', value: lowStockArticles.length, label: 'Alertes stock', href: 'stock' },
    ],
    lowStockArticles,
    recentSales: [...sales]
      .sort((first, second) => second.date.localeCompare(first.date))
      .slice(0, 5)
      .map(({ id, clientName, total, date }) => ({ id, clientName, total, date })),
  };
}
