import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface StoreStock {
  id: string;
  store_id: string;
  article_id: string;
  stock: number;
  min_stock: number;
  max_stock?: number;
  shelf_location?: string;
  last_inventory_date?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  article_name?: string;
  article_price?: number;
  store_name?: string;
}

export interface StockMovement {
  id: string;
  store_id: string;
  article_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  from_store_id?: string;
  to_store_id?: string;
  notes?: string;
  performed_by?: string;
  movement_date?: string;
  created_at?: string;
  // Joined data
  article_name?: string;
  performed_by_name?: string;
  store_name?: string;
  from_store_name?: string;
  to_store_name?: string;
}

export interface StockAlert {
  id: string;
  store_id: string;
  article_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  threshold?: number;
  current_value?: number;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at?: string;
}

export interface StockSummary {
  totalArticles: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: number;
}

// ============================================================================
// STORE STOCK - CRUD
// ============================================================================

export async function getStoreStock(storeId?: string): Promise<StoreStock[]> {
  let query = supabase
    .from('store_stock')
    .select(`
      *,
      articles!inner(name, price),
      stores!inner(name)
    `)
    .order('updated_at', { ascending: false });
  
  if (storeId) {
    query = query.eq('store_id', storeId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching store stock:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    article_name: (item.articles as { name?: string })?.name,
    article_price: (item.articles as { price?: number })?.price,
    store_name: (item.stores as { name?: string })?.name
  })) as StoreStock[];
}

export async function getStoreStockByArticle(articleId: string): Promise<StoreStock[]> {
  const { data, error } = await supabase
    .from('store_stock')
    .select(`
      *,
      stores!inner(name)
    `)
    .eq('article_id', articleId);
  
  if (error) {
    console.error('Error fetching stock by article:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    store_name: (item.stores as { name?: string })?.name
  })) as StoreStock[];
}

export async function updateStoreStock(
  storeId: string,
  articleId: string,
  stock: number,
  options?: { min_stock?: number; max_stock?: number; shelf_location?: string }
): Promise<StoreStock | null> {
  const { data, error } = await supabase
    .from('store_stock')
    .upsert({
      store_id: storeId,
      article_id: articleId,
      stock,
      ...options,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id,article_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error updating store stock:', error);
    return null;
  }
  return data;
}

export async function getLowStockItems(storeId?: string, threshold?: number): Promise<StoreStock[]> {
  let query = supabase
    .from('store_stock')
    .select(`
      *,
      articles!inner(name, price),
      stores!inner(name)
    `)
    .lt('stock', threshold || 10);
  
  if (storeId) {
    query = query.eq('store_id', storeId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching low stock items:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    article_name: (item.articles as { name?: string })?.name,
    article_price: (item.articles as { price?: number })?.price,
    store_name: (item.stores as { name?: string })?.name
  })) as StoreStock[];
}

// ============================================================================
// STOCK MOVEMENTS - CRUD
// ============================================================================

export async function getStockMovements(
  storeId?: string,
  articleId?: string,
  startDate?: string,
  endDate?: string,
  limit = 100
): Promise<StockMovement[]> {
  let query = supabase
    .from('stock_movements')
    .select(`
      *,
      articles(name),
      profiles(full_name),
      stores:store_id(name)
    `)
    .order('movement_date', { ascending: false })
    .limit(limit);
  
  if (storeId) query = query.eq('store_id', storeId);
  if (articleId) query = query.eq('article_id', articleId);
  if (startDate) query = query.gte('movement_date', startDate);
  if (endDate) query = query.lte('movement_date', endDate);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching stock movements:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    article_name: (item.articles as { name?: string })?.name,
    performed_by_name: (item.profiles as { full_name?: string })?.full_name,
    store_name: (item.stores as { name?: string })?.name
  })) as StockMovement[];
}

