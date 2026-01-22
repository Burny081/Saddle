/**
 * API Fournisseurs - Supabase
 * Gestion des fournisseurs et commandes fournisseurs
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Supplier {
  id: string;
  code?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  category: 'electrical' | 'automation' | 'solar' | 'cables' | 'general';
  status: 'active' | 'inactive' | 'pending';
  payment_terms?: string;
  notes?: string;
  total_orders: number;
  total_spent: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// FOURNISSEURS CRUD
// ============================================================================

/**
 * Récupérer tous les fournisseurs
 */
export async function getSuppliers(filters?: {
  category?: Supplier['category'];
  status?: Supplier['status'];
  search?: string;
  limit?: number;
}): Promise<Supplier[]> {
  let query = supabase.from('suppliers').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un fournisseur par ID
 */
export async function getSupplierById(id: string): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Récupérer un fournisseur par code
 */
export async function getSupplierByCode(code: string): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('code', code)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Créer un fournisseur
 */
export async function createSupplier(supplier: Omit<Supplier, 'created_at' | 'updated_at' | 'total_orders' | 'total_spent'>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      ...supplier,
      total_orders: 0,
      total_spent: 0
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un fournisseur
 */
export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprimer un fournisseur
 */
export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Changer le statut d'un fournisseur
 */
export async function updateSupplierStatus(id: string, status: Supplier['status']): Promise<Supplier> {
  return updateSupplier(id, { status });
}

/**
 * Générer un code fournisseur unique
 */
export async function generateSupplierCode(prefix = 'FOUR'): Promise<string> {
  const { data } = await supabase
    .from('suppliers')
    .select('code')
    .like('code', `${prefix}-%`)
    .order('code', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0 && data[0].code) {
    const lastNumber = parseInt(data[0].code.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
}

// ============================================================================
// STATISTIQUES FOURNISSEURS
// ============================================================================

/**
 * Statistiques des fournisseurs
 */
export async function getSupplierStats(): Promise<{
  totalSuppliers: number;
  activeSuppliers: number;
  byCategory: Record<string, number>;
  totalSpent: number;
}> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('status, category, total_spent');

  if (error) throw error;

  const suppliers = data || [];
  const byCategory: Record<string, number> = {};

  suppliers.forEach(s => {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  });

  return {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    byCategory,
    totalSpent: suppliers.reduce((sum, s) => sum + (s.total_spent || 0), 0)
  };
}

/**
 * Top fournisseurs par volume d'achat
 */
export async function getTopSuppliers(limit = 10): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('status', 'active')
    .order('total_spent', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fournisseurs par catégorie
 */
export async function getSuppliersByCategory(category: Supplier['category']): Promise<Supplier[]> {
  return getSuppliers({ category, status: 'active' });
}

/**
 * Mettre à jour les totaux d'un fournisseur après une commande
 */
export async function updateSupplierTotals(
  supplierId: string, 
  orderAmount: number
): Promise<Supplier> {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) throw new Error('Fournisseur non trouvé');

  return updateSupplier(supplierId, {
    total_orders: supplier.total_orders + 1,
    total_spent: supplier.total_spent + orderAmount
  });
}
