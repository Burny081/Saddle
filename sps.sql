-- =============================================================================
-- SUPABASE DATABASE SCHEMA
-- Project: Saddle Point Service
-- Purpose: Commercial Management Platform
-- Version: 3.1
-- Last Updated: 2026-01-22
-- Description: Fully synchronized with TypeScript interfaces from the website
-- =============================================================================
--
-- INSTALLATION INSTRUCTIONS:
-- ==========================
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (or create a new one)
-- 3. Go to "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste this entire file
-- 6. Click "Run" to execute
-- 7. After installation, create your first admin user via Authentication
--
-- IMPORTANT NOTES:
-- ================
-- - This script uses IF NOT EXISTS where possible for safe re-runs
-- - All tables have Row Level Security (RLS) enabled
-- - Default data is inserted for settings tables
-- - Run this script in a fresh Supabase project for best results
--
-- =============================================================================

-- =============================================================================
-- SECTION 0: EXTENSIONS & INITIAL SETUP
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For fuzzy text search

-- Set default timezone
SET timezone = 'Africa/Douala';

-- =============================================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- =============================================================================

-- 1.1 EXTENDED USER PROFILES (matches User interface from AuthContext.tsx)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string (matches AuthContext.tsx)
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('superadmin', 'admin', 'commercial', 'secretaire', 'manager', 'comptable', 'client')),
  store_id TEXT,                                  -- Will reference stores table (added later)
  avatar TEXT,                                    -- avatar?: string (matches AuthContext.tsx)
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  last_login_ip INET,                             -- Détection automatique de l'IP
  last_login_location TEXT,                       -- Détection automatique de la localisation (Ville, Région, Pays)
  last_login_country VARCHAR(2),                  -- Code pays ISO (ex: CM, FR)
  timezone VARCHAR(50),                           -- Fuseau horaire détecté (ex: Africa/Douala)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_store_id ON public.profiles(store_id);

-- Migration: Add geolocation columns (safe to run multiple times)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS last_login_location TEXT,
ADD COLUMN IF NOT EXISTS last_login_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean reinstall)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users see only their store" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
  ));

-- 1.2 USER SESSIONS (For tracking active sessions)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address INET,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- SECTION 2: STORES & POINTS OF SALE (Must be created before settings tables)
-- =============================================================================

-- 2.1 STORES (matches StoreInfo interface from StoresView.tsx)
-- NOTE: Created early because many other tables reference stores
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string
  short_name TEXT,                                -- shortName: string
  country TEXT NOT NULL DEFAULT 'Cameroun',       -- country: string
  city TEXT NOT NULL DEFAULT 'Douala',            -- city: string
  address TEXT,                                   -- address: string
  postal_code TEXT,                               -- postalCode: string
  phone TEXT,                                     -- phone: string
  alternate_phone TEXT,                           -- alternatePhone?: string
  email TEXT,                                     -- email: string
  website TEXT,                                   -- website?: string
  manager TEXT,                                   -- manager: string
  manager_email TEXT,                             -- managerEmail?: string
  manager_phone TEXT,                             -- managerPhone?: string
  -- Working hours
  working_days TEXT DEFAULT 'Lun-Sam',            -- workingDays: string
  open_time TEXT DEFAULT '08:00',                 -- openTime: string
  close_time TEXT DEFAULT '18:00',                -- closeTime: string
  -- Additional info
  years_of_expertise INTEGER DEFAULT 0,           -- yearsOfExpertise: number
  founded_year INTEGER,                           -- foundedYear: number
  image TEXT,                                     -- image: string (URL)
  is_headquarters BOOLEAN DEFAULT FALSE,          -- isHeadquarters: boolean
  is_active BOOLEAN DEFAULT TRUE,                 -- isActive: boolean
  -- Tax & legal
  tax_id TEXT,                                    -- taxId?: string
  registration_number TEXT,                       -- registrationNumber?: string
  -- Coordinates for map
  latitude DECIMAL(9, 6),                         -- coordinates?.lat
  longitude DECIMAL(9, 6),                        -- coordinates?.lng
  created_at TIMESTAMPTZ DEFAULT NOW(),           -- createdAt: string
  updated_at TIMESTAMPTZ DEFAULT NOW()            -- updatedAt: string
);

CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_country ON public.stores(country);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stores viewable by everyone" ON public.stores;
DROP POLICY IF EXISTS "Only admins can modify stores" ON public.stores;
CREATE POLICY "Stores viewable by everyone" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Only admins can modify stores" ON public.stores FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- Add foreign key constraint from profiles to stores (after stores table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_store_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_id_fkey 
      FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert default headquarters store
INSERT INTO public.stores (id, name, short_name, city, country, is_headquarters, is_active)
VALUES ('HQ', 'Siège Principal', 'HQ', 'Douala', 'Cameroun', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 3: COMPANY SETTINGS & CONFIGURATION
-- =============================================================================

-- 3.1 COMPANY INFORMATION (matches COMPANY from constants.ts)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Saddle Point Service',
  short_name TEXT DEFAULT 'SPS',
  slogan TEXT DEFAULT 'Excellence in Electrical Solutions',
  address TEXT,
  city TEXT DEFAULT 'Douala',
  country TEXT DEFAULT 'Cameroun',
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  tax_rate DECIMAL(5, 4) DEFAULT 0.1925,           -- 19.25% TVA
  currency TEXT DEFAULT 'XAF',
  currency_symbol TEXT DEFAULT 'FCFA',
  locale TEXT DEFAULT 'fr-CM',
  -- Legal information (from COMPANY in constants.ts)
  rccm TEXT,                                       -- rccm: 'RC/DLA/2024/B/0000'
  niu TEXT,                                        -- niu: 'M012400000000A' (Tax ID)
  -- Banking information
  bank_name TEXT,                                  -- bank: 'Afriland First Bank'
  bank_iban TEXT,                                  -- iban: 'CM21 10005 00001 00000000000 00'
  bank_swift TEXT,
  bank_account_name TEXT,
  -- Social links
  facebook_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company settings viewable by staff" ON public.company_settings;
DROP POLICY IF EXISTS "Only superadmin can modify company settings" ON public.company_settings;
CREATE POLICY "Company settings viewable by staff" ON public.company_settings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'
  ));
CREATE POLICY "Only superadmin can modify company settings" ON public.company_settings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Insert default company settings
INSERT INTO public.company_settings (id, name, short_name, slogan, address, city, country, phone, email, website)
VALUES ('default', 'Saddle Point Service', 'SPS', 'Excellence in Electrical Solutions', 'Quartier Commercial', 'Douala', 'Cameroun', '+237 600 00 00 00', 'contact@saddlepoint.cm', 'https://saddlepoint.cm')
ON CONFLICT (id) DO NOTHING;

-- 3.2 APPLICATION SETTINGS (matches APP_SETTINGS from constants.ts)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  chat_enabled BOOLEAN DEFAULT TRUE,
  chat_polling_interval INTEGER DEFAULT 3000,       -- milliseconds
  stock_alert_threshold INTEGER DEFAULT 10,
  low_stock_notification BOOLEAN DEFAULT TRUE,
  new_sale_notification BOOLEAN DEFAULT TRUE,
  daily_report_enabled BOOLEAN DEFAULT TRUE,
  report_email TEXT,
  session_timeout INTEGER DEFAULT 28800000,         -- 8 hours in milliseconds
  max_login_attempts INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App settings viewable by staff" ON public.app_settings;
CREATE POLICY "App settings viewable by staff" ON public.app_settings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
  ));

