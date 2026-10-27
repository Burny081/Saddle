import { expect, test } from 'vitest';
import { buildAdminCommandCenterData } from './adminCommandCenterData';

test('builds factual operational metrics and stock alerts', () => {
  const data = buildAdminCommandCenterData({
    articles: [
      { id: 'a-1', name: 'Coffret', stock: 2, minStock: 5 },
      { id: 'a-2', name: 'Câble', stock: 8, minStock: 5 },
    ] as never[],
    sales: [{ id: 's-1', clientName: 'Acme', total: 2000, date: '2026-10-27' }] as never[],
    clients: [{ id: 'c-1', name: 'Acme' }] as never[],
  });

  expect(data.metrics).toEqual([
    expect.objectContaining({ id: 'sales', value: 1 }),
    expect.objectContaining({ id: 'clients', value: 1 }),
    expect.objectContaining({ id: 'stock', value: 2 }),
    expect.objectContaining({ id: 'attention', value: 1 }),
  ]);
  expect(data.lowStockArticles.map((article) => article.name)).toEqual(['Coffret']);
  expect(data.metrics.every((metric) => metric.change === undefined)).toBe(true);
});

test('orders recent sales without mutating source data', () => {
  const sales = [
    { id: 'older', clientName: 'B', total: 1000, date: '2026-10-01' },
    { id: 'newer', clientName: 'A', total: 2000, date: '2026-10-27' },
  ] as never[];

  const data = buildAdminCommandCenterData({ articles: [], clients: [], sales });

  expect(data.recentSales.map((sale) => sale.id)).toEqual(['newer', 'older']);
  expect(sales.map((sale) => sale.id)).toEqual(['older', 'newer']);
});
