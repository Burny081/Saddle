/**
 * API Ventes - Supabase
 * Gestion des ventes, items de vente et paiements
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface SaleItem {
  id?: string;
  sale_id?: string;
  item_type: 'article' | 'service';
  item_id: string;
  name: string;
  quantity: number;
  price: number;
  discount_percent?: number;
  total_price: number;
  description?: string;
  created_at?: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  store_id?: string;
  client_id?: string;
  client_name: string;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  discount_percent?: number;
  total: number;
  paid: number;
  status: 'pending' | 'partial' | 'completed' | 'cancelled' | 'refunded';
  date: string;
  created_by?: string;
  created_by_name?: string;
  payment_method?: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit';
  notes?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  items?: SaleItem[];
}

export interface Payment {
  id?: string;
  sale_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'check';
  reference_number?: string;
  notes?: string;
  received_by?: string;
  payment_date?: string;
  created_at?: string;
}

export interface CreateSaleInput {
  invoice_number: string;
  store_id?: string;
  client_id?: string;
  client_name: string;
  items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[];
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  discount_percent?: number;
  total: number;
  paid?: number;
  status?: Sale['status'];
  payment_method?: Sale['payment_method'];
  notes?: string;
  due_date?: string;
  created_by?: string;
  created_by_name?: string;
}

// ============================================================================
// VENTES CRUD
// ============================================================================

/**
 * Récupérer toutes les ventes
 */