INSERT INTO public.app_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.3 NOTIFICATION SETTINGS (matches notifications state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  low_stock BOOLEAN DEFAULT TRUE,                 -- lowStock: boolean
  new_sale BOOLEAN DEFAULT TRUE,                  -- newSale: boolean
  new_client BOOLEAN DEFAULT FALSE,               -- newClient: boolean
  daily_report BOOLEAN DEFAULT TRUE,              -- dailyReport: boolean
  email_notifications BOOLEAN DEFAULT TRUE,       -- emailNotifications: boolean
  sms_notifications BOOLEAN DEFAULT FALSE,        -- smsNotifications: boolean
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_store ON public.notification_settings(store_id);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notification settings viewable by admins" ON public.notification_settings;
CREATE POLICY "Notification settings viewable by admins" ON public.notification_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

INSERT INTO public.notification_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.4 EMAIL SETTINGS (matches emailSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.email_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  smtp_server TEXT DEFAULT 'smtp.gmail.com',      -- smtpServer: string
  smtp_port TEXT DEFAULT '587',                   -- smtpPort: string
  sender_email TEXT,                              -- senderEmail: string
  sender_name TEXT,                               -- senderName: string
  enable_ssl BOOLEAN DEFAULT TRUE,                -- enableSSL: boolean
  smtp_username TEXT,
  smtp_password TEXT,                             -- Encrypted in production
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_settings_store ON public.email_settings(store_id);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Email settings viewable by admins" ON public.email_settings;
CREATE POLICY "Email settings viewable by admins" ON public.email_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

INSERT INTO public.email_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.5 DOCUMENT SETTINGS (matches documentSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.document_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  invoice_prefix TEXT DEFAULT 'FAC-',             -- invoicePrefix: string
  quote_prefix TEXT DEFAULT 'DEV-',               -- quotePrefix: string
  delivery_prefix TEXT DEFAULT 'BL-',             -- Bon de livraison prefix
  auto_numbering BOOLEAN DEFAULT TRUE,            -- autoNumbering: boolean
  show_logo BOOLEAN DEFAULT TRUE,                 -- showLogo: boolean
  show_bank_details BOOLEAN DEFAULT TRUE,         -- showBankDetails: boolean
  footer_text TEXT DEFAULT 'Merci pour votre confiance.', -- footerText: string
  payment_terms TEXT DEFAULT '30 jours',          -- paymentTerms: string
  -- Bank details for invoices
  bank_name TEXT,
  bank_account TEXT,
  bank_iban TEXT,
  bank_swift TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_settings_store ON public.document_settings(store_id);

ALTER TABLE public.document_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Document settings viewable by staff" ON public.document_settings;
CREATE POLICY "Document settings viewable by staff" ON public.document_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

INSERT INTO public.document_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.6 STOCK SETTINGS (matches stockSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.stock_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  low_stock_threshold INTEGER DEFAULT 10,         -- lowStockThreshold: number
  enable_auto_reorder BOOLEAN DEFAULT FALSE,      -- enableAutoReorder: boolean
  default_category TEXT DEFAULT 'electrical',     -- defaultCategory: string
  reorder_quantity INTEGER DEFAULT 50,
  reorder_lead_days INTEGER DEFAULT 7,
  track_serial_numbers BOOLEAN DEFAULT FALSE,
  enable_batch_tracking BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_settings_store ON public.stock_settings(store_id);

ALTER TABLE public.stock_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock settings viewable by managers" ON public.stock_settings;
CREATE POLICY "Stock settings viewable by managers" ON public.stock_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')));

INSERT INTO public.stock_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.7 SECURITY SETTINGS (matches securitySettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.security_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  session_timeout INTEGER DEFAULT 30,             -- sessionTimeout: number (minutes)
  require_strong_password BOOLEAN DEFAULT TRUE,   -- requireStrongPassword: boolean
  two_factor_auth BOOLEAN DEFAULT FALSE,          -- twoFactorAuth: boolean
  max_login_attempts INTEGER DEFAULT 5,           -- maxLoginAttempts: number
  password_expiry_days INTEGER DEFAULT 90,
  lockout_duration_minutes INTEGER DEFAULT 30,
  ip_whitelist TEXT[],                            -- Array of allowed IPs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Security settings viewable by superadmin only" ON public.security_settings;
CREATE POLICY "Security settings viewable by superadmin only" ON public.security_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

INSERT INTO public.security_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.8 STORE-SPECIFIC SETTINGS (override global settings per store)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  -- Override company settings per store
  tax_rate DECIMAL(5, 4),                         -- Store-specific tax rate
  currency TEXT,                                  -- Store-specific currency
  locale TEXT,                                    -- Store-specific locale
  -- Invoice numbering per store
  invoice_counter INTEGER DEFAULT 0,
  quote_counter INTEGER DEFAULT 0,
  -- Store-specific thresholds
  low_stock_threshold INTEGER,
  -- Working hours override
  open_time TEXT,
  close_time TEXT,
  working_days TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id)
);

CREATE INDEX IF NOT EXISTS idx_store_settings_store ON public.store_settings(store_id);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Store settings viewable by staff" ON public.store_settings;
DROP POLICY IF EXISTS "Store settings editable by admins" ON public.store_settings;
CREATE POLICY "Store settings viewable by staff" ON public.store_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Store settings editable by admins" ON public.store_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- 3.9 SALES & POS SETTINGS (matches salesSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.sales_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  -- POS Settings
  enable_pos BOOLEAN DEFAULT TRUE,                -- enablePOS: boolean
  print_receipt BOOLEAN DEFAULT TRUE,             -- printReceipt: boolean
  receipt_size TEXT DEFAULT '80mm' CHECK (receipt_size IN ('58mm', '80mm', 'A4')), -- receiptSize: string
  default_payment_method TEXT DEFAULT 'cash' CHECK (default_payment_method IN ('cash', 'card', 'mobile', 'transfer')),
  -- Discount Settings
  enable_discounts BOOLEAN DEFAULT TRUE,          -- enableDiscounts: boolean
  max_discount_percent INTEGER DEFAULT 20 CHECK (max_discount_percent >= 0 AND max_discount_percent <= 100),
  require_manager_approval BOOLEAN DEFAULT FALSE, -- requireManagerApproval: boolean
  approval_threshold INTEGER DEFAULT 10 CHECK (approval_threshold >= 0 AND approval_threshold <= 100),
  -- Layaway Settings
  enable_layaway BOOLEAN DEFAULT TRUE,            -- enableLayaway: boolean
  layaway_min_deposit INTEGER DEFAULT 30 CHECK (layaway_min_deposit >= 0 AND layaway_min_deposit <= 100),
  -- Other Options
  enable_multi_payment BOOLEAN DEFAULT TRUE,      -- enableMultiPayment: boolean
  enable_tips BOOLEAN DEFAULT FALSE,              -- enableTips: boolean
  show_price_with_tax BOOLEAN DEFAULT TRUE,       -- showPriceWithTax: boolean
  -- Additional POS settings
  require_customer BOOLEAN DEFAULT FALSE,         -- Require customer selection for sales
  allow_negative_stock BOOLEAN DEFAULT FALSE,     -- Allow selling when stock is 0
  auto_print_kitchen_ticket BOOLEAN DEFAULT FALSE, -- For restaurant POS
  round_to_nearest INTEGER DEFAULT 5,             -- Round total to nearest X (e.g., 5 FCFA)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_settings_store ON public.sales_settings(store_id);

ALTER TABLE public.sales_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sales settings viewable by staff" ON public.sales_settings;
DROP POLICY IF EXISTS "Sales settings editable by admins" ON public.sales_settings;
CREATE POLICY "Sales settings viewable by staff" ON public.sales_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Sales settings editable by admins" ON public.sales_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')));

INSERT INTO public.sales_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.10 REGIONAL SETTINGS (matches regionalSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.regional_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  timezone TEXT DEFAULT 'Africa/Douala',          -- timezone: string
  date_format TEXT DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('24h', '12h')),
  number_format TEXT DEFAULT 'fr-FR' CHECK (number_format IN ('fr-FR', 'en-US', 'de-DE')),
  week_starts_on TEXT DEFAULT 'monday' CHECK (week_starts_on IN ('monday', 'sunday', 'saturday')),
  fiscal_year_start TEXT DEFAULT '01-01',         -- fiscalYearStart: string (MM-DD format)
  -- Additional regional settings
  first_day_of_week INTEGER DEFAULT 1 CHECK (first_day_of_week >= 0 AND first_day_of_week <= 6), -- 0=Sunday, 1=Monday
  decimal_separator TEXT DEFAULT ',',
  thousands_separator TEXT DEFAULT ' ',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regional_settings_store ON public.regional_settings(store_id);

ALTER TABLE public.regional_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Regional settings viewable by staff" ON public.regional_settings;
DROP POLICY IF EXISTS "Regional settings editable by admins" ON public.regional_settings;
CREATE POLICY "Regional settings viewable by staff" ON public.regional_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Regional settings editable by admins" ON public.regional_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

INSERT INTO public.regional_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3.11 INTEGRATION SETTINGS (matches integrationSettings state from SettingsView.tsx)
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Per-store or global (NULL)
  -- API Settings
  enable_api BOOLEAN DEFAULT FALSE,               -- enableAPI: boolean
  api_key TEXT,                                   -- apiKey: string (encrypted in production)
  webhook_url TEXT,                               -- webhookUrl: string
  api_rate_limit INTEGER DEFAULT 1000,            -- Requests per hour
  api_version TEXT DEFAULT 'v1',
  -- WhatsApp Integration
  enable_whatsapp BOOLEAN DEFAULT FALSE,          -- enableWhatsApp: boolean
  whatsapp_number TEXT,                           -- whatsAppNumber: string
  whatsapp_api_key TEXT,                          -- WhatsApp Business API key
  whatsapp_template_namespace TEXT,               -- For message templates
  -- SMS Integration
  enable_sms BOOLEAN DEFAULT FALSE,               -- enableSMS: boolean
  sms_provider TEXT CHECK (sms_provider IN ('twilio', 'nexmo', 'africastalking', 'orange', NULL)),
  sms_api_key TEXT,                               -- SMS provider API key
  sms_sender_id TEXT,                             -- SMS sender ID/name
  -- Payment Gateway
  enable_payment_gateway BOOLEAN DEFAULT FALSE,   -- enablePaymentGateway: boolean
  payment_gateway TEXT CHECK (payment_gateway IN ('stripe', 'paypal', 'momo', 'om', 'flutterwave', NULL)),
  payment_gateway_public_key TEXT,                -- Public/publishable key
  payment_gateway_secret_key TEXT,                -- Secret key (encrypted in production)
  payment_gateway_webhook_secret TEXT,            -- Webhook signing secret
  -- Other Integrations
  enable_accounting_sync BOOLEAN DEFAULT FALSE,   -- Sync with external accounting software
  accounting_software TEXT,                       -- e.g., 'quickbooks', 'sage', 'odoo'
  accounting_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_settings_store ON public.integration_settings(store_id);

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Integration settings viewable by admins only" ON public.integration_settings;
CREATE POLICY "Integration settings viewable by admins only" ON public.integration_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

INSERT INTO public.integration_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 4: CATALOG MANAGEMENT
-- =============================================================================

-- 4.1 CATEGORIES (matches Category interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,                          -- name.en
  name_fr TEXT NOT NULL,                          -- name.fr
  description TEXT,
  icon TEXT,                                      -- icon: string (Lucide icon name)
  image TEXT,                                     -- image: string (URL)
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 SUB-CATEGORIES (matches subCategories from Category)
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,                          -- name.en
  name_fr TEXT NOT NULL,                          -- name.fr
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Sub-categories are viewable by everyone" ON public.sub_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));
CREATE POLICY "Only admins can modify sub-categories" ON public.sub_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- 4.3 ARTICLES (matches Article interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string
  category TEXT NOT NULL,                         -- category: string
  description TEXT,                               -- description: string
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,        -- price: number
  purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0, -- purchasePrice: number
  stock INTEGER NOT NULL DEFAULT 0,               -- stock: number
  min_stock INTEGER NOT NULL DEFAULT 0,           -- minStock: number
  image TEXT,                                     -- image: string (URL)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')), -- status: 'active' | 'inactive'
  unit TEXT DEFAULT 'pièce',                      -- unit: string
  -- Additional fields for enhanced functionality
  sku TEXT UNIQUE,                                -- Stock Keeping Unit
  barcode TEXT,
  max_stock INTEGER,
  weight DECIMAL(10, 3),                          -- in kg
  dimensions TEXT,                                -- LxWxH
  brand TEXT,
  supplier_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_stock ON public.articles(stock);
CREATE INDEX IF NOT EXISTS idx_articles_name ON public.articles(name);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Only admins/managers can modify articles" ON public.articles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')));

-- 4.4 STORE STOCK (Stock per store - allows same article in multiple stores)
CREATE TABLE IF NOT EXISTS public.store_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,               -- Stock quantity for this store
  min_stock INTEGER DEFAULT 0,                    -- Store-specific minimum stock
  max_stock INTEGER,                              -- Store-specific maximum stock
  shelf_location TEXT,                            -- Physical location in store (e.g., "A-12-3")
  last_inventory_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_store_stock_store ON public.store_stock(store_id);
CREATE INDEX IF NOT EXISTS idx_store_stock_article ON public.store_stock(article_id);
CREATE INDEX IF NOT EXISTS idx_store_stock_low ON public.store_stock(stock) WHERE stock <= 10;

ALTER TABLE public.store_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store stock viewable by staff" ON public.store_stock FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Store stock editable by managers" ON public.store_stock FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')));

-- 4.5 SERVICES (matches Service interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string
  category TEXT NOT NULL,                         -- category: string
  description TEXT,                               -- description: string
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,        -- price: number
  duration TEXT,                                  -- duration: string
  image TEXT,                                     -- image: string (URL)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')), -- status: 'active' | 'inactive'
  is_featured BOOLEAN DEFAULT FALSE,
  short_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Only admins can modify services" ON public.services FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- =============================================================================
-- SECTION 5: CUSTOMER MANAGEMENT
-- =============================================================================

-- 5.1 CLIENTS (matches Client interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string
  email TEXT,                                     -- email: string
  phone TEXT NOT NULL,                            -- phone: string
  address TEXT,                                   -- address: string
  total_spent DECIMAL(15, 2) DEFAULT 0,           -- totalSpent: number
  -- Extended fields
  client_code TEXT UNIQUE,                        -- Auto-generated client code
  company_name TEXT,
  secondary_phone TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroun',
  notes TEXT,
  client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'business')),
  credit_limit DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_code ON public.clients(client_code);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view/modify clients" ON public.clients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'commercial', 'secretaire', 'comptable', 'manager')));

-- =============================================================================
-- SECTION 6: SALES & INVOICING
-- =============================================================================

-- 6.1 SALES (matches Sale interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,            -- invoiceNumber: string
  store_id TEXT REFERENCES public.stores(id),     -- Store where sale was made
  client_id TEXT REFERENCES public.clients(id),
  client_name TEXT NOT NULL,                      -- clientName: string
  total DECIMAL(15, 2) NOT NULL,                  -- total: number
  paid DECIMAL(15, 2) DEFAULT 0,                  -- paid: number
  status TEXT CHECK (status IN ('pending', 'partial', 'completed', 'cancelled', 'refunded')), -- status: 'pending' | 'partial' | 'completed'
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),        -- date: string (ISO)
  created_by UUID REFERENCES public.profiles(id), -- createdBy?: string (user id)
  created_by_name TEXT,                           -- createdByName?: string
  -- Extended fields
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer', 'credit')),
  notes TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_client ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_store ON public.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON public.sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON public.sales(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON public.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);

-- 6.2 SALE ITEMS (matches items array in Sale interface)
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('article', 'service')), -- type: 'article' | 'service'
  item_id TEXT NOT NULL,                          -- id: string
  name TEXT NOT NULL,                             -- name: string
  quantity INTEGER NOT NULL DEFAULT 1,            -- quantity: number
  price DECIMAL(12, 2) NOT NULL,                  -- price: number (unit price)
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,            -- calculated: quantity * price
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item ON public.sale_items(item_id);

-- 6.3 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer', 'check')),
  reference_number TEXT,
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_sale ON public.payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view sales" ON public.sales FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Staff can manage sales" ON public.sales FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'commercial', 'secretaire', 'comptable')));

CREATE POLICY "Sale items follow sale policy" ON public.sale_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));

