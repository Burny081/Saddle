import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanySettings {
  id: string;
  name: string;
  short_name: string;
  slogan: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  website: string;
  logo_url?: string;
  tax_rate: number;
  currency: string;
  currency_symbol: string;
  locale: string;
  rccm?: string;
  niu?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_swift?: string;
  bank_account_name?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppSettings {
  id: string;
  chat_enabled: boolean;
  chat_polling_interval: number;
  stock_alert_threshold: number;
  low_stock_notification: boolean;
  new_sale_notification: boolean;
  daily_report_enabled: boolean;
  report_email?: string;
  session_timeout: number;
  max_login_attempts: number;
}

export interface NotificationSettings {
  id: string;
  store_id?: string;
  low_stock: boolean;
  new_sale: boolean;
  new_client: boolean;
  daily_report: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface EmailSettings {
  id: string;
  store_id?: string;
  smtp_server: string;
  smtp_port: string;
  sender_email?: string;
  sender_name?: string;
  enable_ssl: boolean;
  smtp_username?: string;
  smtp_password?: string;
}

export interface DocumentSettings {
  id: string;
  store_id?: string;
  invoice_prefix: string;
  quote_prefix: string;
  delivery_prefix: string;
  auto_numbering: boolean;
  show_logo: boolean;
  show_bank_details: boolean;
  footer_text: string;
  payment_terms: string;
  bank_name?: string;
  bank_account?: string;
  bank_iban?: string;
  bank_swift?: string;
}

export interface StockSettings {
  id: string;
  store_id?: string;
  low_stock_threshold: number;
  enable_auto_reorder: boolean;
  default_category: string;
  reorder_quantity: number;
  reorder_lead_days: number;
  track_serial_numbers: boolean;
  enable_batch_tracking: boolean;
}

export interface SecuritySettings {
  id: string;
  session_timeout: number;
  require_strong_password: boolean;
  two_factor_auth: boolean;
  max_login_attempts: number;
  password_expiry_days: number;
  lockout_duration_minutes: number;
  ip_whitelist?: string[];
}

export interface StoreSettings {
  id: string;
  store_id: string;
  tax_rate?: number;
  currency?: string;
  locale?: string;
  invoice_counter: number;
  quote_counter: number;
  low_stock_threshold?: number;
  open_time?: string;
  close_time?: string;
  working_days?: string;
}

// NEW: Sales & POS Settings (matches sales_settings table in sps.sql)
export interface SalesSettings {
  id: string;
  store_id?: string;
  enable_pos: boolean;
  print_receipt: boolean;
  receipt_size: '58mm' | '80mm' | 'A4';
  default_payment_method: 'cash' | 'card' | 'mobile' | 'transfer';
  enable_discounts: boolean;
  max_discount_percent: number;
  require_manager_approval: boolean;
  approval_threshold: number;
  enable_layaway: boolean;
  layaway_min_deposit: number;
  enable_multi_payment: boolean;
  enable_tips: boolean;
  show_price_with_tax: boolean;
  require_customer: boolean;
  allow_negative_stock: boolean;
  auto_print_kitchen_ticket: boolean;
  round_to_nearest: number;
  created_at?: string;
  updated_at?: string;
}

// NEW: Regional Settings (matches regional_settings table in sps.sql)
export interface RegionalSettings {
  id: string;
  store_id?: string;
  timezone: string;
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  time_format: '24h' | '12h';
  number_format: 'fr-FR' | 'en-US' | 'de-DE';
  week_starts_on: 'monday' | 'sunday' | 'saturday';
  fiscal_year_start: string;
  first_day_of_week: number;
  decimal_separator: string;
  thousands_separator: string;
  created_at?: string;
  updated_at?: string;
}

// NEW: Integration Settings (matches integration_settings table in sps.sql)
export interface IntegrationSettings {
  id: string;
  store_id?: string;
  enable_api: boolean;
  api_key?: string;
  webhook_url?: string;
  api_rate_limit: number;
  api_version: string;
  enable_whatsapp: boolean;
  whatsapp_number?: string;
  whatsapp_api_key?: string;
  whatsapp_template_namespace?: string;
  enable_sms: boolean;
  sms_provider?: 'twilio' | 'nexmo' | 'africastalking' | 'orange';
  sms_api_key?: string;
  sms_sender_id?: string;
  enable_payment_gateway: boolean;
  payment_gateway?: 'stripe' | 'paypal' | 'momo' | 'om' | 'flutterwave';
  payment_gateway_public_key?: string;
  payment_gateway_secret_key?: string;
  payment_gateway_webhook_secret?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// COMPANY SETTINGS
// ============================================================================

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 'default')
    .single();
  
  if (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
  return data;
}

export async function updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings | null> {
  const { data, error } = await supabase
    .from('company_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating company settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// APP SETTINGS
// ============================================================================

export async function getAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'default')
    .single();
  
  if (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
  return data;
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating app settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export async function getNotificationSettings(storeId?: string): Promise<NotificationSettings | null> {
  const query = supabase.from('notification_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching notification settings:', error);
    return null;
  }
  return data;
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>, storeId?: string): Promise<NotificationSettings | null> {
  const query = supabase.from('notification_settings');
  
  if (storeId) {
    const { data, error } = await query
      .upsert({ ...settings, store_id: storeId, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating notification settings:', error);
      return null;
    }
    return data;
  }
  
  const { data, error } = await query
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating notification settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// EMAIL SETTINGS
// ============================================================================

export async function getEmailSettings(storeId?: string): Promise<EmailSettings | null> {
  const query = supabase.from('email_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
  return data;
}

export async function updateEmailSettings(settings: Partial<EmailSettings>, storeId?: string): Promise<EmailSettings | null> {
  const query = supabase.from('email_settings');
  
  if (storeId) {
    const { data, error } = await query
      .upsert({ ...settings, store_id: storeId, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating email settings:', error);
      return null;
    }
    return data;
  }
  
  const { data, error } = await query
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating email settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// DOCUMENT SETTINGS
// ============================================================================

export async function getDocumentSettings(storeId?: string): Promise<DocumentSettings | null> {
  const query = supabase.from('document_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching document settings:', error);
    return null;
  }
  return data;
}

export async function updateDocumentSettings(settings: Partial<DocumentSettings>, storeId?: string): Promise<DocumentSettings | null> {
  const query = supabase.from('document_settings');
  
  if (storeId) {
    const { data, error } = await query
      .upsert({ ...settings, store_id: storeId, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating document settings:', error);
      return null;
    }
    return data;
  }
  
  const { data, error } = await query
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating document settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// STOCK SETTINGS
// ============================================================================

export async function getStockSettings(storeId?: string): Promise<StockSettings | null> {
  const query = supabase.from('stock_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching stock settings:', error);
    return null;
  }
  return data;
}

export async function updateStockSettings(settings: Partial<StockSettings>, storeId?: string): Promise<StockSettings | null> {
  const query = supabase.from('stock_settings');
  
  if (storeId) {
    const { data, error } = await query
      .upsert({ ...settings, store_id: storeId, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating stock settings:', error);
      return null;
    }
    return data;
  }
  
  const { data, error } = await query
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating stock settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// SECURITY SETTINGS
// ============================================================================

export async function getSecuritySettings(): Promise<SecuritySettings | null> {
  const { data, error } = await supabase
    .from('security_settings')
    .select('*')
    .eq('id', 'default')
    .single();
  
  if (error) {
    console.error('Error fetching security settings:', error);
    return null;
  }
  return data;
}

export async function updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings | null> {
  const { data, error } = await supabase
    .from('security_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating security settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// STORE SETTINGS
// ============================================================================

export async function getStoreSettings(storeId: string): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single();
  
  if (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
  return data;
}

export async function updateStoreSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ ...settings, store_id: storeId, updated_at: new Date().toISOString() })
    .eq('store_id', storeId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating store settings:', error);
    return null;
  }
  return data;
}

export async function getAllStoreSettings(): Promise<StoreSettings[]> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .order('store_id');
  
  if (error) {
    console.error('Error fetching all store settings:', error);
    return [];
  }
  return data || [];
}

// ============================================================================
// ALL SETTINGS (Bulk fetch for SettingsView)
// ============================================================================

export interface AllSettings {
  company: CompanySettings | null;
  app: AppSettings | null;
  notification: NotificationSettings | null;
  email: EmailSettings | null;
  document: DocumentSettings | null;
  stock: StockSettings | null;
  security: SecuritySettings | null;
  sales: SalesSettings | null;
  regional: RegionalSettings | null;
  integration: IntegrationSettings | null;
}

export async function getAllSettings(): Promise<AllSettings> {
  const [company, app, notification, email, document, stock, security, sales, regional, integration] = await Promise.all([
    getCompanySettings(),
    getAppSettings(),
    getNotificationSettings(),
    getEmailSettings(),
    getDocumentSettings(),
    getStockSettings(),
    getSecuritySettings(),
    getSalesSettings(),
    getRegionalSettings(),
    getIntegrationSettings()
  ]);
  
  return { company, app, notification, email, document, stock, security, sales, regional, integration };
}

// ============================================================================
// SALES SETTINGS
// ============================================================================

export async function getSalesSettings(storeId?: string): Promise<SalesSettings | null> {
  const query = supabase.from('sales_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching sales settings:', error);
    return null;
  }
  return data;
}

export async function updateSalesSettings(settings: Partial<SalesSettings>, storeId?: string): Promise<SalesSettings | null> {
  const updateData = { ...settings, updated_at: new Date().toISOString() };
  
  let query;
  if (storeId) {
    query = supabase
      .from('sales_settings')
      .upsert({ ...updateData, store_id: storeId })
      .eq('store_id', storeId);
  } else {
    query = supabase
      .from('sales_settings')
      .update(updateData)
      .eq('id', 'default');
  }
  
  const { data, error } = await query.select().single();
  
  if (error) {
    console.error('Error updating sales settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// REGIONAL SETTINGS
// ============================================================================

export async function getRegionalSettings(storeId?: string): Promise<RegionalSettings | null> {
  const query = supabase.from('regional_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching regional settings:', error);
    return null;
  }
  return data;
}

export async function updateRegionalSettings(settings: Partial<RegionalSettings>, storeId?: string): Promise<RegionalSettings | null> {
  const updateData = { ...settings, updated_at: new Date().toISOString() };
  
  let query;
  if (storeId) {
    query = supabase
      .from('regional_settings')
      .upsert({ ...updateData, store_id: storeId })
      .eq('store_id', storeId);
  } else {
    query = supabase
      .from('regional_settings')
      .update(updateData)
      .eq('id', 'default');
  }
  
  const { data, error } = await query.select().single();
  
  if (error) {
    console.error('Error updating regional settings:', error);
    return null;
  }
  return data;
}

// ============================================================================
// INTEGRATION SETTINGS
// ============================================================================

export async function getIntegrationSettings(storeId?: string): Promise<IntegrationSettings | null> {
  const query = supabase.from('integration_settings').select('*');
  
  if (storeId) {
    query.eq('store_id', storeId);
  } else {
    query.eq('id', 'default');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching integration settings:', error);
    return null;
  }
  return data;
}

export async function updateIntegrationSettings(settings: Partial<IntegrationSettings>, storeId?: string): Promise<IntegrationSettings | null> {
  const updateData = { ...settings, updated_at: new Date().toISOString() };
  
  let query;
  if (storeId) {
    query = supabase
      .from('integration_settings')
      .upsert({ ...updateData, store_id: storeId })
      .eq('store_id', storeId);
  } else {
    query = supabase
      .from('integration_settings')
      .update(updateData)
      .eq('id', 'default');
  }
  
  const { data, error } = await query.select().single();
  
  if (error) {
    console.error('Error updating integration settings:', error);
    return null;
  }
  return data;
}
