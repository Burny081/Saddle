// =============================================================================
// CENTRALIZED DATABASE TYPES - Matches sps.sql schema
// =============================================================================

// ===== CORE ENTITIES =====

export interface Profile {
  id: string;
  name: string;                                   // Matches AuthContext.tsx and sps.sql
  email: string;
  role: 'superadmin' | 'admin' | 'commercial' | 'secretaire' | 'manager' | 'comptable' | 'client';  // Matches AuthContext.tsx and sps.sql
  store_id?: string;                              // Matches sps.sql
  avatar?: string;                                // Matches AuthContext.tsx (NOT avatar_url)
  phone?: string;
  address?: string;                               // Matches sps.sql
  is_active: boolean;
  last_login?: string;                            // Matches sps.sql
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  short_name?: string;                            // Matches sps.sql
  country: string;                                // Matches sps.sql
  city: string;                                   // Matches sps.sql
  address?: string;
  postal_code?: string;                           // Matches sps.sql
  phone?: string;
  alternate_phone?: string;                       // Matches sps.sql
  email?: string;
  website?: string;                               // Matches sps.sql
  manager?: string;                               // Matches sps.sql
  manager_email?: string;                         // Matches sps.sql
  manager_phone?: string;                         // Matches sps.sql
  working_days?: string;                          // Matches sps.sql
  open_time?: string;                             // Matches sps.sql
  close_time?: string;                            // Matches sps.sql
  years_of_expertise?: number;                    // Matches sps.sql
  founded_year?: number;                          // Matches sps.sql
  image?: string;                                 // Matches sps.sql (NOT logo_url)
  is_headquarters?: boolean;                      // Matches sps.sql
  is_active: boolean;
  tax_id?: string;                                // Matches sps.sql
  registration_number?: string;                   // Matches sps.sql
  latitude?: number;                              // Matches sps.sql coordinates.lat
  longitude?: number;                             // Matches sps.sql coordinates.lng
  settings?: StoreSettings;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  store_id: string;
  currency: string;
  tax_rate: number;
  low_stock_threshold: number;
  enable_notifications: boolean;
  enable_loyalty_program: boolean;
  points_per_currency: number;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ===== CATALOG =====

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  brand?: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  tax_rate: number;
  image_url?: string;
  barcode?: string;
  min_stock: number;
  max_stock?: number;
  current_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  subcategory?: SubCategory;
}

export interface Service {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  duration_minutes?: number;
  tax_rate: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
}

// ===== CLIENTS =====