CREATE POLICY "Payments viewable by staff" ON public.payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

-- RLS : chaque utilisateur ne voit que les données de sa boutique (sauf admin/superadmin)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales by store" ON public.sales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role IN ('superadmin', 'admin') OR sales.store_id = p.store_id))
  );

-- =============================================================================
-- SECTION 7: INVENTORY & STOCK MANAGEMENT
-- =============================================================================

-- 6.1 STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE, -- Store where movement occurred
  article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'return', 'transfer')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  unit_cost DECIMAL(12, 2),
  reference_type TEXT,                            -- 'sale', 'purchase', 'adjustment', 'return', 'transfer'
  reference_id TEXT,
  -- For transfers between stores
  from_store_id TEXT REFERENCES public.stores(id),
  to_store_id TEXT REFERENCES public.stores(id),
  notes TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  movement_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_store ON public.stock_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article ON public.stock_movements(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(movement_type);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stock movements viewable by staff" ON public.stock_movements FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager', 'comptable')));
CREATE POLICY "Stock movements can be created by managers" ON public.stock_movements FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')));
CREATE POLICY "Stock movements can be updated by admins" ON public.stock_movements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- 6.2 SUPPLIERS (matches Supplier interface from SuppliersView.tsx)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,                               -- code: string
  name TEXT NOT NULL,                             -- name: string
  contact_name TEXT,                              -- contactName: string
  email TEXT,                                     -- email: string
  phone TEXT,                                     -- phone: string
  address TEXT,                                   -- address: string
  city TEXT,                                      -- city: string
  country TEXT,                                   -- country: string
  website TEXT,                                   -- website?: string
  category TEXT CHECK (category IN ('electrical', 'automation', 'solar', 'cables', 'general')), -- category
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')), -- status
  payment_terms TEXT,                             -- paymentTerms: string
  notes TEXT,                                     -- notes?: string
  total_orders INTEGER DEFAULT 0,                 -- totalOrders: number
  total_spent DECIMAL(15, 2) DEFAULT 0,           -- totalSpent: number
  created_at TIMESTAMPTZ DEFAULT NOW(),           -- createdAt: string
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers viewable by staff" ON public.suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager', 'comptable')));

-- =============================================================================
-- SECTION 8: ALERTS & NOTIFICATIONS
-- =============================================================================

-- 7.1 ALERTS (matches Alert interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,                            -- id: string
  type TEXT NOT NULL CHECK (type IN ('stock', 'sale', 'payment', 'system', 'reminder')), -- type: 'stock' | 'sale' | 'payment'
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')), -- severity: 'low' | 'medium' | 'high'
  message TEXT NOT NULL,                          -- message: string
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),        -- date: string
  read BOOLEAN DEFAULT FALSE,                     -- read: boolean
  -- Extended fields
  title TEXT,
  action_url TEXT,
  target_roles TEXT[],                            -- Array of roles that should see this alert
  read_by UUID REFERENCES public.profiles(id),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON public.alerts(read);
CREATE INDEX IF NOT EXISTS idx_alerts_date ON public.alerts(date);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts viewable by targeted roles" ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (target_roles IS NULL OR role = ANY(target_roles))
    )
  );

-- =============================================================================
-- SECTION 9: STORE RELATED TABLES (stores table created in Section 2)
-- =============================================================================

-- 8.1 STORE SERVICES (services array in StoreInfo)
CREATE TABLE IF NOT EXISTS public.store_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL                      -- services: string[]
);

CREATE INDEX IF NOT EXISTS idx_store_services_store ON public.store_services(store_id);

-- 8.2 STORE FEATURES (features array in StoreInfo)
CREATE TABLE IF NOT EXISTS public.store_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  feature TEXT NOT NULL                           -- features: string[]
);

CREATE INDEX IF NOT EXISTS idx_store_features_store ON public.store_features(store_id);

ALTER TABLE public.store_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store services viewable by everyone" ON public.store_services FOR SELECT USING (true);
CREATE POLICY "Store features viewable by everyone" ON public.store_features FOR SELECT USING (true);

-- 8.3 USER GROUPS (matches UserGroup interface from StoresView.tsx)
CREATE TABLE IF NOT EXISTS public.user_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string
  description TEXT,                               -- description: string
  is_company_wide BOOLEAN DEFAULT FALSE,          -- isCompanyWide: boolean
  created_at TIMESTAMPTZ DEFAULT NOW()            -- createdAt: string
);

-- 8.4 USER GROUP STORES (storeIds array in UserGroup)
CREATE TABLE IF NOT EXISTS public.user_group_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT REFERENCES public.user_groups(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_group_stores_group ON public.user_group_stores(group_id);
CREATE INDEX IF NOT EXISTS idx_user_group_stores_store ON public.user_group_stores(store_id);

-- 8.5 USER GROUP PERMISSIONS (permissions array in UserGroup)
CREATE TABLE IF NOT EXISTS public.user_group_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT REFERENCES public.user_groups(id) ON DELETE CASCADE,
  permission TEXT NOT NULL                        -- permissions: string[]
);

CREATE INDEX IF NOT EXISTS idx_user_group_permissions_group ON public.user_group_permissions(group_id);

ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User groups viewable by staff" ON public.user_groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

CREATE POLICY "User group stores viewable by staff" ON public.user_group_stores FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

CREATE POLICY "User group permissions viewable by staff" ON public.user_group_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- 8.7 USER STORE ASSIGNMENTS (Individual user access to stores - StoreAccessContext)
-- This table tracks which stores each user has access to and their permissions per store
CREATE TABLE IF NOT EXISTS public.user_store_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  -- Permissions per store
  can_create BOOLEAN DEFAULT FALSE,               -- canCreate: boolean
  can_edit BOOLEAN DEFAULT FALSE,                 -- canEdit: boolean
  can_delete BOOLEAN DEFAULT FALSE,               -- canDelete: boolean
  can_view_reports BOOLEAN DEFAULT FALSE,         -- canViewReports: boolean
  can_manage_stock BOOLEAN DEFAULT FALSE,         -- canManageStock: boolean
  can_manage_users BOOLEAN DEFAULT FALSE,         -- canManageUsers: boolean
  -- Assignment metadata
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)                       -- One assignment per user-store pair
);

CREATE INDEX IF NOT EXISTS idx_user_store_assignments_user ON public.user_store_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_store_assignments_store ON public.user_store_assignments(store_id);

-- 8.8 USER ACCESS PROFILES (Global access settings for users)
-- Tracks whether a user has global (all stores) access or is restricted
CREATE TABLE IF NOT EXISTS public.user_access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  is_global BOOLEAN DEFAULT FALSE,                -- Can access all stores
  access_type TEXT DEFAULT 'single' CHECK (access_type IN ('single', 'multiple', 'global')),
  -- Default permissions when accessing any store (for global users)
  default_can_create BOOLEAN DEFAULT FALSE,
  default_can_edit BOOLEAN DEFAULT FALSE,
  default_can_delete BOOLEAN DEFAULT FALSE,
  default_can_view_reports BOOLEAN DEFAULT FALSE,
  default_can_manage_stock BOOLEAN DEFAULT FALSE,
  default_can_manage_users BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_access_profiles_user ON public.user_access_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_profiles_global ON public.user_access_profiles(is_global) WHERE is_global = TRUE;

-- Enable RLS for user store assignments and access profiles
ALTER TABLE public.user_store_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_profiles ENABLE ROW LEVEL SECURITY;

-- Users can see their own store assignments
CREATE POLICY "Users can view own store assignments" ON public.user_store_assignments
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
  ));

-- Only admins can modify store assignments
CREATE POLICY "Admins can manage store assignments" ON public.user_store_assignments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
  ));

-- Users can see their own access profile
CREATE POLICY "Users can view own access profile" ON public.user_access_profiles
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
  ));

-- Only admins can modify access profiles
CREATE POLICY "Admins can manage access profiles" ON public.user_access_profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- =============================================================================
-- SECTION 10: ACCOUNTING
-- =============================================================================

-- 9.1 ACCOUNTING ENTRIES (matches AccountingEntry from AccountingView.tsx)
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,                      -- date: string
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')), -- type: 'income' | 'expense'
  category TEXT NOT NULL,                         -- category: string
  description TEXT,                               -- description: string
  amount DECIMAL(15, 2) NOT NULL,                 -- amount: number
  reference TEXT,                                 -- reference: string
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')), -- status
  created_by TEXT,                                -- createdBy: string
  notes TEXT,                                     -- notes?: string
  created_at TIMESTAMPTZ DEFAULT NOW()            -- createdAt: string
);

CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON public.accounting_entries(date);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_type ON public.accounting_entries(type);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_category ON public.accounting_entries(category);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_status ON public.accounting_entries(status);

ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accounting entries viewable by accountants and admins" ON public.accounting_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

-- 9.2 ACCOUNTING REPORTS (matches AccountingReport from AccountingView.tsx)
CREATE TABLE IF NOT EXISTS public.accounting_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,                            -- title: string
  period TEXT NOT NULL,                           -- period: string
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved')), -- status
  created_by TEXT,                                -- createdBy: string
  total_income DECIMAL(15, 2) DEFAULT 0,          -- data.totalIncome
  total_expenses DECIMAL(15, 2) DEFAULT 0,        -- data.totalExpenses
  net_profit DECIMAL(15, 2) DEFAULT 0,            -- data.netProfit
  created_at TIMESTAMPTZ DEFAULT NOW()            -- createdAt: string
);

-- 9.3 ACCOUNTING REPORT RECIPIENTS
CREATE TABLE IF NOT EXISTS public.accounting_report_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT REFERENCES public.accounting_reports(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL                   -- sentTo: string[]
);

CREATE INDEX IF NOT EXISTS idx_report_recipients_report ON public.accounting_report_recipients(report_id);

ALTER TABLE public.accounting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_report_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by accountants and admins" ON public.accounting_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

CREATE POLICY "Report recipients viewable by accountants and admins" ON public.accounting_report_recipients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

-- =============================================================================
-- SECTION 11: ANALYTICS & VISITORS
-- =============================================================================

-- 10.1 VISITORS (matches Visitor interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.visitors (
  id TEXT PRIMARY KEY,
  ip TEXT,                                        -- ip: string
  location TEXT,                                  -- location: string
  date TEXT,                                      -- date: string
  time TEXT,                                      -- time: string
  user_agent TEXT,                                -- userAgent: string
  page TEXT,                                      -- page: string
  device TEXT CHECK (device IN ('Desktop', 'Mobile', 'Tablet', 'Other')), -- device?: string
  -- Extended fields
  session_id TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  page_title TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.visitors(visited_at);
CREATE INDEX IF NOT EXISTS idx_visitors_location ON public.visitors(location);
CREATE INDEX IF NOT EXISTS idx_visitors_device ON public.visitors(device);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON public.visitors(page);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins/superadmins can view visitor logs" ON public.visitors FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- 10.2 DAILY REPORTS (Pre-aggregated data for fast reporting)
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_paid DECIMAL(15, 2) DEFAULT 0,
  total_pending DECIMAL(15, 2) DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  new_articles INTEGER DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  top_selling_category TEXT,
  top_selling_article TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON public.daily_reports(report_date);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by management" ON public.daily_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager', 'comptable')));

-- =============================================================================
-- SECTION 12: INTERNAL COMMUNICATION
-- =============================================================================

-- 11.1 CHAT MESSAGES (matches Message interface from ChatContext.tsx)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,                        -- senderId: string
  sender_name TEXT NOT NULL,                      -- senderName: string
  content TEXT NOT NULL,                          -- content: string
  timestamp BIGINT NOT NULL,                      -- timestamp: number (milliseconds)
  channel TEXT DEFAULT 'general',                 -- channel: string
  -- Extended fields
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON public.chat_messages(channel);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat viewable by staff" ON public.chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));
CREATE POLICY "Staff can send messages" ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));

