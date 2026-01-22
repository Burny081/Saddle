/**
 * API Magasins - Supabase
 * Gestion des magasins, paramètres par magasin et stock par magasin
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Store {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  city: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  alternate_phone?: string;
  email?: string;
  website?: string;
  manager?: string;
  manager_email?: string;
  manager_phone?: string;
  working_days?: string;
  open_time?: string;
  close_time?: string;
  years_of_expertise?: number;
  founded_year?: number;
  image?: string;
  is_headquarters: boolean;
  is_active: boolean;
  tax_id?: string;
  registration_number?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoreSettings {
  id: string;
  store_id: string;
  tax_rate?: number;
  currency?: string;
  locale?: string;
  invoice_counter?: number;
  quote_counter?: number;
  low_stock_threshold?: number;
  open_time?: string;
  close_time?: string;
  working_days?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreStock {
  id: string;
  store_id: string;
  article_id: string;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  shelf_location?: string;
  last_inventory_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreWithSettings extends Store {
  settings?: StoreSettings;
}

// ============================================================================
// STORES CRUD
// ============================================================================

/**
 * Récupérer tous les magasins
 */
export async function getStores(activeOnly = false): Promise<Store[]> {
  let query = supabase.from('stores').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un magasin par ID
 */
export async function getStoreById(id: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Récupérer un magasin avec ses paramètres
 */
export async function getStoreWithSettings(id: string): Promise<StoreWithSettings | null> {
  const [store, settings] = await Promise.all([
    getStoreById(id),
    getStoreSettings(id)
  ]);
  
  if (!store) return null;
  return { ...store, settings: settings || undefined };
}

/**
 * Créer un magasin
 */
export async function createStore(store: Omit<Store, 'created_at' | 'updated_at'>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert(store)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un magasin
 */
export async function updateStore(id: string, updates: Partial<Store>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer un magasin
 */
export async function deleteStore(id: string): Promise<void> {
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Récupérer le magasin siège
 */
export async function getHeadquarters(): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_headquarters', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Récupérer les magasins par ville
 */
export async function getStoresByCity(city: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .ilike('city', `%${city}%`)
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ============================================================================
// STORE SETTINGS
// ============================================================================

/**
 * Récupérer les paramètres d'un magasin
 */
export async function getStoreSettings(storeId: string): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Créer ou mettre à jour les paramètres d'un magasin
 */
export async function upsertStoreSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ 
      ...settings, 
      store_id: storeId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Incrémenter le compteur de factures
 */
export async function incrementInvoiceCounter(storeId: string): Promise<number> {
  // Utiliser une fonction RPC si disponible, sinon faire un select + update
  const settings = await getStoreSettings(storeId);
  const newCounter = (settings?.invoice_counter || 0) + 1;
  
  await upsertStoreSettings(storeId, { invoice_counter: newCounter });
  return newCounter;
}

/**
 * Incrémenter le compteur de devis
 */
export async function incrementQuoteCounter(storeId: string): Promise<number> {
  const settings = await getStoreSettings(storeId);
  const newCounter = (settings?.quote_counter || 0) + 1;
  
  await upsertStoreSettings(storeId, { quote_counter: newCounter });
  return newCounter;
}

// ============================================================================
// STORE STOCK (Stock par magasin)
// ============================================================================

/**
 * Récupérer le stock d'un article dans un magasin
 */
export async function getStoreArticleStock(storeId: string, articleId: string): Promise<StoreStock | null> {
  const { data, error } = await supabase
    .from('store_stock')
    .select('*')
    .eq('store_id', storeId)
    .eq('article_id', articleId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Récupérer tout le stock d'un magasin
 */
export async function getStoreStock(storeId: string): Promise<StoreStock[]> {
  const { data, error } = await supabase
    .from('store_stock')
    .select('*, articles!inner(name, category, price)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Articles en rupture de stock dans un magasin
 */
export async function getLowStoreStock(storeId: string, threshold?: number): Promise<StoreStock[]> {
  let query = supabase
    .from('store_stock')
    .select('*, articles!inner(name, category, price)')
    .eq('store_id', storeId);
  
  if (threshold) {
    query = query.lte('stock', threshold);
  } else {
    // Stock inférieur ou égal au min_stock
    query = query.filter('stock', 'lte', 'min_stock');
  }
  
  const { data, error } = await query.order('stock', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Mettre à jour le stock d'un article dans un magasin
 */
export async function updateStoreStock(
  storeId: string, 
  articleId: string, 
  updates: Partial<StoreStock>
): Promise<StoreStock> {
  const { data, error } = await supabase
    .from('store_stock')
    .upsert({
      store_id: storeId,
      article_id: articleId,
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id,article_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Initialiser le stock d'un article dans un magasin
 */
export async function initializeStoreStock(
  storeId: string,
  articleId: string,
  initialStock: number,
  minStock = 0,
  maxStock?: number,
  shelfLocation?: string
): Promise<StoreStock> {
  const { data, error } = await supabase
    .from('store_stock')
    .insert({
      store_id: storeId,
      article_id: articleId,
      stock: initialStock,
      min_stock: minStock,
      max_stock: maxStock,
      shelf_location: shelfLocation
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Transférer du stock entre magasins
 */
export async function transferStockBetweenStores(
  fromStoreId: string,
  toStoreId: string,
  articleId: string,
  quantity: number,
  performedBy?: string,
  notes?: string
): Promise<{ fromStock: StoreStock; toStock: StoreStock }> {
  // Vérifier le stock source
  const fromStock = await getStoreArticleStock(fromStoreId, articleId);
  if (!fromStock || fromStock.stock < quantity) {
    throw new Error('Stock insuffisant pour le transfert');
  }

  // Mise à jour stock source
  const newFromStock = await updateStoreStock(fromStoreId, articleId, {
    stock: fromStock.stock - quantity
  });

  // Mise à jour stock destination
  const toStock = await getStoreArticleStock(toStoreId, articleId);
  const newToStock = await updateStoreStock(toStoreId, articleId, {
    stock: (toStock?.stock || 0) + quantity
  });

  // Enregistrer le mouvement de stock
  await supabase.from('stock_movements').insert({
    store_id: fromStoreId,
    article_id: articleId,
    movement_type: 'transfer',
    quantity: quantity,
    previous_stock: fromStock.stock,
    new_stock: newFromStock.stock,
    from_store_id: fromStoreId,
    to_store_id: toStoreId,
    notes: notes,
    performed_by: performedBy
  });

  return { fromStock: newFromStock, toStock: newToStock };
}

// ============================================================================
// STATISTIQUES MAGASINS
// ============================================================================

/**
 * Statistiques d'un magasin
 */
export async function getStoreStats(storeId: string): Promise<{
  totalArticles: number;
  lowStockCount: number;
  totalSales: number;
  todaySales: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  
  const [
    { count: totalArticles },
    { count: lowStockCount },
    { count: totalSales },
    { count: todaySales }
  ] = await Promise.all([
    supabase.from('store_stock').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('store_stock').select('*', { count: 'exact', head: true }).eq('store_id', storeId).lte('stock', 10),
    supabase.from('sales').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('sales').select('*', { count: 'exact', head: true }).eq('store_id', storeId).gte('date', today)
  ]);

  return {
    totalArticles: totalArticles || 0,
    lowStockCount: lowStockCount || 0,
    totalSales: totalSales || 0,
    todaySales: todaySales || 0
  };
}

/**
 * Liste tous les magasins avec leurs statistiques
 */
export async function getAllStoresWithStats(): Promise<(Store & { stats: Awaited<ReturnType<typeof getStoreStats>> })[]> {
  const stores = await getStores(true);
  
  const storesWithStats = await Promise.all(
    stores.map(async (store) => ({
      ...store,
      stats: await getStoreStats(store.id)
    }))
  );
  
  return storesWithStats;
}
