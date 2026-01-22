/**
 * API Alertes & Visiteurs - Supabase
 * Gestion des alertes système et analytics visiteurs
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Alert {
  id: string;
  type: 'stock' | 'sale' | 'payment' | 'system' | 'reminder';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  read: boolean;
  title?: string;
  action_url?: string;
  target_roles?: string[];
  read_by?: string;
  read_at?: string;
  expires_at?: string;
  created_at?: string;
}

export interface Visitor {
  id: string;
  ip?: string;
  location?: string;
  date?: string;
  time?: string;
  user_agent?: string;
  page?: string;
  device?: 'Desktop' | 'Mobile' | 'Tablet' | 'Other';
  session_id?: string;
  city?: string;
  region?: string;
  country?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  page_title?: string;
  visited_at?: string;
}

// ============================================================================
// ALERTES
// ============================================================================

/**
 * Récupérer toutes les alertes
 */
export async function getAlerts(filters?: {
  type?: Alert['type'];
  severity?: Alert['severity'];
  read?: boolean;
  limit?: number;
}): Promise<Alert[]> {
  let query = supabase.from('alerts').select('*');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('date', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Récupérer les alertes non lues
 */
export async function getUnreadAlerts(): Promise<Alert[]> {
  return getAlerts({ read: false });
}

/**
 * Compter les alertes non lues
 */
export async function getUnreadAlertCount(): Promise<number> {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);
  if (error) throw error;
  return count || 0;
}

/**
 * Créer une alerte
 */
export async function createAlert(alert: Omit<Alert, 'created_at'>): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      ...alert,
      date: alert.date || new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Marquer une alerte comme lue
 */
export async function markAlertAsRead(id: string, userId?: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({
      read: true,
      read_by: userId,
      read_at: new Date().toISOString()
    })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Marquer toutes les alertes comme lues
 */
export async function markAllAlertsAsRead(userId?: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({
      read: true,
      read_by: userId,
      read_at: new Date().toISOString()
    })
    .eq('read', false);
  if (error) throw error;
}

/**
 * Supprimer une alerte
 */
export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Supprimer toutes les alertes lues
 */
export async function clearReadAlerts(): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('read', true);
  if (error) throw error;
}

/**
 * Créer une alerte de stock bas
 */
export async function createLowStockAlert(
  articleId: string,
  articleName: string,
  currentStock: number,
  minStock: number
): Promise<Alert> {
  return createAlert({
    id: `alert-stock-${articleId}-${Date.now()}`,
    type: 'stock',
    severity: currentStock === 0 ? 'critical' : 'high',
    message: `Stock bas: ${articleName} - ${currentStock}/${minStock} unités`,
    title: 'Alerte Stock',
    date: new Date().toISOString(),
    read: false,
    target_roles: ['superadmin', 'admin', 'manager']
  });
}

/**
 * Créer une alerte de vente
 */
export async function createSaleAlert(
  saleId: string,
  invoiceNumber: string,
  amount: number,
  clientName: string
): Promise<Alert> {
  return createAlert({
    id: `alert-sale-${saleId}`,
    type: 'sale',
    severity: 'info',
    message: `Nouvelle vente: ${invoiceNumber} - ${amount.toLocaleString()} FCFA (${clientName})`,
    title: 'Nouvelle Vente',
    date: new Date().toISOString(),
    read: false,
    action_url: `/sales/${saleId}`
  });
}

// ============================================================================
// VISITEURS
// ============================================================================

/**
 * Récupérer les visiteurs
 */
export async function getVisitors(filters?: {
  startDate?: string;
  endDate?: string;
  device?: Visitor['device'];
  page?: string;
  limit?: number;
}): Promise<Visitor[]> {
  let query = supabase.from('visitors').select('*');

  if (filters?.startDate) {
    query = query.gte('visited_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('visited_at', filters.endDate);
  }
  if (filters?.device) {
    query = query.eq('device', filters.device);
  }
  if (filters?.page) {
    query = query.eq('page', filters.page);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('visited_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Enregistrer une visite
 */
export async function logVisit(visitor: Omit<Visitor, 'visited_at'>): Promise<Visitor> {
  const { data, error } = await supabase
    .from('visitors')
    .insert({
      ...visitor,
      visited_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Statistiques visiteurs
 */
export async function getVisitorStats(startDate?: string, endDate?: string): Promise<{
  totalVisitors: number;
  uniqueIPs: number;
  byDevice: Record<string, number>;
  byPage: Record<string, number>;
  byCountry: Record<string, number>;
}> {
  let query = supabase.from('visitors').select('*');

  if (startDate) {
    query = query.gte('visited_at', startDate);
  }
  if (endDate) {
    query = query.lte('visited_at', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const visitors = data || [];
  const uniqueIPs = new Set(visitors.map(v => v.ip).filter(Boolean));

  const byDevice: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  visitors.forEach(v => {
    if (v.device) {
      byDevice[v.device] = (byDevice[v.device] || 0) + 1;
    }
    if (v.page) {
      byPage[v.page] = (byPage[v.page] || 0) + 1;
    }
    if (v.country) {
      byCountry[v.country] = (byCountry[v.country] || 0) + 1;
    }
  });

  return {
    totalVisitors: visitors.length,
    uniqueIPs: uniqueIPs.size,
    byDevice,
    byPage,
    byCountry
  };
}

/**
 * Visiteurs par jour
 */
export async function getVisitorsByDay(startDate: string, endDate: string): Promise<{
  date: string;
  count: number;
}[]> {
  const { data, error } = await supabase
    .from('visitors')
    .select('visited_at')
    .gte('visited_at', startDate)
    .lte('visited_at', endDate)
    .order('visited_at', { ascending: true });

  if (error) throw error;

  const byDay: Record<string, number> = {};
  (data || []).forEach(v => {
    if (v.visited_at) {
      const day = v.visited_at.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    }
  });

  return Object.entries(byDay).map(([date, count]) => ({ date, count }));
}

/**
 * Pages les plus visitées
 */
export async function getTopPages(limit = 10): Promise<{
  page: string;
  count: number;
}[]> {
  const { data, error } = await supabase
    .from('visitors')
    .select('page');

  if (error) throw error;

  const byPage: Record<string, number> = {};
  (data || []).forEach(v => {
    if (v.page) {
      byPage[v.page] = (byPage[v.page] || 0) + 1;
    }
  });

  return Object.entries(byPage)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
