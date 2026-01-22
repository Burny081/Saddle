// API pour les fonctionnalités Commerciales
import { supabase } from './supabaseClient';

// Types
export interface Quote {
  id: string;
  quote_number: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  store_id: string;
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  validity_date: string;
  notes?: string;
  created_by: string;
  converted_to_sale_id?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total: number;
}

export interface Prospect {
  id: string;
  store_id: string;
  company_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost';
  estimated_value?: number;
  notes?: string;
  assigned_to?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesTarget {
  id: string;
  user_id: string;
  store_id: string;
  target_amount: number;
  achieved_amount: number;
  target_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  user_id: string;
  sale_id: string;
  store_id: string;
  sale_amount: number;
  commission_rate: number;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  paid_date?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  store_id?: string;
  related_type?: string;
  related_id?: string;
  title: string;
  description?: string;
  reminder_date: string;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  user_id: string;
  store_id: string;
  interaction_type: 'call' | 'email' | 'meeting' | 'visit' | 'other';
  subject: string;
  notes?: string;
  outcome?: string;
  next_action?: string;
  interaction_date: string;
  created_at: string;
}

export interface Discount {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_purchase?: number;
  max_uses?: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// Devis
export async function getQuotes(storeId?: string, status?: string): Promise<Quote[]> {
  let query = supabase.from('quotes').select('*').order('created_at', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
  const { data, error } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId);
  if (error) throw error;
  return data || [];
}

export async function createQuote(quote: Partial<Quote>): Promise<Quote> {
  const { data, error } = await supabase.from('quotes').insert(quote).select().single();
  if (error) throw error;
  return data;
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  const { data, error } = await supabase.from('quotes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
}

export async function addQuoteItem(item: Partial<QuoteItem>): Promise<QuoteItem> {
  const { data, error } = await supabase.from('quote_items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateQuoteItem(id: string, updates: Partial<QuoteItem>): Promise<QuoteItem> {
  const { data, error } = await supabase.from('quote_items').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQuoteItem(id: string): Promise<void> {
  const { error } = await supabase.from('quote_items').delete().eq('id', id);
  if (error) throw error;
}

export async function convertQuoteToSale(quoteId: string): Promise<string> {
  // Cette fonction serait implémentée côté serveur pour créer une vente à partir d'un devis
  const { data, error } = await supabase.rpc('convert_quote_to_sale', { quote_id: quoteId });
  if (error) throw error;
  return data;
}

// Prospects
export async function getProspects(storeId?: string, status?: string): Promise<Prospect[]> {
  let query = supabase.from('prospects').select('*').order('created_at', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const { data, error } = await supabase.from('prospects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProspect(prospect: Partial<Prospect>): Promise<Prospect> {
  const { data, error } = await supabase.from('prospects').insert(prospect).select().single();
  if (error) throw error;
  return data;
}

export async function updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
  const { data, error } = await supabase.from('prospects').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProspect(id: string): Promise<void> {
  const { error } = await supabase.from('prospects').delete().eq('id', id);
  if (error) throw error;
}

export async function convertProspectToClient(prospectId: string): Promise<string> {
  const { data, error } = await supabase.rpc('convert_prospect_to_client', { prospect_id: prospectId });
  if (error) throw error;
  return data;
}

// Objectifs de vente
export async function getSalesTargets(userId?: string, storeId?: string): Promise<SalesTarget[]> {
  let query = supabase.from('sales_targets').select('*').order('period_start', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  if (storeId) query = query.eq('store_id', storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createSalesTarget(target: Partial<SalesTarget>): Promise<SalesTarget> {
  const { data, error } = await supabase.from('sales_targets').insert(target).select().single();
  if (error) throw error;
  return data;
}

export async function updateSalesTarget(id: string, updates: Partial<SalesTarget>): Promise<SalesTarget> {
  const { data, error } = await supabase.from('sales_targets').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSalesTarget(id: string): Promise<void> {
  const { error } = await supabase.from('sales_targets').delete().eq('id', id);
  if (error) throw error;
}

// Commissions
export async function getCommissions(userId?: string, status?: string): Promise<Commission[]> {
  let query = supabase.from('commissions').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createCommission(commission: Partial<Commission>): Promise<Commission> {
  const { data, error } = await supabase.from('commissions').insert(commission).select().single();
  if (error) throw error;
  return data;
}

export async function updateCommissionStatus(id: string, status: 'pending' | 'approved' | 'paid'): Promise<Commission> {
  const updates: Partial<Commission> = { status };
  if (status === 'paid') updates.paid_date = new Date().toISOString();
  const { data, error } = await supabase.from('commissions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Rappels
export async function getReminders(userId?: string, completed?: boolean): Promise<Reminder[]> {
  let query = supabase.from('reminders').select('*').order('reminder_date', { ascending: true });
  if (userId) query = query.eq('user_id', userId);
  if (completed !== undefined) query = query.eq('is_completed', completed);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createReminder(reminder: Partial<Reminder>): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').insert(reminder).select().single();
  if (error) throw error;
  return data;
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function completeReminder(id: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
}

// Interactions client
export async function getClientInteractions(clientId?: string, storeId?: string): Promise<ClientInteraction[]> {
  let query = supabase.from('client_interactions').select('*').order('interaction_date', { ascending: false });
  if (clientId) query = query.eq('client_id', clientId);
  if (storeId) query = query.eq('store_id', storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createClientInteraction(interaction: Partial<ClientInteraction>): Promise<ClientInteraction> {
  const { data, error } = await supabase.from('client_interactions').insert(interaction).select().single();
  if (error) throw error;
  return data;
}

// Remises / Codes promo
export async function getDiscounts(storeId?: string, active?: boolean): Promise<Discount[]> {
  let query = supabase.from('discounts').select('*').order('created_at', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (active !== undefined) query = query.eq('is_active', active);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getDiscountByCode(code: string): Promise<Discount | null> {
  const { data, error } = await supabase.from('discounts').select('*').eq('code', code).eq('is_active', true).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createDiscount(discount: Partial<Discount>): Promise<Discount> {
  const { data, error } = await supabase.from('discounts').insert(discount).select().single();
  if (error) throw error;
  return data;
}

export async function updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
  const { data, error } = await supabase.from('discounts').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDiscount(id: string): Promise<void> {
  const { error } = await supabase.from('discounts').delete().eq('id', id);
  if (error) throw error;
}

// Rapports commerciaux
export async function getSalesPerformance(storeId: string, startDate: string, endDate: string) {
  const [quotes, prospects, targets] = await Promise.all([
    supabase
      .from('quotes')
      .select('status, total')
      .eq('store_id', storeId)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    supabase
      .from('prospects')
      .select('status, estimated_value')
      .eq('store_id', storeId)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    supabase
      .from('sales_targets')
      .select('target_amount, achieved_amount')
      .eq('store_id', storeId)
      .gte('period_start', startDate)
      .lte('period_end', endDate)
  ]);

  const totalQuotes = quotes.data?.length || 0;
  const acceptedQuotes = quotes.data?.filter(q => q.status === 'accepted' || q.status === 'converted').length || 0;
  const totalQuoteValue = quotes.data?.reduce((sum, q) => sum + (q.total || 0), 0) || 0;

  const totalProspects = prospects.data?.length || 0;
  const convertedProspects = prospects.data?.filter(p => p.status === 'converted').length || 0;
  const pipelineValue = prospects.data?.filter(p => !['converted', 'lost'].includes(p.status)).reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0;

  const targetAmount = targets.data?.reduce((sum, t) => sum + (t.target_amount || 0), 0) || 0;
  const achievedAmount = targets.data?.reduce((sum, t) => sum + (t.achieved_amount || 0), 0) || 0;

  return {
    quotes: {
      total: totalQuotes,
      accepted: acceptedQuotes,
      conversionRate: totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0,
      totalValue: totalQuoteValue
    },
    prospects: {
      total: totalProspects,
      converted: convertedProspects,
      conversionRate: totalProspects > 0 ? (convertedProspects / totalProspects) * 100 : 0,
      pipelineValue
    },
    targets: {
      target: targetAmount,
      achieved: achievedAmount,
      achievementRate: targetAmount > 0 ? (achievedAmount / targetAmount) * 100 : 0
    }
  };
}
