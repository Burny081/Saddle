/**
 * API Catalogue - Supabase
 * Gestion des articles, services, clients et catégories
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Article {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  purchase_price: number;
  stock: number;
  min_stock: number;
  image?: string;
  status: 'active' | 'inactive';
  unit: string;
  sku?: string;
  barcode?: string;
  max_stock?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  duration?: string;
  image?: string;
  status: 'active' | 'inactive';
  is_featured?: boolean;
  short_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  total_spent: number;
  client_code?: string;
  company_name?: string;
  secondary_phone?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  client_type: 'individual' | 'business';
  credit_limit?: number;
  current_balance?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_fr: string;
  description?: string;
  icon?: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name_en: string;
  name_fr: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// ARTICLES
// ============================================================================

/**
 * Récupérer tous les articles
 */
export async function getArticles(filters?: {
  category?: string;
  status?: 'active' | 'inactive';
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  let query = supabase.from('articles').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un article par ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Créer un article
 */
export async function createArticle(article: Omit<Article, 'created_at' | 'updated_at'>): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un article
 */
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer un article
 */
export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Articles en rupture de stock
 */
export async function getLowStockArticles(threshold?: number): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .lte('stock', threshold || 10)
    .eq('status', 'active')
    .order('stock', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ============================================================================
// SERVICES
// ============================================================================

/**
 * Récupérer tous les services
 */
export async function getServices(filters?: {
  category?: string;
  status?: 'active' | 'inactive';
  featured?: boolean;
  search?: string;
}): Promise<Service[]> {
  let query = supabase.from('services').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.featured !== undefined) {
    query = query.eq('is_featured', filters.featured);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un service par ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Créer un service
 */
export async function createService(service: Omit<Service, 'created_at' | 'updated_at'>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un service
 */
export async function updateService(id: string, updates: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer un service
 */
export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// CLIENTS
// ============================================================================

/**
 * Récupérer tous les clients
 */
export async function getClients(filters?: {
  type?: 'individual' | 'business';
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Client[]> {
  let query = supabase.from('clients').select('*');

  if (filters?.type) {
    query = query.eq('client_type', filters.type);
  }
  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un client par ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Créer un client
 */
export async function createClient(client: Omit<Client, 'created_at' | 'updated_at' | 'total_spent'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...client, total_spent: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un client
 */
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer un client
 */
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Rechercher un client par téléphone ou email
 */
export async function findClientByContact(phone?: string, email?: string): Promise<Client | null> {
  let query = supabase.from('clients').select('*');
  
  if (phone && email) {
    query = query.or(`phone.eq.${phone},email.eq.${email}`);
  } else if (phone) {
    query = query.eq('phone', phone);
  } else if (email) {
    query = query.eq('email', email);
  } else {
    return null;
  }

  const { data, error } = await query.limit(1).single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Récupérer toutes les catégories
 */
export async function getCategories(activeOnly = false): Promise<Category[]> {
  let query = supabase.from('categories').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une catégorie par ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Créer une catégorie
 */
export async function createCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une catégorie
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer une catégorie
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// SUB-CATEGORIES
// ============================================================================

/**
 * Récupérer les sous-catégories d'une catégorie
 */
export async function getSubCategories(categoryId?: string, activeOnly = false): Promise<SubCategory[]> {
  let query = supabase.from('sub_categories').select('*');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Créer une sous-catégorie
 */
export async function createSubCategory(subCategory: Omit<SubCategory, 'created_at' | 'updated_at'>): Promise<SubCategory> {
  const { data, error } = await supabase
    .from('sub_categories')
    .insert(subCategory)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une sous-catégorie
 */
export async function updateSubCategory(id: string, updates: Partial<SubCategory>): Promise<SubCategory> {
  const { data, error } = await supabase
    .from('sub_categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer une sous-catégorie
 */
export async function deleteSubCategory(id: string): Promise<void> {
  const { error } = await supabase.from('sub_categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// CATALOGUE COMPLET
// ============================================================================

/**
 * Récupérer tout le catalogue (articles + services)
 */
export async function getFullCatalog(): Promise<{
  articles: Article[];
  services: Service[];
  categories: Category[];
}> {
  const [articles, services, categories] = await Promise.all([
    getArticles({ status: 'active' }),
    getServices({ status: 'active' }),
    getCategories(true)
  ]);
  
  return { articles, services, categories };
}

/**
 * Statistiques du catalogue
 */
export async function getCatalogStats(): Promise<{
  totalArticles: number;
  activeArticles: number;
  lowStockArticles: number;
  totalServices: number;
  activeServices: number;
  totalClients: number;
  totalCategories: number;
}> {
  const [
    { count: totalArticles },
    { count: activeArticles },
    { count: lowStockArticles },
    { count: totalServices },
    { count: activeServices },
    { count: totalClients },
    { count: totalCategories }
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).lte('stock', 10).eq('status', 'active'),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ]);

  return {
    totalArticles: totalArticles || 0,
    activeArticles: activeArticles || 0,
    lowStockArticles: lowStockArticles || 0,
    totalServices: totalServices || 0,
    activeServices: activeServices || 0,
    totalClients: totalClients || 0,
    totalCategories: totalCategories || 0
  };
}