export async function createStockMovement(movement: {
  store_id: string;
  article_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  notes?: string;
  reference_type?: string;
  reference_id?: string;
  from_store_id?: string;
  to_store_id?: string;
  performed_by?: string;
}): Promise<StockMovement | null> {
  // First, get current stock
  const { data: currentStock } = await supabase
    .from('store_stock')
    .select('stock')
    .eq('store_id', movement.store_id)
    .eq('article_id', movement.article_id)
    .single();
  
  const previousStock = currentStock?.stock || 0;
  let newStock = previousStock;
  
  // Calculate new stock based on movement type
  switch (movement.movement_type) {
    case 'in':
    case 'return':
      newStock = previousStock + movement.quantity;
      break;
    case 'out':
    case 'transfer':
      newStock = Math.max(0, previousStock - movement.quantity);
      break;
    case 'adjustment':
      newStock = movement.quantity; // Direct set
      break;
  }
  
  // Create movement record
  const { data, error } = await supabase
    .from('stock_movements')
    .insert({
      ...movement,
      previous_stock: previousStock,
      new_stock: newStock,
      movement_date: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating stock movement:', error);
    return null;
  }
  
  // Update store_stock
  await updateStoreStock(movement.store_id, movement.article_id, newStock);
  
  // If transfer, also update destination store
  if (movement.movement_type === 'transfer' && movement.to_store_id) {
    const { data: destStock } = await supabase
      .from('store_stock')
      .select('stock')
      .eq('store_id', movement.to_store_id)
      .eq('article_id', movement.article_id)
      .single();
    
    const destPrevStock = destStock?.stock || 0;
    await updateStoreStock(movement.to_store_id, movement.article_id, destPrevStock + movement.quantity);
    
    // Create receiving movement record
    await supabase.from('stock_movements').insert({
      store_id: movement.to_store_id,
      article_id: movement.article_id,
      movement_type: 'in',
      quantity: movement.quantity,
      previous_stock: destPrevStock,
      new_stock: destPrevStock + movement.quantity,
      reference_type: 'transfer',
      reference_id: data.id,
      from_store_id: movement.store_id,
      notes: `Transfert reçu de ${movement.store_id}`,
      performed_by: movement.performed_by,
      movement_date: new Date().toISOString()
    });
  }
  
  return data;
}

// ============================================================================
// STOCK ALERTS
// ============================================================================

export async function getStockAlerts(storeId?: string, includeResolved = false): Promise<StockAlert[]> {
  let query = supabase
    .from('store_alerts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (storeId) query = query.eq('store_id', storeId);
  if (!includeResolved) query = query.eq('is_resolved', false);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching stock alerts:', error);
    return [];
  }
  return data || [];
}

export async function resolveStockAlert(alertId: string, resolvedBy: string): Promise<boolean> {
  const { error } = await supabase
    .from('store_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy
    })
    .eq('id', alertId);
  
  if (error) {
    console.error('Error resolving stock alert:', error);
    return false;
  }
  return true;
}

// ============================================================================
// STOCK SUMMARY & ANALYTICS
// ============================================================================

export async function getStockSummary(storeId?: string): Promise<StockSummary> {
  // Get total articles and value
  let stockQuery = supabase.from('store_stock').select('stock, articles(price)');
  if (storeId) stockQuery = stockQuery.eq('store_id', storeId);
  const { data: stockData } = await stockQuery;
  
  // Get low stock count (< 10)
  let lowStockQuery = supabase.from('store_stock').select('id', { count: 'exact' }).lt('stock', 10);
  if (storeId) lowStockQuery = lowStockQuery.eq('store_id', storeId);
  const { count: lowStockCount } = await lowStockQuery;
  
  // Get out of stock count (= 0)
  let outOfStockQuery = supabase.from('store_stock').select('id', { count: 'exact' }).eq('stock', 0);
  if (storeId) outOfStockQuery = outOfStockQuery.eq('store_id', storeId);
  const { count: outOfStockCount } = await outOfStockQuery;
  
  // Get recent movements (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let movementsQuery = supabase.from('stock_movements').select('id', { count: 'exact' }).gte('movement_date', oneDayAgo);
  if (storeId) movementsQuery = movementsQuery.eq('store_id', storeId);
  const { count: recentMovements } = await movementsQuery;
  
  // Calculate total value
  let totalValue = 0;
  if (stockData) {
    stockData.forEach((item: Record<string, unknown>) => {
      const stock = (item.stock as number) || 0;
      const price = (item.articles as { price?: number })?.price || 0;
      totalValue += stock * price;
    });
  }
  
  return {
    totalArticles: stockData?.length || 0,
    totalValue,
    lowStockCount: lowStockCount || 0,
    outOfStockCount: outOfStockCount || 0,
    recentMovements: recentMovements || 0
  };
}