-- =============================================================================
-- SECTION 13: NAVIGATION DATA (for mega menus)
-- =============================================================================

-- 12.1 NAV ITEMS (matches NavItem interface from mockData.ts)
CREATE TABLE IF NOT EXISTS public.nav_items (
  id TEXT PRIMARY KEY,
  nav_type TEXT NOT NULL CHECK (nav_type IN ('products', 'services')),
  title_en TEXT NOT NULL,                         -- title.en
  title_fr TEXT NOT NULL,                         -- title.fr
  description_en TEXT,                            -- description.en
  description_fr TEXT,                            -- description.fr
  icon TEXT,                                      -- icon: string
  image TEXT,                                     -- image: string
  href TEXT,                                      -- href?: string
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12.2 NAV ITEM CHILDREN (items array in NavItem)
CREATE TABLE IF NOT EXISTS public.nav_item_children (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES public.nav_items(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,                          -- name.en
  name_fr TEXT NOT NULL,                          -- name.fr
  href TEXT,                                      -- href?: string
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_nav_item_children_parent ON public.nav_item_children(parent_id);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_item_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nav items viewable by everyone" ON public.nav_items FOR SELECT USING (true);
CREATE POLICY "Nav item children viewable by everyone" ON public.nav_item_children FOR SELECT USING (true);

-- =============================================================================
-- SECTION 12B: CLIENT-STAFF COMMUNICATION
-- =============================================================================

-- 12.3 CLIENT MESSAGES (matches ClientMessage from ClientChatWidget.tsx)
-- Separate from internal staff chat - this is for client support
CREATE TABLE IF NOT EXISTS public.client_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,                        -- senderId: string
  sender_name TEXT NOT NULL,                      -- senderName: string
  sender_role TEXT NOT NULL,                      -- senderRole: string ('client' or staff role)
  content TEXT NOT NULL,                          -- content: string
  timestamp BIGINT NOT NULL,                      -- timestamp: number (milliseconds)
  client_id TEXT NOT NULL,                        -- clientId: string (the client this conversation belongs to)
  -- Extended fields
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_client ON public.client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_timestamp ON public.client_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_client_messages_sender ON public.client_messages(sender_id);

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;
-- Clients can only see their own messages
CREATE POLICY "Clients view own messages" ON public.client_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client' AND auth.uid()::TEXT = client_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client')
  );
-- Clients and staff can insert messages
CREATE POLICY "Users can send messages" ON public.client_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 12.4 CLIENT MESSAGE READ STATUS (tracks when staff read client messages)
CREATE TABLE IF NOT EXISTS public.client_message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_message_read_staff ON public.client_message_read_status(staff_id);
CREATE INDEX IF NOT EXISTS idx_client_message_read_client ON public.client_message_read_status(client_id);

ALTER TABLE public.client_message_read_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage read status" ON public.client_message_read_status FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'client'));

-- =============================================================================
-- SECTION 12C: USER PREFERENCES
-- =============================================================================

-- 12.5 USER FAVORITES (matches favorites_${userId} from ClientShopView.tsx)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('article', 'service')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item ON public.user_favorites(item_id);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON public.user_favorites FOR ALL
  USING (user_id = auth.uid());

-- 12.6 USER PREFERENCES (language, theme, etc.)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  compact_mode BOOLEAN DEFAULT FALSE,
  default_store_id TEXT REFERENCES public.stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL
  USING (user_id = auth.uid());

-- =============================================================================
-- SECTION 12D: ENHANCED CATEGORIES (matches CategoryManager.tsx)
-- =============================================================================

-- 12.7 PRODUCT/SERVICE CATEGORIES (enhanced version with color, order, hierarchy)
CREATE TABLE IF NOT EXISTS public.category_manager (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                             -- name: string (French)
  name_en TEXT,                                   -- nameEn?: string (English)
  type TEXT NOT NULL CHECK (type IN ('article', 'service')), -- type: 'article' | 'service'
  color TEXT DEFAULT '#3B82F6',                   -- color: string (hex)
  icon TEXT,                                      -- icon?: string
  parent_id TEXT REFERENCES public.category_manager(id) ON DELETE SET NULL, -- parentId?: string (for subcategories)
  display_order INTEGER DEFAULT 0,                -- order: number
  is_active BOOLEAN DEFAULT TRUE,                 -- isActive: boolean
  created_at TIMESTAMPTZ DEFAULT NOW()            -- createdAt: string
);

CREATE INDEX IF NOT EXISTS idx_category_manager_type ON public.category_manager(type);
CREATE INDEX IF NOT EXISTS idx_category_manager_parent ON public.category_manager(parent_id);
CREATE INDEX IF NOT EXISTS idx_category_manager_order ON public.category_manager(display_order);

ALTER TABLE public.category_manager ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.category_manager FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.category_manager FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin')));

-- =============================================================================
-- SECTION 14: FUNCTIONS & TRIGGERS
-- =============================================================================

-- 13.1 Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_modtime BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_modtime BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_modtime BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_settings_modtime BEFORE UPDATE ON public.email_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_settings_modtime BEFORE UPDATE ON public.document_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_settings_modtime BEFORE UPDATE ON public.stock_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_settings_modtime BEFORE UPDATE ON public.security_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_modtime BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_stock_modtime BEFORE UPDATE ON public.store_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_categories_modtime BEFORE UPDATE ON public.sub_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_modtime BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_modtime BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_modtime BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_modtime BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_modtime BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13.2 Auto-generate invoice number (format: INV-YYMM-0001)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.sales
    WHERE invoice_number LIKE 'INV-' || year_month || '-%';

    NEW.invoice_number := 'INV-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_invoice_number BEFORE INSERT ON public.sales
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
EXECUTE FUNCTION generate_invoice_number();

-- 13.3 Auto-generate client code (format: CLI-00001)
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 5) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.clients
    WHERE client_code LIKE 'CLI-%';

    NEW.client_code := 'CLI-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_client_code BEFORE INSERT ON public.clients
FOR EACH ROW
WHEN (NEW.client_code IS NULL OR NEW.client_code = '')
EXECUTE FUNCTION generate_client_code();

-- 13.4 Auto-generate supplier code (format: FOUR-001)
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 6) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.suppliers
    WHERE code LIKE 'FOUR-%';

    NEW.code := 'FOUR-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_supplier_code BEFORE INSERT ON public.suppliers
FOR EACH ROW
WHEN (NEW.code IS NULL OR NEW.code = '')
EXECUTE PROCEDURE generate_supplier_code();

-- 13.5 Update stock after sale item insert
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'article' THEN
        -- Update article stock
        UPDATE public.articles
        SET stock = stock - NEW.quantity
        WHERE id = NEW.item_id;

        -- Record stock movement
        INSERT INTO public.stock_movements (
            article_id, movement_type, quantity, previous_stock, new_stock, 
            reference_type, reference_id
        )
        SELECT 
            NEW.item_id, 'out', NEW.quantity, stock + NEW.quantity, stock, 
            'sale', NEW.sale_id
        FROM public.articles WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_sale_item_insert AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE PROCEDURE update_stock_after_sale();

-- 13.6 Update client total spent when sale completed
CREATE OR REPLACE FUNCTION update_client_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE public.clients
        SET total_spent = total_spent + NEW.total
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_sale_completed AFTER UPDATE ON public.sales
FOR EACH ROW EXECUTE PROCEDURE update_client_total_spent();

