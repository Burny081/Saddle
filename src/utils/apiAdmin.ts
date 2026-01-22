import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: string;
  updated_at?: string;
  // Joined data
  assigned_to_name?: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type?: string;
  uploaded_by?: string;
  category?: string;
  description?: string;
  file_size?: number;
  created_at?: string;
  // Joined data
  uploaded_by_name?: string;
}

export interface SupportTicket {
  id: string;
  user_id?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  // Joined data
  user_name?: string;
  user_email?: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  // Joined data
  user_name?: string;
}

// ============================================================================
// TASKS
// ============================================================================

export async function getTasks(options?: {
  assignedTo?: string;
  status?: string;
  dueBefore?: string;
}): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      profiles:assigned_to(full_name)
    `)
    .order('due_date', { ascending: true, nullsFirst: false });
  
  if (options?.assignedTo) query = query.eq('assigned_to', options.assignedTo);
  if (options?.status) query = query.eq('status', options.status);
  if (options?.dueBefore) query = query.lte('due_date', options.dueBefore);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    assigned_to_name: (item.profiles as { full_name?: string })?.full_name
  })) as Task[];
}

export async function createTask(task: {
  title: string;
  description?: string;
  assigned_to?: string;
  status?: string;
  due_date?: string;
  priority?: string;
}): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      status: task.status || 'todo'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return data;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function getDocuments(options?: {
  type?: string;
  category?: string;
  uploadedBy?: string;
}): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select(`
      *,
      profiles:uploaded_by(full_name)
    `)
    .order('created_at', { ascending: false });
  
  if (options?.type) query = query.eq('type', options.type);
  if (options?.category) query = query.eq('category', options.category);
  if (options?.uploadedBy) query = query.eq('uploaded_by', options.uploadedBy);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    uploaded_by_name: (item.profiles as { full_name?: string })?.full_name
  })) as Document[];
}

export async function uploadDocument(doc: {
  name: string;
  url: string;
  type?: string;
  category?: string;
  description?: string;
  file_size?: number;
  uploaded_by?: string;
}): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single();
  
  if (error) {
    console.error('Error uploading document:', error);
    return null;
  }
  return data;
}

export async function deleteDocument(docId: string): Promise<boolean> {
  // First get the document to delete from storage
  const { data: doc } = await supabase
    .from('documents')
    .select('url')
    .eq('id', docId)
    .single();
  
  // Delete from database
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId);
  
  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }
  
  // Try to delete from storage if it's a Supabase URL
  if (doc?.url?.includes('supabase')) {
    try {
      const path = doc.url.split('/storage/v1/object/public/')[1];
      if (path) {
        await supabase.storage.from('documents').remove([path]);
      }
    } catch (e) {
      console.warn('Could not delete file from storage:', e);
    }
  }
  
  return true;
}

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export async function getSupportTickets(options?: {
  userId?: string;
  status?: string;
}): Promise<SupportTicket[]> {
  let query = supabase
    .from('support_tickets')
    .select(`
      *,
      profiles:user_id(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (options?.userId) query = query.eq('user_id', options.userId);
  if (options?.status) query = query.eq('status', options.status);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    user_name: (item.profiles as { full_name?: string })?.full_name,
    user_email: (item.profiles as { email?: string })?.email
  })) as SupportTicket[];
}

export async function createSupportTicket(ticket: {
  user_id?: string;
  subject: string;
  message: string;
  priority?: string;
  category?: string;
}): Promise<SupportTicket | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...ticket,
      status: 'open'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating support ticket:', error);
    return null;
  }
  return data;
}

export async function updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating support ticket:', error);
    return null;
  }
  return data;
}

export async function resolveSupportTicket(ticketId: string, resolvedBy: string): Promise<boolean> {
  const { error } = await supabase
    .from('support_tickets')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);
  
  if (error) {
    console.error('Error resolving support ticket:', error);
    return false;
  }
  return true;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (unreadOnly) query = query.eq('is_read', false);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

export async function createNotification(notification: {
  user_id: string;
  type: string;
  message: string;
  link?: string;
}): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      is_read: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
  return true;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export async function getAuditLogs(options?: {
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_log')
    .select(`
      *,
      profiles:user_id(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 100);
  
  if (options?.userId) query = query.eq('user_id', options.userId);
  if (options?.action) query = query.eq('action', options.action);
  if (options?.entity) query = query.eq('entity', options.entity);
  if (options?.startDate) query = query.gte('created_at', options.startDate);
  if (options?.endDate) query = query.lte('created_at', options.endDate);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    user_name: (item.profiles as { full_name?: string })?.full_name
  })) as AuditLog[];
}

export async function createAuditLog(log: {
  user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}): Promise<AuditLog | null> {
  const { data, error } = await supabase
    .from('audit_log')
    .insert(log)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
  return data;
}

// ============================================================================
// BROADCAST NOTIFICATIONS
// ============================================================================

export async function broadcastNotification(
  userIds: string[],
  notification: { type: string; message: string; link?: string }
): Promise<number> {
  const notifications = userIds.map(user_id => ({
    user_id,
    ...notification,
    is_read: false
  }));
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();
  
  if (error) {
    console.error('Error broadcasting notifications:', error);
    return 0;
  }
  return data?.length || 0;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getAdminDashboardStats(): Promise<{
  openTickets: number;
  pendingTasks: number;
  unreadNotifications: number;
  recentAuditLogs: number;
  totalDocuments: number;
}> {
  const [ticketsRes, tasksRes, docsRes, logsRes] = await Promise.all([
    supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('status', ['todo', 'in_progress']),
    supabase.from('documents').select('id', { count: 'exact' }),
    supabase.from('audit_log').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  ]);
  
  return {
    openTickets: ticketsRes.count || 0,
    pendingTasks: tasksRes.count || 0,
    unreadNotifications: 0, // User-specific, handled separately
    recentAuditLogs: logsRes.count || 0,
    totalDocuments: docsRes.count || 0
  };
}