export async function getSales(filters?: {
  storeId?: string;
  status?: Sale['status'];
  clientId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Sale[]> {
  let query = supabase.from('sales').select('*');

  if (filters?.storeId) {
    query = query.eq('store_id', filters.storeId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters?.search) {
    query = query.or(`client_name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  query = query.order('date', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une vente par ID avec ses items
 */
export async function getSaleById(id: string): Promise<Sale | null> {
  const { data: sale, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!sale) return null;

  // Récupérer les items
  const { data: items, error: itemsError } = await supabase
    .from('sale_items')
    .select('*')
    .eq('sale_id', id);
  
  if (itemsError) throw itemsError;

  return { ...sale, items: items || [] };
}

/**
 * Récupérer une vente par numéro de facture
 */
export async function getSaleByInvoiceNumber(invoiceNumber: string): Promise<Sale | null> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  
  return getSaleById(data.id);
}

/**
 * Créer une vente avec ses items
 */
export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { items, ...saleData } = input;

  // Créer la vente
  const { data: sale, error } = await supabase
    .from('sales')
    .insert({
      ...saleData,
      date: new Date().toISOString(),
      paid: saleData.paid || 0,
      status: saleData.status || 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Créer les items
  if (items && items.length > 0) {
    const saleItems = items.map(item => ({
      ...item,
      sale_id: sale.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;
  }

  // Mettre à jour le stock des articles
  for (const item of items) {
    if (item.item_type === 'article') {
      // Décrémenter le stock global
      const { data: article } = await supabase
        .from('articles')
        .select('stock')
        .eq('id', item.item_id)
        .single();

      if (article) {
        await supabase
          .from('articles')
          .update({ stock: article.stock - item.quantity })
          .eq('id', item.item_id);
      }

      // Si store_id, décrémenter aussi le stock du magasin
      if (saleData.store_id) {
        const { data: storeStock } = await supabase
          .from('store_stock')
          .select('stock')
          .eq('store_id', saleData.store_id)
          .eq('article_id', item.item_id)
          .single();

        if (storeStock) {
          await supabase
            .from('store_stock')
            .update({ stock: storeStock.stock - item.quantity })
            .eq('store_id', saleData.store_id)
            .eq('article_id', item.item_id);
        }
      }
    }
  }

  // Mettre à jour le total dépensé du client
  if (saleData.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('total_spent')
      .eq('id', saleData.client_id)
      .single();

    if (client) {
      await supabase
        .from('clients')
        .update({ total_spent: client.total_spent + saleData.total })
        .eq('id', saleData.client_id);
    }
  }

  return getSaleById(sale.id) as Promise<Sale>;
}

/**
 * Mettre à jour une vente
 */
export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
  const { items, ...saleUpdates } = updates;
  
  const { error } = await supabase
    .from('sales')
    .update({ ...saleUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Mettre à jour les items si fournis
  if (items) {
    // Supprimer les anciens items
    await supabase.from('sale_items').delete().eq('sale_id', id);
    
    // Insérer les nouveaux
    if (items.length > 0) {
      const saleItems = items.map(item => ({
        ...item,
        sale_id: id
      }));
      await supabase.from('sale_items').insert(saleItems);
    }
  }

  return getSaleById(id) as Promise<Sale>;
}

/**
 * Annuler une vente
 */
export async function cancelSale(id: string): Promise<Sale> {
  const sale = await getSaleById(id);
  if (!sale) throw new Error('Vente non trouvée');

  // Restaurer le stock
  if (sale.items) {
    for (const item of sale.items) {
      if (item.item_type === 'article') {
        const { data: article } = await supabase
          .from('articles')
          .select('stock')
          .eq('id', item.item_id)
          .single();

        if (article) {
          await supabase
            .from('articles')
            .update({ stock: article.stock + item.quantity })
            .eq('id', item.item_id);
        }
      }
    }
  }

  return updateSale(id, { status: 'cancelled' });
}

/**
 * Supprimer une vente (soft delete = annulation)
 */
export async function deleteSale(id: string): Promise<void> {
  await cancelSale(id);
}

// ============================================================================
// ITEMS DE VENTE
// ============================================================================

/**
 * Récupérer les items d'une vente
 */
export async function getSaleItems(saleId: string): Promise<SaleItem[]> {
  const { data, error } = await supabase
    .from('sale_items')
    .select('*')
    .eq('sale_id', saleId);
  if (error) throw error;
  return data || [];
}

/**
 * Ajouter un item à une vente existante
 */
export async function addSaleItem(saleId: string, item: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>): Promise<SaleItem> {
  const { data, error } = await supabase
    .from('sale_items')
    .insert({ ...item, sale_id: saleId })
    .select()
    .single();
  if (error) throw error;

  // Mettre à jour le total de la vente
  await recalculateSaleTotal(saleId);

  return data;
}

/**
 * Supprimer un item d'une vente
 */
export async function removeSaleItem(itemId: string): Promise<void> {
  const { data: item } = await supabase
    .from('sale_items')
    .select('sale_id')
    .eq('id', itemId)
    .single();

  const { error } = await supabase
    .from('sale_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;

  // Mettre à jour le total de la vente
  if (item?.sale_id) {
    await recalculateSaleTotal(item.sale_id);
  }
}

/**
 * Recalculer le total d'une vente
 */
async function recalculateSaleTotal(saleId: string): Promise<void> {
  const items = await getSaleItems(saleId);
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  
  const { data: sale } = await supabase
    .from('sales')
    .select('tax_amount, discount_amount')
    .eq('id', saleId)
    .single();

  const total = subtotal + (sale?.tax_amount || 0) - (sale?.discount_amount || 0);

  await supabase
    .from('sales')
    .update({ subtotal, total, updated_at: new Date().toISOString() })
    .eq('id', saleId);
}

// ============================================================================
// PAIEMENTS
// ============================================================================

/**
 * Récupérer les paiements d'une vente
 */
export async function getSalePayments(saleId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('sale_id', saleId)
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Enregistrer un paiement
 */
export async function recordPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...payment,
      payment_date: payment.payment_date || new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;

  // Mettre à jour le montant payé de la vente
  const sale = await getSaleById(payment.sale_id);
  if (sale) {
    const newPaid = sale.paid + payment.amount;
    let newStatus: Sale['status'] = sale.status;
    
    if (newPaid >= sale.total) {
      newStatus = 'completed';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    }

    await updateSale(payment.sale_id, { paid: newPaid, status: newStatus });
  }

  return data;
}

/**
 * Annuler un paiement
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) throw new Error('Paiement non trouvé');

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);
  if (error) throw error;

  // Mettre à jour le montant payé de la vente
  const sale = await getSaleById(payment.sale_id);
  if (sale) {
    const newPaid = Math.max(0, sale.paid - payment.amount);
    let newStatus: Sale['status'] = 'pending';
    
    if (newPaid >= sale.total) {
      newStatus = 'completed';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    }

    await updateSale(payment.sale_id, { paid: newPaid, status: newStatus });
  }
}

// ============================================================================
// RAPPORTS & STATISTIQUES
// ============================================================================

/**
 * Statistiques des ventes
 */
export async function getSalesStats(filters?: {
  storeId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  totalRevenue: number;
  totalPaid: number;
  totalUnpaid: number;
}> {
  let query = supabase.from('sales').select('total, paid, status');

  if (filters?.storeId) {
    query = query.eq('store_id', filters.storeId);
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const sales = data || [];
  
  return {
    totalSales: sales.length,
    completedSales: sales.filter(s => s.status === 'completed').length,
    pendingSales: sales.filter(s => s.status === 'pending' || s.status === 'partial').length,
    totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
    totalPaid: sales.reduce((sum, s) => sum + s.paid, 0),
    totalUnpaid: sales.reduce((sum, s) => sum + (s.total - s.paid), 0)
  };
}

/**
 * Ventes par jour
 */
export async function getSalesByDay(startDate: string, endDate: string, storeId?: string): Promise<{
  date: string;
  count: number;
  total: number;
}[]> {
  let query = supabase
    .from('sales')
    .select('date, total')
    .gte('date', startDate)
    .lte('date', endDate)
    .neq('status', 'cancelled');

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { data, error } = await query.order('date', { ascending: true });
  if (error) throw error;

  // Grouper par jour
  const byDay = (data || []).reduce((acc, sale) => {
    const day = sale.date.split('T')[0];
    if (!acc[day]) {
      acc[day] = { date: day, count: 0, total: 0 };
    }
    acc[day].count++;
    acc[day].total += sale.total;
    return acc;
  }, {} as Record<string, { date: string; count: number; total: number }>);

  return Object.values(byDay);
}

/**
 * Top clients par montant
 */
export async function getTopClients(limit = 10, storeId?: string): Promise<{
  client_id: string;
  client_name: string;
  total_purchases: number;
  sales_count: number;
}[]> {
  let query = supabase
    .from('sales')
    .select('client_id, client_name, total')
    .neq('status', 'cancelled');

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Grouper par client
  const byClient = (data || []).reduce((acc, sale) => {
    const key = sale.client_id || sale.client_name;
    if (!acc[key]) {
      acc[key] = {
        client_id: sale.client_id || '',
        client_name: sale.client_name,
        total_purchases: 0,
        sales_count: 0
      };
    }
    acc[key].total_purchases += sale.total;
    acc[key].sales_count++;
    return acc;
  }, {} as Record<string, { client_id: string; client_name: string; total_purchases: number; sales_count: number }>);

  return Object.values(byClient)
    .sort((a, b) => b.total_purchases - a.total_purchases)
    .slice(0, limit);
}

/**
 * Génération du prochain numéro de facture
 */
export async function generateInvoiceNumber(storeId?: string, prefix = 'FAC'): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Chercher la dernière facture du mois
  const pattern = `${prefix}-${year}${month}-%`;
  
  let query = supabase
    .from('sales')
    .select('invoice_number')
    .like('invoice_number', pattern)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { data } = await query;
  
  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].invoice_number.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
}
