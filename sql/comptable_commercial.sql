-- =============================================================================
-- FONCTIONNALITÉS COMPTABLE ET SERVICE COMMERCIAL
-- =============================================================================

-- =============================================================================
-- SECTION: FONCTIONNALITÉS COMPTABLE
-- =============================================================================

-- FACTURES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  client_id UUID REFERENCES public.clients(id),
  invoice_number TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'invoice' CHECK (type IN ('invoice', 'quote', 'credit_note')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_store ON public.invoices(store_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);

-- PAIEMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  invoice_id UUID REFERENCES public.invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'mobile_money', 'other')),
  payment_date DATE DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_store ON public.payments(store_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);

-- JOURNAL DE CAISSE
CREATE TABLE public.cash_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference TEXT,
  journal_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cash_journal_store ON public.cash_journal(store_id);
CREATE INDEX idx_cash_journal_date ON public.cash_journal(journal_date);

-- ÉCRITURES COMPTABLES
CREATE TABLE public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  entry_date DATE DEFAULT CURRENT_DATE,
  account_code TEXT NOT NULL,
  label TEXT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  reference TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounting_entries_store ON public.accounting_entries(store_id);
CREATE INDEX idx_accounting_entries_date ON public.accounting_entries(entry_date);

-- PLAN COMPTABLE
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  type TEXT CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  parent_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TVA
CREATE TABLE public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  collected_tax DECIMAL(15,2) DEFAULT 0,
  deductible_tax DECIMAL(15,2) DEFAULT 0,
  net_tax DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'declared', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION: FONCTIONNALITÉS SERVICE COMMERCIAL
-- =============================================================================

-- DEVIS
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  client_id UUID REFERENCES public.clients(id),
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  valid_until DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  converted_to_invoice UUID REFERENCES public.invoices(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_store ON public.quotes(store_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_client ON public.quotes(client_id);

-- LIGNES DE DEVIS
CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROSPECTS
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost')),
  assigned_to UUID REFERENCES public.profiles(id),
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prospects_store ON public.prospects(store_id);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_assigned ON public.prospects(assigned_to);

-- OBJECTIFS COMMERCIAUX
CREATE TABLE public.sales_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  user_id UUID REFERENCES public.profiles(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  achieved_amount DECIMAL(15,2) DEFAULT 0,
  target_count INTEGER,
  achieved_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_targets_user ON public.sales_targets(user_id);
CREATE INDEX idx_sales_targets_store ON public.sales_targets(store_id);

-- COMMISSIONS
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  sale_id UUID,
  amount DECIMAL(15,2) NOT NULL,
  rate DECIMAL(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  period_start DATE,
  period_end DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_user ON public.commissions(user_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);

-- RELANCES
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  type TEXT CHECK (type IN ('quote', 'invoice', 'prospect', 'client', 'other')),
  related_id UUID,
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON public.reminders(user_id);
CREATE INDEX idx_reminders_due ON public.reminders(due_date);

-- HISTORIQUE ÉCHANGES CLIENTS
CREATE TABLE public.client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  prospect_id UUID REFERENCES public.prospects(id),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'note', 'other')),
  subject TEXT,
  content TEXT,
  interaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_interactions_client ON public.client_interactions(client_id);
CREATE INDEX idx_client_interactions_prospect ON public.client_interactions(prospect_id);

-- REMISES ET PROMOTIONS
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES public.stores(id),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('percent', 'fixed')),
  value DECIMAL(15,2) NOT NULL,
  min_purchase DECIMAL(15,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discounts_store ON public.discounts(store_id);
CREATE INDEX idx_discounts_active ON public.discounts(is_active);