export interface Client {
  id: string;
  store_id: string;
  code?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  loyalty_points: number;
  total_purchases: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== SALES =====

export interface Sale {
  id: string;
  store_id: string;
  sale_number: string;
  client_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'mobile' | 'credit' | 'mixed';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  items?: SaleItem[];
  payments?: Payment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  article_id?: string;
  service_id?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  created_at: string;
  // Relations
  article?: Article;
  service?: Service;
}

export interface Payment {
  id: string;
  sale_id: string;
  invoice_id?: string;
  amount: number;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

// ===== STOCK =====

export interface StockMovement {
  id: string;
  store_id: string;
  article_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  // Relations
  article?: Article;
}

export interface StoreStock {
  id: string;
  store_id: string;
  article_id: string;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  reorder_point?: number;
  last_restock_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  article?: Article;
  store?: Store;
}

export interface StockTransfer {
  id: string;
  from_store_id: string;
  to_store_id: string;
  article_id: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  created_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// ===== SUPPLIERS =====

export interface Supplier {
  id: string;
  store_id: string;
  code: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  store_id: string;
  order_number: string;
  supplier_id: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total: number;
  expected_date?: string;
  received_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  article_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total: number;
  created_at: string;
  // Relations
  article?: Article;
}

// ===== ALERTS & NOTIFICATIONS =====

export interface Alert {
  id: string;
  store_id: string;
  type: 'stock_low' | 'stock_out' | 'sale' | 'payment_due' | 'system' | 'quota' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ===== VISITORS & ANALYTICS =====

export interface Visitor {
  id: string;
  store_id?: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  page_views: number;
  duration_seconds: number;
  is_bounce: boolean;
  first_visit_at: string;
  last_activity_at: string;
  created_at: string;
}

export interface PageView {
  id: string;
  visitor_id: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  time_on_page?: number;
  created_at: string;
}

// ===== COMMERCIAL =====

export interface Quote {
  id: string;
  store_id: string;
  quote_number: string;
  client_id?: string;
  prospect_id?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  valid_until?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  terms_conditions?: string;
  created_by?: string;
  converted_to_sale_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  prospect?: Prospect;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  article_id?: string;
  service_id?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  created_at: string;
}

export interface Prospect {
  id: string;
  store_id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  estimated_value?: number;
  notes?: string;
  assigned_to?: string;
  converted_to_client_id?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesTarget {
  id: string;
  store_id: string;
  user_id?: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  target_amount: number;
  target_quantity?: number;
  achieved_amount: number;
  achieved_quantity: number;
  category_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  store_id: string;
  user_id: string;
  sale_id?: string;
  commission_type: 'percentage' | 'fixed' | 'tiered';
  base_amount: number;
  commission_rate?: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// ===== ACCOUNTING =====

export interface ChartOfAccount {
  id: string;
  store_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingEntry {
  id: string;
  store_id: string;
  entry_number: string;
  entry_date: string;
  description?: string;
  account_id: string;
  debit: number;
  credit: number;
  reference_type?: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  account?: ChartOfAccount;
}

export interface CashJournal {
  id: string;
  store_id: string;
  transaction_date: string;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  description?: string;
  amount: number;
  payment_method: string;
  reference_type?: string;
  reference_id?: string;
  created_by?: string;
  balance_after?: number;
  created_at: string;
}

export interface TaxRecord {
  id: string;
  store_id: string;
  period_start: string;
  period_end: string;
  tax_type: string;
  base_amount: number;
  tax_amount: number;
  status: 'pending' | 'declared' | 'paid';
  declaration_date?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== CRM =====

export interface Reminder {
  id: string;
  store_id: string;
  user_id?: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_type?: string;
  reference_type?: string;
  reference_id?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInteraction {
  id: string;
  store_id: string;
  client_id?: string;
  prospect_id?: string;
  user_id?: string;
  interaction_type: 'call' | 'email' | 'meeting' | 'visit' | 'support' | 'social';
  subject?: string;
  notes?: string;
  outcome?: string;
  follow_up_date?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface Discount {
  id: string;
  store_id: string;
  code?: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_to?: string;
  applicable_ids?: string[];
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ===== SUPPORT =====

export interface Task {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  store_id: string;
  name: string;
  type: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  reference_type?: string;
  reference_id?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  store_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  category?: string;
  assigned_to?: string;
  created_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// ===== CHAT =====

export interface ChatConversation {
  id: string;
  store_id: string;
  client_id?: string;
  visitor_id?: string;
  status: 'active' | 'closed' | 'pending';
  assigned_to?: string;
  subject?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_type: 'staff' | 'client' | 'visitor' | 'system';
  message: string;
  attachments?: string[];
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ===== AUDIT =====

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// ===== NAVIGATION (for UI) =====

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: NavItem[];
  badge?: number;
  isActive?: boolean;
}

// ===== POINT OF SALE =====

export interface PointOfSale {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
  isActive: boolean;
}

// ===== HELPER TYPES =====

export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// ===== STATISTICS TYPES =====

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageSale: number;
  topProducts: { id: string; name: string; quantity: number; total: number }[];
  salesByPaymentMethod: { method: string; count: number; total: number }[];
  salesByPeriod: { period: string; total: number; count: number }[];
}

export interface StockStats {
  totalArticles: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: StockMovement[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalLoyaltyPoints: number;
  topClients: { client: Client; totalPurchases: number }[];
}

export interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  visitorsByDevice: { device: string; count: number }[];
  visitorsByCountry: { country: string; count: number }[];
  visitorsByHour: { hour: number; count: number }[];
}

// ===== FORM TYPES =====

export interface ArticleFormData {
  code?: string;
  name: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  brand?: string;
  unit?: string;
  purchase_price: number;
  selling_price: number;
  tax_rate?: number;
  image_url?: string;
  barcode?: string;
  min_stock?: number;
  max_stock?: number;
  current_stock?: number;
  is_active?: boolean;
}

export interface ServiceFormData {
  code?: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  duration_minutes?: number;
  tax_rate?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ClientFormData {
  code?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SaleFormData {
  client_id?: string;
  items: {
    article_id?: string;
    service_id?: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
  }[];
  discount_amount?: number;
  payment_method: string;
  notes?: string;
}

export interface SupplierFormData {
  code?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  is_active?: boolean;
}