// ============================================================================
// INVENTORY OPERATIONS
// ============================================================================

export async function performInventoryCount(
  storeId: string,
  counts: Array<{ article_id: string; counted_stock: number }>,
  performedBy: string
): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  
  for (const count of counts) {
    const result = await createStockMovement({
      store_id: storeId,
      article_id: count.article_id,
      movement_type: 'adjustment',
      quantity: count.counted_stock,
      notes: 'Inventaire physique',
      reference_type: 'inventory',
      performed_by: performedBy
    });
    
    if (result) {
      success++;
      // Update last inventory date
      await supabase
        .from('store_stock')
        .update({ last_inventory_date: new Date().toISOString() })
        .eq('store_id', storeId)
        .eq('article_id', count.article_id);
    } else {
      errors.push(`Failed to update ${count.article_id}`);
    }
  }
  
  return { success, errors };
}

export async function transferStock(
  fromStoreId: string,
  toStoreId: string,
  articleId: string,
  quantity: number,
  performedBy: string,
  notes?: string
): Promise<StockMovement | null> {
  return createStockMovement({
    store_id: fromStoreId,
    article_id: articleId,
    movement_type: 'transfer',
    quantity,
    to_store_id: toStoreId,
    notes: notes || `Transfert vers ${toStoreId}`,
    reference_type: 'transfer',
    performed_by: performedBy
  });
}

// ============================================================================
// AUTO-REORDER FUNCTIONALITY
// ============================================================================

export interface ReorderSuggestion {
  article_id: string;
  article_name: string;
  current_stock: number;
  min_stock: number;
  suggested_quantity: number;
  supplier_id?: string;
  supplier_name?: string;
  store_id: string;
  store_name: string;
}

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  items: Array<{
    article_id: string;
    article_name: string;
    quantity: number;
    unit_price: number;
  }>;
  total_amount: number;
  status: 'draft' | 'pending' | 'confirmed' | 'received' | 'cancelled';
  created_at: string;
  created_by: string;
  notes?: string;
}

/**
 * Check for items that need reordering based on stock levels
 */
