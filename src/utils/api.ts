// API pour infos société et secteurs
// À brancher sur Supabase/PostgreSQL

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Export du client Supabase pour utilisation dans d'autres modules
export { supabase } from './supabaseClient';

// Types
type CompanySettings = {
  id?: string;
  name: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  [key: string]: unknown;
};

type Store = {
  id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
};

type FilterObject = Record<string, unknown>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const { data, error } = await getSupabase()
    .from('company_settings')
    .select('*')
    .single();
  if (error) throw error;
  return data as CompanySettings;
}

export async function updateCompanySettings(data: CompanySettings): Promise<boolean> {
  const { error } = await getSupabase()
    .from('company_settings')
    .update(data)
    .eq('id', 'default');
  if (error) throw error;
  return true;
}

export async function getStores(): Promise<Store[]> {
  const { data, error } = await getSupabase()
    .from('stores')
    .select('*');
  if (error) throw error;
  return data as Store[];
}

export async function updateStore(id: string, data: Partial<Store>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('stores')
    .update(data)
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function getAuditLogs() {
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNotifications() {
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTasks() {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getDocuments() {
  const { data, error } = await getSupabase()
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSupportTickets() {
  const { data, error } = await getSupabase()
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUsersByStore(storeId: string, page = 1, pageSize = 50) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('store_id', storeId)
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;
  return data;
}

export async function getSalesByStore(storeId: string, page = 1, pageSize = 50, filters: FilterObject = {}, search = '') {
  let query = getSupabase()
    .from('sales')
    .select('*')
    .eq('store_id', storeId)
    .range((page - 1) * pageSize, page * pageSize - 1);
  // Filtres dynamiques
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query = query.eq(key, value as string);
  });
  // Recherche textuelle
  if (search) query = query.ilike('client_name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProducts(page = 1, pageSize = 50, filters: FilterObject = {}, search = '') {
  let query = getSupabase()
    .from('products')
    .select('*')
    .range((page - 1) * pageSize, page * pageSize - 1);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query = query.eq(key, value as string);
  });
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSalesOptimized(storeId: string, page = 1, pageSize = 50, fields = ['id','amount','created_at'], filters: FilterObject = {}, sort = { key: 'created_at', asc: false }) {
  let query = getSupabase()
    .from('sales')
    .select(fields.join(','))
    .eq('store_id', storeId)
    .order(sort.key, { ascending: sort.asc })
    .range((page - 1) * pageSize, page * pageSize - 1);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query = query.eq(key, value as string);
  });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// À compléter pour la gestion des rôles et la sécurité côté backend