-- 13.7 Create low stock alert
CREATE OR REPLACE FUNCTION create_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= NEW.min_stock AND (OLD.stock IS NULL OR OLD.stock > OLD.min_stock) THEN
        INSERT INTO public.alerts (id, type, severity, message, date, target_roles)
        VALUES (
            'alert-' || gen_random_uuid()::TEXT,
            'stock',
            CASE WHEN NEW.stock = 0 THEN 'critical' ELSE 'high' END,
            'Stock critique: ' || NEW.name || ' (' || NEW.stock || '/' || NEW.min_stock || ' unités)',
            NOW(),
            ARRAY['superadmin', 'admin', 'manager']
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_low_stock AFTER UPDATE ON public.articles
FOR EACH ROW EXECUTE PROCEDURE create_low_stock_alert();

-- 13.8 Create sale notification alert
CREATE OR REPLACE FUNCTION create_sale_alert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.alerts (id, type, severity, message, date, target_roles)
    VALUES (
        'alert-' || gen_random_uuid()::TEXT,
        'sale',
        'medium',
        'Nouvelle vente enregistrée: ' || NEW.invoice_number || ' - ' || NEW.total || ' FCFA',
        NOW(),
        ARRAY['superadmin', 'admin', 'comptable']
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_sale_created AFTER INSERT ON public.sales
FOR EACH ROW EXECUTE PROCEDURE create_sale_alert();

-- =============================================================================
-- SECTION 15: VIEWS FOR REPORTING
-- =============================================================================

-- 14.1 Sales summary view
CREATE OR REPLACE VIEW public.v_sales_summary AS
SELECT
    DATE_TRUNC('month', date) AS month,
    COUNT(*) AS total_sales,
    SUM(total) AS total_revenue,
    SUM(paid) AS total_paid,
    SUM(total - paid) AS total_pending,
    AVG(total) AS avg_sale_value
FROM public.sales
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- 14.2 Top products view
CREATE OR REPLACE VIEW public.v_top_products AS
SELECT
    a.id,
    a.name,
    a.category,
    a.stock,
    a.min_stock,
    COUNT(si.id) AS times_sold,
    SUM(si.quantity) AS total_quantity_sold,
    SUM(si.total_price) AS total_revenue
FROM public.articles a
LEFT JOIN public.sale_items si ON a.id = si.item_id AND si.item_type = 'article'
GROUP BY a.id, a.name, a.category, a.stock, a.min_stock
ORDER BY total_revenue DESC NULLS LAST;

-- 14.3 Client summary view
CREATE OR REPLACE VIEW public.v_client_summary AS
SELECT
    c.id,
    c.name,
    c.client_code,
    c.phone,
    c.email,
    c.total_spent,
    COUNT(s.id) AS total_orders,
    MAX(s.date) AS last_purchase
FROM public.clients c
LEFT JOIN public.sales s ON c.id = s.client_id
GROUP BY c.id, c.name, c.client_code, c.phone, c.email, c.total_spent
ORDER BY c.total_spent DESC;

-- 14.4 Low stock items view
CREATE OR REPLACE VIEW public.v_low_stock_items AS
SELECT
    id,
    name,
    category,
    stock,
    min_stock,
    (min_stock - stock) AS shortage,
    price,
    purchase_price
FROM public.articles
WHERE stock <= min_stock AND status = 'active'
ORDER BY shortage DESC;

-- 14.5 Sales by staff view
CREATE OR REPLACE VIEW public.v_sales_by_staff AS
SELECT
    s.created_by,
    s.created_by_name,
    COUNT(*) AS total_sales,
    SUM(s.total) AS total_revenue,
    SUM(s.paid) AS total_collected,
    AVG(s.total) AS avg_sale_value
FROM public.sales s
WHERE s.created_by IS NOT NULL
GROUP BY s.created_by, s.created_by_name
ORDER BY total_revenue DESC;

-- 14.6 Visitor analytics view
CREATE OR REPLACE VIEW public.v_visitor_analytics AS
SELECT
    DATE(visited_at) AS visit_date,
    COUNT(*) AS total_visits,
    COUNT(DISTINCT ip) AS unique_visitors,
    COUNT(CASE WHEN device = 'Desktop' THEN 1 END) AS desktop_visits,
    COUNT(CASE WHEN device = 'Mobile' THEN 1 END) AS mobile_visits,
    COUNT(CASE WHEN device = 'Tablet' THEN 1 END) AS tablet_visits
FROM public.visitors
GROUP BY DATE(visited_at)
ORDER BY visit_date DESC;

-- 14.7 Sales summary by store view
CREATE OR REPLACE VIEW public.v_sales_by_store AS
SELECT
    st.id AS store_id,
    st.name AS store_name,
    st.city,
    DATE_TRUNC('month', s.date) AS month,
    COUNT(s.id) AS total_sales,
    SUM(s.total) AS total_revenue,
    SUM(s.paid) AS total_paid,
    SUM(s.total - s.paid) AS total_pending,
    AVG(s.total) AS avg_sale_value
FROM public.stores st
LEFT JOIN public.sales s ON st.id = s.store_id AND s.status != 'cancelled'
GROUP BY st.id, st.name, st.city, DATE_TRUNC('month', s.date)
ORDER BY st.name, month DESC;

-- 14.8 Stock by store view
CREATE OR REPLACE VIEW public.v_stock_by_store AS
SELECT
    st.id AS store_id,
    st.name AS store_name,
    st.city,
    a.id AS article_id,
    a.name AS article_name,
    a.category,
    COALESCE(ss.stock, 0) AS store_stock,
    COALESCE(ss.min_stock, a.min_stock) AS min_stock,
    ss.shelf_location,
    CASE WHEN COALESCE(ss.stock, 0) <= COALESCE(ss.min_stock, a.min_stock) THEN TRUE ELSE FALSE END AS is_low_stock,
    a.price,
    a.purchase_price
FROM public.stores st
CROSS JOIN public.articles a
LEFT JOIN public.store_stock ss ON st.id = ss.store_id AND a.id = ss.article_id
WHERE a.status = 'active'
ORDER BY st.name, a.category, a.name;

-- 14.9 Low stock items by store view
CREATE OR REPLACE VIEW public.v_low_stock_by_store AS
SELECT
    st.id AS store_id,
    st.name AS store_name,
    a.id AS article_id,
    a.name AS article_name,
    a.category,
    COALESCE(ss.stock, 0) AS current_stock,
    COALESCE(ss.min_stock, a.min_stock) AS min_stock,
    (COALESCE(ss.min_stock, a.min_stock) - COALESCE(ss.stock, 0)) AS shortage,
    a.price,
    a.supplier_id
FROM public.stores st
JOIN public.store_stock ss ON st.id = ss.store_id
JOIN public.articles a ON ss.article_id = a.id
WHERE ss.stock <= COALESCE(ss.min_stock, a.min_stock) AND a.status = 'active'
ORDER BY shortage DESC, st.name;

-- 14.10 Stock transfers history view
CREATE OR REPLACE VIEW public.v_stock_transfers AS
SELECT
    sm.id AS transfer_id,
    sm.movement_date,
    a.id AS article_id,
    a.name AS article_name,
    a.category,
    sm.quantity,
    fs.id AS from_store_id,
    fs.name AS from_store_name,
    fs.city AS from_city,
    ts.id AS to_store_id,
    ts.name AS to_store_name,
    ts.city AS to_city,
    p.name AS performed_by_name,
    sm.notes
FROM public.stock_movements sm
JOIN public.articles a ON sm.article_id = a.id
LEFT JOIN public.stores fs ON sm.from_store_id = fs.id
LEFT JOIN public.stores ts ON sm.to_store_id = ts.id
LEFT JOIN public.profiles p ON sm.performed_by = p.id
WHERE sm.movement_type = 'transfer'
ORDER BY sm.movement_date DESC;

-- 14.11 Store performance comparison view
CREATE OR REPLACE VIEW public.v_store_performance AS
SELECT
    st.id AS store_id,
    st.name AS store_name,
    st.city,
    st.manager,
    COUNT(DISTINCT s.id) AS total_sales_count,
    COALESCE(SUM(s.total), 0) AS total_revenue,
    COALESCE(SUM(s.paid), 0) AS total_collected,
    COALESCE(AVG(s.total), 0) AS avg_sale_value,
    COUNT(DISTINCT s.client_id) AS unique_customers,
    (SELECT COUNT(*) FROM public.store_stock WHERE store_id = st.id AND stock <= min_stock) AS low_stock_items
FROM public.stores st
LEFT JOIN public.sales s ON st.id = s.store_id AND s.status != 'cancelled'
WHERE st.is_active = TRUE
GROUP BY st.id, st.name, st.city, st.manager
ORDER BY total_revenue DESC;

-- 14.12 Settings overview view (for admin dashboard)
CREATE OR REPLACE VIEW public.v_settings_overview AS
SELECT
    'notification' AS setting_type,
    ns.store_id,
    st.name AS store_name,
    jsonb_build_object(
        'lowStock', ns.low_stock,
        'newSale', ns.new_sale,
        'dailyReport', ns.daily_report,
        'emailNotifications', ns.email_notifications
    ) AS settings
FROM public.notification_settings ns
LEFT JOIN public.stores st ON ns.store_id = st.id
UNION ALL
SELECT
    'document' AS setting_type,
    ds.store_id,
    st.name AS store_name,
    jsonb_build_object(
        'invoicePrefix', ds.invoice_prefix,
        'quotePrefix', ds.quote_prefix,
        'autoNumbering', ds.auto_numbering,
        'paymentTerms', ds.payment_terms
    ) AS settings
FROM public.document_settings ds
LEFT JOIN public.stores st ON ds.store_id = st.id;

-- =============================================================================
-- SECTION 16: SEED DATA
-- =============================================================================

-- Insert default categories
INSERT INTO public.categories (id, name_en, name_fr, icon, image) VALUES
('electronics', 'Electronics', 'Électronique', 'Zap', 'https://images.unsplash.com/photo-1498049397964-29f9b7c53524?auto=format&fit=crop&q=80&w=1200'),
('solar', 'Solar & Energy', 'Solaire & Énergie', 'Sun', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200'),
('security', 'Security', 'Sécurité', 'Shield', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1200'),
('automation', 'Automation', 'Automatisme', 'Cpu', 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=1200');

-- Insert sub-categories
INSERT INTO public.sub_categories (id, category_id, name_en, name_fr) VALUES
('cables', 'electronics', 'Cables & Wiring', 'Câbles & Câblage'),
('breakers', 'electronics', 'Circuit Breakers', 'Disjoncteurs'),
('lighting', 'electronics', 'Lighting', 'Éclairage'),
('motors', 'electronics', 'Motors & Drives', 'Moteurs & Variateurs'),
('panels', 'solar', 'Solar Panels', 'Panneaux Solaires'),
('inverters', 'solar', 'Inverters', 'Onduleurs'),
('batteries', 'solar', 'Batteries', 'Batteries'),
('cameras', 'security', 'CCTV Cameras', 'Caméras Vidéosurveillance'),
('alarms', 'security', 'Alarm Systems', 'Syst�mes d''Alarme'),
('access', 'security', 'Access Control', 'Contr�le d''Acc�s'),
('plc', 'automation', 'PLCs', 'Automates Programmables'),
('hmi', 'automation', 'HMIs', 'IHM'),
('sensors', 'automation', 'Industrial Sensors', 'Capteurs Industriels');

-- Insert default stores
INSERT INTO public.stores (id, name, short_name, country, city, address, postal_code, phone, email, manager, working_days, open_time, close_time, years_of_expertise, founded_year, is_headquarters, is_active, image)
VALUES 
('store-yde', 'Saddle Point Service - Yaoundé', 'SPS Yaoundé', 'Cameroun', 'Yaoundé', 'Bastos, Avenue des Ambassades, Face ambassade du Nigeria', 'BP 1234', '+237 699 00 11 22', 'yaounde@saddlepoint.cm', 'M. Jean-Pierre Manga', 'Lundi - Samedi', '08:00', '18:00', 10, 2016, true, true, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200'),
('store-dla', 'Saddle Point Service - Douala', 'SPS Douala', 'Cameroun', 'Douala', 'Akwa, Boulevard de la Liberté, Ancien immeuble Air France', 'BP 5678', '+237 677 33 44 55', 'douala@saddlepoint.cm', 'Mme. Sarah Eboa', 'Lundi - Samedi', '08:30', '18:30', 8, 2018, false, true, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200');

-- Insert store features
INSERT INTO public.store_features (store_id, feature) VALUES
('store-yde', 'Showroom'),
('store-yde', 'Service Technique'),
('store-yde', 'Vente Directe'),
('store-yde', 'Support Pro'),
('store-dla', 'Showroom'),
('store-dla', 'Vente en Gros'),
('store-dla', 'Logistique'),
('store-dla', 'Formation');

-- Insert store-specific settings for each store
INSERT INTO public.store_settings (store_id, tax_rate, currency, locale, low_stock_threshold) VALUES
('store-yde', 0.1925, 'XAF', 'fr-CM', 10),
('store-dla', 0.1925, 'XAF', 'fr-CM', 15);

-- Insert notification settings per store
INSERT INTO public.notification_settings (id, store_id, low_stock, new_sale, new_client, daily_report, email_notifications, sms_notifications) VALUES
('notif-yde', 'store-yde', true, true, false, true, true, false),
('notif-dla', 'store-dla', true, true, true, true, true, false);

-- Insert document settings per store
INSERT INTO public.document_settings (id, store_id, invoice_prefix, quote_prefix, delivery_prefix, footer_text, payment_terms) VALUES
('doc-yde', 'store-yde', 'FAC-YDE-', 'DEV-YDE-', 'BL-YDE-', 'Merci pour votre confiance. SPS Yaoundé', '30 jours'),
('doc-dla', 'store-dla', 'FAC-DLA-', 'DEV-DLA-', 'BL-DLA-', 'Merci pour votre confiance. SPS Douala', '30 jours');

-- Insert stock settings per store
INSERT INTO public.stock_settings (id, store_id, low_stock_threshold, enable_auto_reorder, default_category) VALUES
('stock-yde', 'store-yde', 10, false, 'electrical'),
('stock-dla', 'store-dla', 15, true, 'electrical');

-- Insert default category manager entries (from CategoryManager.tsx defaultCategories)
INSERT INTO public.category_manager (id, name, name_en, type, color, display_order, is_active) VALUES
-- Article categories
('cat-elec', 'Protection Électrique', 'Electrical Protection', 'article', '#3B82F6', 1, true),
('cat-dist', 'Distribution Électrique', 'Electrical Distribution', 'article', '#8B5CF6', 2, true),
('cat-solar', 'Énergies Renouvelables', 'Renewable Energy', 'article', '#F59E0B', 3, true),
('cat-cable', 'Câblage et Connectique', 'Cables and Wiring', 'article', '#EF4444', 4, true),
('cat-auto', 'Automatismes Industriels', 'Industrial Automation', 'article', '#10B981', 5, true),
('cat-motor', 'Entraînement Moteurs', 'Motor Drives', 'article', '#06B6D4', 6, true),
('cat-measure', 'Mesure et Comptage', 'Measurement and Metering', 'article', '#EC4899', 7, true),
-- Service categories
('cat-install', 'Installation', 'Installation', 'service', '#3B82F6', 1, true),
('cat-conseil', 'Conseil', 'Consulting', 'service', '#8B5CF6', 2, true),
('cat-maint', 'Maintenance', 'Maintenance', 'service', '#10B981', 3, true),
('cat-depan', 'Dépannage', 'Repair', 'service', '#EF4444', 4, true),
('cat-renew', 'Énergies Renouvelables', 'Renewable Energy', 'service', '#F59E0B', 5, true);

-- =============================================================================
-- SECTION 17: STORE ACCESS HELPER FUNCTIONS
-- =============================================================================

-- Function to check if a user can access a specific store
CREATE OR REPLACE FUNCTION public.user_can_access_store(p_user_id UUID, p_store_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_global BOOLEAN;
  v_has_assignment BOOLEAN;
  v_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  
  -- Superadmins can always access all stores
  IF v_role = 'superadmin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has global access
  SELECT is_global INTO v_is_global 
  FROM public.user_access_profiles 
  WHERE user_id = p_user_id;
  
  IF v_is_global IS TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has specific store assignment
  SELECT EXISTS (
    SELECT 1 FROM public.user_store_assignments 
    WHERE user_id = p_user_id AND store_id = p_store_id
  ) INTO v_has_assignment;
  
  RETURN v_has_assignment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all accessible store IDs for a user
CREATE OR REPLACE FUNCTION public.get_user_accessible_stores(p_user_id UUID)
RETURNS TABLE(store_id TEXT) AS $$
DECLARE
  v_is_global BOOLEAN;
  v_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  
  -- Superadmins can access all stores
  IF v_role = 'superadmin' THEN
    RETURN QUERY SELECT s.id FROM public.stores s WHERE s.is_active = TRUE;
    RETURN;
  END IF;
  
  -- Check if user has global access
  SELECT is_global INTO v_is_global 
  FROM public.user_access_profiles 
  WHERE user_id = p_user_id;
  
  IF v_is_global IS TRUE THEN
    RETURN QUERY SELECT s.id FROM public.stores s WHERE s.is_active = TRUE;
    RETURN;
  END IF;
  
  -- Return specific store assignments
  RETURN QUERY 
    SELECT usa.store_id 
    FROM public.user_store_assignments usa
    WHERE usa.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's permissions for a specific store
CREATE OR REPLACE FUNCTION public.get_user_store_permissions(p_user_id UUID, p_store_id TEXT)
RETURNS TABLE(
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  can_view_reports BOOLEAN,
  can_manage_stock BOOLEAN,
  can_manage_users BOOLEAN
) AS $$
DECLARE
  v_is_global BOOLEAN;
  v_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  
  -- Superadmins have all permissions
  IF v_role = 'superadmin' THEN
    RETURN QUERY SELECT TRUE, TRUE, TRUE, TRUE, TRUE, TRUE;
    RETURN;
  END IF;
  
  -- Check if user has global access
  SELECT is_global INTO v_is_global 
  FROM public.user_access_profiles 
  WHERE user_id = p_user_id;
  
  IF v_is_global IS TRUE THEN
    RETURN QUERY 
      SELECT 
        COALESCE(uap.default_can_create, FALSE),
        COALESCE(uap.default_can_edit, FALSE),
        COALESCE(uap.default_can_delete, FALSE),
        COALESCE(uap.default_can_view_reports, FALSE),
        COALESCE(uap.default_can_manage_stock, FALSE),
        COALESCE(uap.default_can_manage_users, FALSE)
      FROM public.user_access_profiles uap
      WHERE uap.user_id = p_user_id;
    RETURN;
  END IF;
  
  -- Return specific store permissions
  RETURN QUERY 
    SELECT 
      COALESCE(usa.can_create, FALSE),
      COALESCE(usa.can_edit, FALSE),
      COALESCE(usa.can_delete, FALSE),
      COALESCE(usa.can_view_reports, FALSE),
      COALESCE(usa.can_manage_stock, FALSE),
      COALESCE(usa.can_manage_users, FALSE)
    FROM public.user_store_assignments usa
    WHERE usa.user_id = p_user_id AND usa.store_id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View to get user store access summary
CREATE OR REPLACE VIEW public.v_user_store_access AS
SELECT 
  p.id AS user_id,
  p.name AS user_name,
  p.email AS user_email,
  p.role AS user_role,
  COALESCE(uap.is_global, FALSE) AS is_global,
  COALESCE(uap.access_type, 'single') AS access_type,
  COALESCE(
    (SELECT COUNT(*) FROM public.user_store_assignments usa WHERE usa.user_id = p.id),
    0
  ) AS assigned_store_count,
  COALESCE(
    (SELECT array_agg(usa.store_id) FROM public.user_store_assignments usa WHERE usa.user_id = p.id),
    ARRAY[]::TEXT[]
  ) AS assigned_store_ids,
  COALESCE(
    (SELECT array_agg(s.name) 
     FROM public.user_store_assignments usa 
     JOIN public.stores s ON usa.store_id = s.id 
     WHERE usa.user_id = p.id),
    ARRAY[]::TEXT[]
  ) AS assigned_store_names
FROM public.profiles p
LEFT JOIN public.user_access_profiles uap ON p.id = uap.user_id;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.user_can_access_store(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_stores(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_store_permissions(UUID, TEXT) TO authenticated;

-- =============================================================================
-- SECTION 18: LOGGING, NOTIFICATIONS, TASKS, DOCUMENTS, AND SUPPORT
-- =============================================================================

-- 17.1 AUDIT LOG : Historique des actions
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17.2 NOTIFICATIONS AUTOMATIQUES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17.3 GESTION DES TÂCHES
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'todo',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17.4 GESTION DOCUMENTAIRE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17.5 SUPPORT UTILISATEUR
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

-- TABLE DES QUOTAS PAR BOUTIQUE
CREATE TABLE IF NOT EXISTS public.store_quotas (
  store_id TEXT PRIMARY KEY REFERENCES public.stores(id),
  max_users INTEGER DEFAULT 50,
  max_products INTEGER DEFAULT 1000,
  max_sales INTEGER DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE DES ALERTES AUTOMATIQUES
CREATE TABLE IF NOT EXISTS public.store_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  type TEXT NOT NULL, -- 'quota', 'stock', 'vente', etc.
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE POUR ARCHIVAGE DES VENTES
CREATE TABLE IF NOT EXISTS public.sales_archive (
  LIKE public.sales INCLUDING ALL
);

-- FONCTION SQL POUR ARCHIVER LES VENTES ANCIENNES (> 2 ans)
CREATE OR REPLACE FUNCTION archive_old_sales()
RETURNS void AS $$
BEGIN
  INSERT INTO public.sales_archive SELECT * FROM public.sales WHERE created_at < NOW() - INTERVAL '2 years';
  DELETE FROM public.sales WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- PLANIFICATION (exemple avec pg_cron ou tâche externe)
-- SELECT archive_old_sales();

-- TABLE DE LOGS DE PERFORMANCE
CREATE TABLE IF NOT EXISTS public.performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  details JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE DE LOGS D'ERREURS
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 20: COMMERCIAL & ACCOUNTING TABLES (MERGED FROM comptable_commercial.sql)
-- =============================================================================

-- 20.1 PLAN COMPTABLE (CHART OF ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, code)
);

-- 20.2 ECRITURES COMPTABLES (ACCOUNTING ENTRIES)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  entry_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  reference_type VARCHAR(50), -- 'invoice', 'payment', 'adjustment', etc.
  reference_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Journal entries viewable by accountants and admins" ON public.journal_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'comptable')));

-- 20.3 JOURNAL DE CAISSE (CASH JOURNAL)
CREATE TABLE IF NOT EXISTS public.cash_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
  category VARCHAR(50),
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'cash',
  reference_type VARCHAR(50),
  reference_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  balance_after DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.4 REGISTRE FISCAL (TAX RECORDS)
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tax_type VARCHAR(50) NOT NULL, -- 'TVA', 'IS', 'IR', etc.
  base_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'declared', 'paid'
  declaration_date DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.5 DEVIS (QUOTES)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) NOT NULL,
  client_id TEXT REFERENCES public.clients(id),
  prospect_id UUID, -- Can reference prospects table
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'
  valid_until DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES public.profiles(id),
  converted_to_sale_id TEXT REFERENCES public.sales(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, quote_number)
);

-- 20.6 LIGNES DE DEVIS (QUOTE ITEMS)
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  article_id TEXT REFERENCES public.articles(id),
  service_id TEXT REFERENCES public.services(id),
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.7 PROSPECTS
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  source VARCHAR(50), -- 'website', 'referral', 'social', 'cold_call', etc.
  status VARCHAR(30) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
  estimated_value DECIMAL(15,2),
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  converted_to_client_id TEXT REFERENCES public.clients(id),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.8 OBJECTIFS DE VENTE (SALES TARGETS)
CREATE TABLE IF NOT EXISTS public.sales_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  target_quantity INTEGER,
  achieved_amount DECIMAL(15,2) DEFAULT 0,
  achieved_quantity INTEGER DEFAULT 0,
  category_id TEXT REFERENCES public.categories(id),  -- Fixed: Changed from UUID to TEXT
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.9 COMMISSIONS
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  sale_id TEXT REFERENCES public.sales(id),
  commission_type VARCHAR(30) NOT NULL, -- 'percentage', 'fixed', 'tiered'
  base_amount DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.10 RAPPELS (REMINDERS)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_type VARCHAR(30), -- 'call', 'email', 'meeting', 'follow_up', 'payment', 'delivery'
  reference_type VARCHAR(50), -- 'client', 'prospect', 'sale', 'quote', 'invoice'
  reference_id UUID,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.11 INTERACTIONS CLIENTS (CLIENT INTERACTIONS)
CREATE TABLE IF NOT EXISTS public.client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id),
  prospect_id UUID REFERENCES public.prospects(id),
  user_id UUID REFERENCES public.profiles(id),
  interaction_type VARCHAR(30) NOT NULL, -- 'call', 'email', 'meeting', 'visit', 'support', 'social'
  subject VARCHAR(200),
  notes TEXT,
  outcome VARCHAR(50), -- 'positive', 'neutral', 'negative', 'pending'
  follow_up_date DATE,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20.12 REMISES (DISCOUNTS)
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed', 'buy_x_get_y'
  value DECIMAL(15,2) NOT NULL,
  min_purchase_amount DECIMAL(15,2),
  max_discount_amount DECIMAL(15,2),
  applicable_to VARCHAR(30), -- 'all', 'category', 'article', 'service', 'client'
  applicable_ids UUID[],
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, code)
);

-- =============================================================================
-- SECTION 21: ADDITIONAL INDEXES FOR COMMERCIAL TABLES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_store ON public.chart_of_accounts(store_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON public.chart_of_accounts(type);
-- Removed idx_accounting_entries_store - table doesn't have store_id column
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_account ON public.journal_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_cash_journal_store ON public.cash_journal(store_id);
CREATE INDEX IF NOT EXISTS idx_cash_journal_date ON public.cash_journal(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_records_store ON public.tax_records(store_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_period ON public.tax_records(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_quotes_store ON public.quotes(store_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_prospects_store ON public.prospects(store_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_assigned ON public.prospects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sales_targets_store ON public.sales_targets(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_user ON public.sales_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_period ON public.sales_targets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_commissions_store ON public.commissions(store_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON public.commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_reminders_store ON public.reminders(store_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_client_interactions_client ON public.client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_prospect ON public.client_interactions(prospect_id);
CREATE INDEX IF NOT EXISTS idx_discounts_store ON public.discounts(store_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- =============================================================================
-- SECTION 22: ADDITIONAL RLS POLICIES FOR COMMERCIAL TABLES
-- =============================================================================

ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
-- accounting_entries RLS already enabled in section 9.1
ALTER TABLE public.cash_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Store-based access)
CREATE POLICY "chart_of_accounts_store_access" ON public.chart_of_accounts
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

-- Note: accounting_entries table doesn't have store_id, uses global access via role-based policy

CREATE POLICY "cash_journal_store_access" ON public.cash_journal
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "tax_records_store_access" ON public.tax_records
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "quotes_store_access" ON public.quotes
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "quote_items_store_access" ON public.quote_items
  FOR ALL USING (quote_id IN (SELECT id FROM public.quotes WHERE store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid())));

CREATE POLICY "prospects_store_access" ON public.prospects
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "sales_targets_store_access" ON public.sales_targets
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "commissions_store_access" ON public.commissions
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "reminders_store_access" ON public.reminders
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "client_interactions_store_access" ON public.client_interactions
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

CREATE POLICY "discounts_store_access" ON public.discounts
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_store_assignments WHERE user_id = auth.uid()));

-- =============================================================================
-- SECTION 23: TRIGGERS FOR COMMERCIAL TABLES
-- =============================================================================

-- Auto-update timestamps
CREATE TRIGGER update_chart_of_accounts_timestamp BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_entries_timestamp BEFORE UPDATE ON public.accounting_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_records_timestamp BEFORE UPDATE ON public.tax_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_timestamp BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_timestamp BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_targets_timestamp BEFORE UPDATE ON public.sales_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_timestamp BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_timestamp BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_timestamp BEFORE UPDATE ON public.discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECTION 24: COMMERCIAL FUNCTIONS
-- =============================================================================

-- Function to convert quote to sale
CREATE OR REPLACE FUNCTION convert_quote_to_sale(p_quote_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_quote RECORD;
  v_sale_id TEXT;
BEGIN
  -- Get quote details
  SELECT * INTO v_quote FROM public.quotes WHERE id = p_quote_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found or not in accepted status';
  END IF;
  
  -- Create sale
  INSERT INTO public.sales (store_id, client_id, total, status, created_by)
  VALUES (v_quote.store_id, v_quote.client_id, v_quote.total, 'completed', v_quote.created_by)
  RETURNING id INTO v_sale_id;
  
  -- Copy quote items to sale items
  INSERT INTO public.sale_items (sale_id, article_id, service_id, quantity, price, total)
  SELECT v_sale_id, article_id, service_id, quantity, unit_price, total
  FROM public.quote_items WHERE quote_id = p_quote_id;
  
  -- Update quote status
  UPDATE public.quotes SET status = 'converted', converted_to_sale_id = v_sale_id, updated_at = NOW()
  WHERE id = p_quote_id;
  
  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert prospect to client
CREATE OR REPLACE FUNCTION convert_prospect_to_client(p_prospect_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prospect RECORD;
  v_client_id TEXT;
BEGIN
  SELECT * INTO v_prospect FROM public.prospects WHERE id = p_prospect_id AND converted_to_client_id IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect not found or already converted';
  END IF;
  
  -- Create client
  INSERT INTO public.clients (store_id, first_name, last_name, email, phone, address)
  VALUES (v_prospect.store_id, v_prospect.first_name, v_prospect.last_name, v_prospect.email, v_prospect.phone, v_prospect.address)
  RETURNING id INTO v_client_id;
  
  -- Update prospect
  UPDATE public.prospects SET status = 'won', converted_to_client_id = v_client_id, converted_at = NOW(), updated_at = NOW()
  WHERE id = p_prospect_id;
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  p_store_id TEXT,
  p_user_id UUID,
  p_sale_id TEXT,
  p_commission_rate DECIMAL DEFAULT 5.00
)
RETURNS UUID AS $$
DECLARE
  v_sale_total DECIMAL;
  v_commission_amount DECIMAL;
  v_commission_id UUID;
BEGIN
  SELECT total INTO v_sale_total FROM public.sales WHERE id = p_sale_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale not found';
  END IF;
  
  v_commission_amount := v_sale_total * (p_commission_rate / 100);
  
  INSERT INTO public.commissions (store_id, user_id, sale_id, commission_type, base_amount, commission_rate, commission_amount)
  VALUES (p_store_id, p_user_id, p_sale_id, 'percentage', v_sale_total, p_commission_rate, v_commission_amount)
  RETURNING id INTO v_commission_id;
  
  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update sales target progress
CREATE OR REPLACE FUNCTION update_sales_target_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sales_targets
  SET achieved_amount = achieved_amount + NEW.total,
      achieved_quantity = achieved_quantity + 1,
      updated_at = NOW()
  WHERE store_id = NEW.store_id
    AND user_id = NEW.created_by
    AND NEW.created_at BETWEEN period_start AND period_end;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_target_on_sale
  AFTER INSERT ON public.sales
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_sales_target_progress();

-- Function to get sales statistics
CREATE OR REPLACE FUNCTION get_sales_statistics(
  p_store_id TEXT,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_sales DECIMAL,
  total_transactions BIGINT,
  average_sale DECIMAL,
  top_seller_id UUID,
  top_seller_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0) AS total_sales,
    COUNT(s.id) AS total_transactions,
    COALESCE(AVG(s.total), 0) AS average_sale,
    (SELECT created_by FROM public.sales WHERE store_id = p_store_id AND created_at BETWEEN p_start_date AND p_end_date GROUP BY created_by ORDER BY SUM(total) DESC LIMIT 1),
    (SELECT SUM(total) FROM public.sales WHERE store_id = p_store_id AND created_at BETWEEN p_start_date AND p_end_date GROUP BY created_by ORDER BY SUM(total) DESC LIMIT 1)
  FROM public.sales s
  WHERE s.store_id = p_store_id
    AND s.created_at BETWEEN p_start_date AND p_end_date
    AND s.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SECTION 12: DEFAULT USER GROUPS & SAMPLE DATA
-- =============================================================================

-- Insert default user groups (global access for all stores)
INSERT INTO public.user_groups (id, name, description, is_company_wide) VALUES
  ('grp_superadmin', 'Super Administrateurs', 'Accès complet à toutes les fonctionnalités et tous les magasins', TRUE),
  ('grp_admin', 'Administrateurs', 'Gestion complète des magasins et utilisateurs', TRUE),
  ('grp_manager', 'Managers', 'Gestion des ventes, stock et rapports', TRUE),
  ('grp_commercial', 'Commerciaux', 'Ventes, devis et gestion clients', TRUE),
  ('grp_secretaire', 'Secr�taires', 'Accueil, ventes et support client', TRUE),
  ('grp_comptable', 'Comptables', 'Comptabilit�, rapports financiers et factures', TRUE),
  ('grp_client', 'Clients', 'Accès client - consultation produits et historique', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert permissions for each group
-- Super Admin - All permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_superadmin', 'all'),
  ('grp_superadmin', 'users.manage'),
  ('grp_superadmin', 'settings.manage'),
  ('grp_superadmin', 'stores.manage'),
  ('grp_superadmin', 'reports.view'),
  ('grp_superadmin', 'sales.manage'),
  ('grp_superadmin', 'stock.manage'),
  ('grp_superadmin', 'accounting.manage'),
  ('grp_superadmin', 'catalog.manage')
ON CONFLICT DO NOTHING;

-- Admin permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_admin', 'users.manage'),
  ('grp_admin', 'stores.manage'),
  ('grp_admin', 'reports.view'),
  ('grp_admin', 'sales.manage'),
  ('grp_admin', 'stock.manage'),
  ('grp_admin', 'accounting.view'),
  ('grp_admin', 'catalog.manage')
ON CONFLICT DO NOTHING;

-- Manager permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_manager', 'reports.view'),
  ('grp_manager', 'sales.manage'),
  ('grp_manager', 'stock.manage'),
  ('grp_manager', 'catalog.view'),
  ('grp_manager', 'users.view')
ON CONFLICT DO NOTHING;

-- Commercial permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_commercial', 'sales.create'),
  ('grp_commercial', 'sales.view'),
  ('grp_commercial', 'clients.manage'),
  ('grp_commercial', 'quotes.manage'),
  ('grp_commercial', 'catalog.view')
ON CONFLICT DO NOTHING;

-- Secretaire permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_secretaire', 'sales.create'),
  ('grp_secretaire', 'sales.view'),
  ('grp_secretaire', 'clients.view'),
  ('grp_secretaire', 'catalog.view')
ON CONFLICT DO NOTHING;

-- Comptable permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_comptable', 'accounting.manage'),
  ('grp_comptable', 'reports.view'),
  ('grp_comptable', 'sales.view'),
  ('grp_comptable', 'invoices.manage')
ON CONFLICT DO NOTHING;

-- Client permissions
INSERT INTO public.user_group_permissions (group_id, permission) VALUES
  ('grp_client', 'catalog.view'),
  ('grp_client', 'orders.view'),
  ('grp_client', 'profile.edit')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF CONSOLIDATED DATABASE SCHEMA
-- =============================================================================

-- =============================================================================
-- POST-INSTALLATION: CREATE USERS
-- =============================================================================
-- 
-- IMPORTANT: Supabase requires users to be created through the Authentication API.
-- Run the following steps AFTER executing this SQL script:
--
-- STEP 1: Create users in Supabase Dashboard
-- ==========================================
-- Go to Authentication > Users > Add User > Create New User
-- Create the following users:
--
-- | Email                | Password   | Role        |
-- |----------------------|------------|-------------|
-- | nestor@sps.com       | Burny667   | superadmin  |
-- | admin@sps.com        | admin123   | admin       |
-- | manager@sps.com      | admin123   | manager     |
-- | commercial@sps.com   | admin123   | commercial  |
-- | secretaire@sps.com   | admin123   | secretaire  |
-- | comptable@sps.com    | admin123   | comptable   |
--
-- STEP 2: Run this SQL to update their profiles
-- ==============================================
-- After creating users in the dashboard, run this SQL:

-- =============================================================================
-- STEP 2: AFTER creating users in Supabase Authentication Dashboard
-- Run these commands to configure the profiles and permissions
-- =============================================================================

-- First verify the user exists (should return 1 row)
-- SELECT id, email, name, role FROM public.profiles WHERE email = 'nestor@sps.com';

-- Update Nestor as superadmin
UPDATE public.profiles 
SET role = 'superadmin', name = 'Nestor', is_active = TRUE 
WHERE email = 'nestor@sps.com';

-- Update other staff members (only after creating them in Authentication)
UPDATE public.profiles SET role = 'admin', name = 'Admin SPS', is_active = TRUE WHERE email = 'admin@sps.com';
UPDATE public.profiles SET role = 'manager', name = 'Manager SPS', is_active = TRUE WHERE email = 'manager@sps.com';
UPDATE public.profiles SET role = 'commercial', name = 'Commercial SPS', is_active = TRUE WHERE email = 'commercial@sps.com';
UPDATE public.profiles SET role = 'secretaire', name = 'Secrétaire SPS', is_active = TRUE WHERE email = 'secretaire@sps.com';
UPDATE public.profiles SET role = 'comptable', name = 'Comptable SPS', is_active = TRUE WHERE email = 'comptable@sps.com';

-- Give all users global access
INSERT INTO public.user_access_profiles (user_id, is_global, access_type, default_can_create, default_can_edit, default_can_delete, default_can_view_reports, default_can_manage_stock, default_can_manage_users)
SELECT id, TRUE, 'global', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE FROM public.profiles WHERE role = 'superadmin'
ON CONFLICT (user_id) DO UPDATE SET 
  is_global = TRUE, 
  access_type = 'global',
  default_can_create = TRUE,
  default_can_edit = TRUE,
  default_can_delete = TRUE,
  default_can_view_reports = TRUE,
  default_can_manage_stock = TRUE,
  default_can_manage_users = TRUE;

INSERT INTO public.user_access_profiles (user_id, is_global, access_type, default_can_create, default_can_edit, default_can_delete, default_can_view_reports, default_can_manage_stock, default_can_manage_users)
SELECT id, TRUE, 'global', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE FROM public.profiles WHERE role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET 
  is_global = TRUE, 
  access_type = 'global',
  default_can_create = TRUE,
  default_can_edit = TRUE,
  default_can_delete = TRUE,
  default_can_view_reports = TRUE,
  default_can_manage_stock = TRUE,
  default_can_manage_users = FALSE;

INSERT INTO public.user_access_profiles (user_id, is_global, access_type, default_can_create, default_can_edit, default_can_view_reports, default_can_manage_stock)
SELECT id, TRUE, 'global', TRUE, TRUE, TRUE, TRUE FROM public.profiles WHERE role = 'manager'
ON CONFLICT (user_id) DO UPDATE SET 
  is_global = TRUE, 
  access_type = 'global',
  default_can_create = TRUE,
  default_can_edit = TRUE,
  default_can_view_reports = TRUE,
  default_can_manage_stock = TRUE;

INSERT INTO public.user_access_profiles (user_id, is_global, access_type, default_can_create, default_can_edit)
SELECT id, TRUE, 'global', TRUE, TRUE FROM public.profiles WHERE role IN ('commercial', 'secretaire')
ON CONFLICT (user_id) DO UPDATE SET 
  is_global = TRUE, 
  access_type = 'global',
  default_can_create = TRUE,
  default_can_edit = TRUE;

INSERT INTO public.user_access_profiles (user_id, is_global, access_type, default_can_view_reports)
SELECT id, TRUE, 'global', TRUE FROM public.profiles WHERE role = 'comptable'
ON CONFLICT (user_id) DO UPDATE SET 
  is_global = TRUE, 
  access_type = 'global',
  default_can_view_reports = TRUE;

-- Verify the setup worked
SELECT 
  p.email,
  p.name,
  p.role,
  p.is_active,
  uap.is_global,
  uap.access_type,
  uap.default_can_manage_users
FROM public.profiles p
LEFT JOIN public.user_access_profiles uap ON p.id = uap.user_id
WHERE p.email IN ('nestor@sps.com', 'admin@sps.com')
ORDER BY p.email;

-- =============================================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SECTION 20: ADVANCED FEATURES (2026-01-23)
-- =============================================================================
-- Module Securite, Images, Emails, Promotions & Fidelite

-- 20.1 Enrichir user_sessions existante
DO $$
BEGIN
  ALTER TABLE public.user_sessions 
    ADD COLUMN IF NOT EXISTS device_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
    ADD COLUMN IF NOT EXISTS os VARCHAR(100),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS token TEXT,
    ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_device_type_check') THEN
    ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_device_type_check 
      CHECK (device_type IN ('desktop', 'mobile', 'tablet'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE public.user_sessions RENAME COLUMN started_at TO created_at;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'created_at') THEN
    ALTER TABLE public.user_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- 20.2 Table audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'login', 'logout', 'create', 'update', 'delete', 
        'export', 'import', 'permission_change', 'settings_change', 'failed_login'
    )),
    action TEXT NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());

-- 20.3 Table user_2fa
CREATE TABLE IF NOT EXISTS public.user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    secret TEXT NOT NULL,
    backup_codes TEXT[],
    is_enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own 2FA config" ON public.user_2fa;
DROP POLICY IF EXISTS "Users can update own 2FA config" ON public.user_2fa;
CREATE POLICY "Users can view own 2FA config" ON public.user_2fa FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own 2FA config" ON public.user_2fa FOR ALL USING (user_id = auth.uid());

-- 20.4 Table failed_login_attempts
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    reason VARCHAR(100),
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON public.failed_login_attempts(ip_address);
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.5 Table security_alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'multiple_failed_logins', 'new_device_login', 'suspicious_location',
        'unusual_activity', 'permission_escalation', 'mass_data_export', 'after_hours_access'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.security_alerts;
CREATE POLICY "Users can view own alerts" ON public.security_alerts FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.6 Table password_history
CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON public.password_history(user_id);
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- 20.7 Table images
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON public.images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON public.images(uploaded_at DESC);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Images viewable by authenticated users" ON public.images;
DROP POLICY IF EXISTS "Admins can manage images" ON public.images;
CREATE POLICY "Images viewable by authenticated users" ON public.images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage images" ON public.images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.8 Table email_config
CREATE TABLE IF NOT EXISTS public.email_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    auto_send_order_confirmation BOOLEAN DEFAULT TRUE,
    auto_send_invoice BOOLEAN DEFAULT TRUE,
    auto_send_quote BOOLEAN DEFAULT FALSE,
    auto_send_stock_alert BOOLEAN DEFAULT TRUE,
    auto_send_welcome BOOLEAN DEFAULT TRUE,
    stock_alert_recipients TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id)
);

ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage email config" ON public.email_config;
CREATE POLICY "Admins can manage email config" ON public.email_config FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.9 Table email_history
CREATE TABLE IF NOT EXISTS public.email_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE SET NULL,
    template_type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    metadata JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_history_recipient ON public.email_history(recipient);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON public.email_history(status);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON public.email_history(sent_at DESC);

ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email history" ON public.email_history;
CREATE POLICY "Admins can view email history" ON public.email_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.10 Table promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(12,2) DEFAULT 0,
    max_discount_amount DECIMAL(12,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON public.promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON public.promo_codes(valid_from, valid_until);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promo codes viewable by authenticated users" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Promo codes viewable by authenticated users" ON public.promo_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'commercial'))
);

-- 20.11 Table loyalty_program
CREATE TABLE IF NOT EXISTS public.loyalty_program (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_per_currency DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    currency_per_point DECIMAL(10,2) NOT NULL DEFAULT 10.0,
    min_points_to_redeem INTEGER NOT NULL DEFAULT 100,
    tier_bronze_threshold DECIMAL(12,2) DEFAULT 0,
    tier_silver_threshold DECIMAL(12,2) DEFAULT 500000,
    tier_gold_threshold DECIMAL(12,2) DEFAULT 2000000,
    tier_platinum_threshold DECIMAL(12,2) DEFAULT 5000000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.loyalty_program (name, description, points_per_currency, currency_per_point, min_points_to_redeem)
VALUES ('Programme Fidelite SaddlePoint', 'Gagnez des points a chaque achat et beneficiez d''avantages exclusifs', 1.0, 10.0, 1000)
ON CONFLICT DO NOTHING;

ALTER TABLE public.loyalty_program ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Loyalty program viewable by all" ON public.loyalty_program;
DROP POLICY IF EXISTS "Admins can manage loyalty program" ON public.loyalty_program;
CREATE POLICY "Loyalty program viewable by all" ON public.loyalty_program FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage loyalty program" ON public.loyalty_program FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
);

-- 20.12 Table customer_loyalty
CREATE TABLE IF NOT EXISTS public.customer_loyalty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    loyalty_program_id UUID REFERENCES public.loyalty_program(id) ON DELETE CASCADE,
    available_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    current_tier VARCHAR(20) DEFAULT 'bronze' CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_updated_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, loyalty_program_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_loyalty_client ON public.customer_loyalty(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_tier ON public.customer_loyalty(current_tier);

ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own loyalty" ON public.customer_loyalty;
DROP POLICY IF EXISTS "Admins can view all loyalty" ON public.customer_loyalty;
CREATE POLICY "Users can view own loyalty" ON public.customer_loyalty FOR SELECT USING (auth.uid()::text = client_id);
CREATE POLICY "Admins can view all loyalty" ON public.customer_loyalty FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'commercial'))
);

-- 20.13 Table loyalty_transactions
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_loyalty_id UUID NOT NULL REFERENCES public.customer_loyalty(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust')),
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    sale_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_loyalty_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON public.loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created ON public.loyalty_transactions(created_at DESC);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- 20.14 Fonctions utilitaires
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts() RETURNS void AS $$
BEGIN
    DELETE FROM public.failed_login_attempts WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION limit_password_history() RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.password_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM public.password_history
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_limit_password_history ON public.password_history;
CREATE TRIGGER trigger_limit_password_history
AFTER INSERT ON public.password_history
FOR EACH ROW EXECUTE FUNCTION limit_password_history();

CREATE OR REPLACE FUNCTION detect_brute_force_attempt(
    p_email VARCHAR,
    p_ip_address INET,
    p_time_window_minutes INT DEFAULT 15,
    p_max_attempts INT DEFAULT 5
) RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INT;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM public.failed_login_attempts
    WHERE email = p_email
    AND ip_address = p_ip_address
    AND attempted_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes;
    
    RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- 20.15 Vues utiles
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.*,
    p.email as user_email,
    p.name as user_name,
    p.role as user_role
FROM public.user_sessions s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.last_activity > NOW() - INTERVAL '30 minutes'
AND (s.expires_at > NOW() OR s.expires_at IS NULL)
ORDER BY s.last_activity DESC;

CREATE OR REPLACE VIEW audit_stats_by_user AS
SELECT 
    user_id,
    user_name,
    user_role,
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE severity = 'success') as successful_actions,
    COUNT(*) FILTER (WHERE severity = 'error') as failed_actions,
    COUNT(*) FILTER (WHERE severity = 'warning') as warning_actions,
    MAX(timestamp) as last_action
FROM public.audit_logs
GROUP BY user_id, user_name, user_role;

CREATE OR REPLACE VIEW unacknowledged_alerts AS
SELECT 
    a.*,
    p.email as user_email,
    p.name as user_name
FROM public.security_alerts a
LEFT JOIN public.profiles p ON a.user_id = p.id
WHERE NOT a.is_acknowledged
ORDER BY 
    CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;

CREATE OR REPLACE VIEW recent_failed_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(attempted_at) as last_attempt,
    array_agg(DISTINCT reason) as failure_reasons
FROM public.failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) >= 3
ORDER BY COUNT(*) DESC, MAX(attempted_at) DESC;

-- =============================================================================
-- VERIFICATION QUERIES (Run these to verify installation)
-- =============================================================================
-- 
-- Check all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
--
-- Check settings tables have default values:
-- SELECT * FROM public.company_settings;
-- SELECT * FROM public.app_settings;
-- SELECT * FROM public.sales_settings;
-- SELECT * FROM public.regional_settings;
-- SELECT * FROM public.integration_settings;
--
-- Check RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- =============================================================================

-- Final message
DO $$
BEGIN
  RAISE NOTICE '=======================================================================';
  RAISE NOTICE 'Saddle Point Service database schema installed successfully!';
  RAISE NOTICE '=======================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'MODULES INSTALLES:';
  RAISE NOTICE '  * Gestion commerciale complete';
  RAISE NOTICE '  * Module Securite (2FA, Audit, Sessions)';
  RAISE NOTICE '  * Module Images (Upload, Galerie)';
  RAISE NOTICE '  * Module Emails (SMTP, Historique)';
  RAISE NOTICE '  * Module Promotions & Fidelite';
  RAISE NOTICE '';
  RAISE NOTICE 'PROCHAINES ETAPES:';
  RAISE NOTICE '   1. Create your first user in Authentication > Users';
  RAISE NOTICE '   2. Update their profile to role = superadmin';
  RAISE NOTICE '   3. Configure your .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  RAISE NOTICE '   4. Launch your application!';
  RAISE NOTICE '';
END $$;