export async function checkReorderNeeded(storeId?: string): Promise<ReorderSuggestion[]> {
  if (!supabase) return [];
  
  try {
    // Get low stock items with article and supplier info
    let query = supabase
      .from('store_stock')
      .select(`
        store_id,
        stock,
        article_id,
        articles!inner (
          id,
          name,
          min_stock,
          supplier_id,
          suppliers ( id, name )
        ),
        stores ( id, name )
      `)
      .lt('stock', 10);  // Will compare with min_stock below
    
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking reorder needs:', error);
      return [];
    }
    
    const suggestions: ReorderSuggestion[] = [];
    
    for (const item of data || []) {
      const article = Array.isArray(item.articles) ? item.articles[0] : item.articles as { id: string; name: string; min_stock: number; supplier_id?: string; suppliers?: { id: string; name: string } };
      const store = Array.isArray(item.stores) ? item.stores[0] : item.stores as { id: string; name: string };
      const currentStock = item.stock || 0;
      const minStock = article?.min_stock || 10;
      
      // Only suggest reorder if stock is below min_stock
      if (currentStock < minStock) {
        // Suggest ordering enough to reach 150% of min_stock
        const suggestedQuantity = Math.ceil(minStock * 1.5) - currentStock;
        
        suggestions.push({
          article_id: article.id,
          article_name: article.name,
          current_stock: currentStock,
          min_stock: minStock,
          suggested_quantity: Math.max(suggestedQuantity, minStock),
          supplier_id: article.supplier_id,
          supplier_name: Array.isArray(article.suppliers) ? article.suppliers[0]?.name : article.suppliers?.name,
          store_id: item.store_id,
          store_name: store?.name || 'Unknown',
        });
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error in checkReorderNeeded:', error);
    return [];
  }
}

/**
 * Create supplier order from reorder suggestions
 */
export async function createSupplierOrder(
  supplierId: string,
  supplierName: string,
  items: Array<{ article_id: string; article_name: string; quantity: number; unit_price: number }>,
  createdBy: string,
  notes?: string
): Promise<SupplierOrder | null> {
  const orderId = crypto.randomUUID();
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  
  const order: SupplierOrder = {
    id: orderId,
    supplier_id: supplierId,
    supplier_name: supplierName,
    items,
    total_amount: totalAmount,
    status: 'draft',
    created_at: new Date().toISOString(),
    created_by: createdBy,
    notes,
  };
  
  // Try to save to database if available
  if (supabase) {
    try {
      const { error } = await supabase
        .from('supplier_orders')
        .insert({
          id: orderId,
          supplier_id: supplierId,
          total_amount: totalAmount,
          status: 'draft',
          notes,
          created_by: createdBy,
        });
      
      if (!error) {
        // Insert order items
        for (const item of items) {
          await supabase.from('supplier_order_items').insert({
            order_id: orderId,
            article_id: item.article_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          });
        }
      }
    } catch (e) {
      console.error('Error saving supplier order:', e);
    }
  }
  
  return order;
}

/**
 * Process auto-reorder for all low stock items
 * Groups items by supplier and creates orders
 */
export async function processAutoReorder(
  storeId: string | undefined,
  createdBy: string,
  getArticlePrice: (articleId: string) => number
): Promise<{ orders: SupplierOrder[]; itemsProcessed: number }> {
  const suggestions = await checkReorderNeeded(storeId);
  
  if (suggestions.length === 0) {
    return { orders: [], itemsProcessed: 0 };
  }
  
  // Group by supplier
  const bySupplier = new Map<string, ReorderSuggestion[]>();
  const noSupplier: ReorderSuggestion[] = [];
  
  for (const suggestion of suggestions) {
    if (suggestion.supplier_id) {
      const existing = bySupplier.get(suggestion.supplier_id) || [];
      existing.push(suggestion);
      bySupplier.set(suggestion.supplier_id, existing);
    } else {
      noSupplier.push(suggestion);
    }
  }
  
  const orders: SupplierOrder[] = [];
  
  // Create order for each supplier
  for (const [supplierId, items] of bySupplier) {
    const supplierName = items[0]?.supplier_name || 'Fournisseur inconnu';
    
    const orderItems = items.map(item => ({
      article_id: item.article_id,
      article_name: item.article_name,
      quantity: item.suggested_quantity,
      unit_price: getArticlePrice(item.article_id),
    }));
    
    const order = await createSupplierOrder(
      supplierId,
      supplierName,
      orderItems,
      createdBy,
      `Commande automatique - Stock bas`
    );
    
    if (order) {
      orders.push(order);
    }
  }
  
  // Create a "no supplier" order for items without assigned supplier
  if (noSupplier.length > 0) {
    const orderItems = noSupplier.map(item => ({
      article_id: item.article_id,
      article_name: item.article_name,
      quantity: item.suggested_quantity,
      unit_price: getArticlePrice(item.article_id),
    }));
    
    const order = await createSupplierOrder(
      'unassigned',
      'À assigner',
      orderItems,
      createdBy,
      `Commande automatique - Articles sans fournisseur assigné`
    );
    
    if (order) {
      orders.push(order);
    }
  }
  
  return { orders, itemsProcessed: suggestions.length };
}

