-- =============================================================================
-- FONCTIONS SQL ADDITIONNELLES POUR COMPTABLE ET COMMERCIAL
-- =============================================================================

-- Fonction pour convertir un devis en vente
CREATE OR REPLACE FUNCTION convert_quote_to_sale(quote_id UUID)
RETURNS UUID AS $$
DECLARE
  v_quote RECORD;
  v_sale_id UUID;
BEGIN
  -- Récupérer le devis
  SELECT * INTO v_quote FROM public.quotes WHERE id = quote_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devis non trouvé';
  END IF;
  
  IF v_quote.status = 'converted' THEN
    RAISE EXCEPTION 'Ce devis a déjà été converti';
  END IF;
  
  -- Créer la vente (adapter selon votre structure de table sales)
  INSERT INTO public.sales (
    store_id,
    client_id,
    total,
    status,
    notes,
    created_by,
    created_at
  ) VALUES (
    v_quote.store_id,
    v_quote.client_id,
    v_quote.total,
    'completed',
    'Converti depuis devis ' || v_quote.quote_number,
    v_quote.created_by,
    NOW()
  ) RETURNING id INTO v_sale_id;
  
  -- Copier les articles du devis vers la vente
  INSERT INTO public.sale_items (sale_id, product_id, service_id, description, quantity, unit_price, total)
  SELECT v_sale_id, product_id, service_id, description, quantity, unit_price, total
  FROM public.quote_items
  WHERE quote_id = v_quote.id;
  
  -- Mettre à jour le statut du devis
  UPDATE public.quotes
  SET status = 'converted',
      converted_to_sale_id = v_sale_id,
      updated_at = NOW()
  WHERE id = quote_id;
  
  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour convertir un prospect en client
CREATE OR REPLACE FUNCTION convert_prospect_to_client(prospect_id UUID)
RETURNS UUID AS $$
DECLARE
  v_prospect RECORD;
  v_client_id UUID;
BEGIN
  -- Récupérer le prospect
  SELECT * INTO v_prospect FROM public.prospects WHERE id = prospect_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect non trouvé';
  END IF;
  
  IF v_prospect.status = 'converted' THEN
    RAISE EXCEPTION 'Ce prospect a déjà été converti';
  END IF;
  
  -- Créer le client
  INSERT INTO public.clients (
    store_id,
    name,
    email,
    phone,
    address,
    notes,
    created_at
  ) VALUES (
    v_prospect.store_id,
    v_prospect.company_name,
    v_prospect.email,
    v_prospect.phone,
    v_prospect.address,
    'Converti depuis prospect. Contact: ' || v_prospect.contact_name || '. ' || COALESCE(v_prospect.notes, ''),
    NOW()
  ) RETURNING id INTO v_client_id;
  
  -- Mettre à jour le statut du prospect
  UPDATE public.prospects
  SET status = 'converted',
      converted_client_id = v_client_id,
      updated_at = NOW()
  WHERE id = prospect_id;
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer automatiquement les commissions sur vente
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_commission_rate DECIMAL(5,2);
  v_commission_amount DECIMAL(15,2);
BEGIN
  -- Récupérer l'utilisateur qui a fait la vente
  v_user_id := NEW.created_by;
  
  -- Taux de commission par défaut (peut être personnalisé par utilisateur)
  v_commission_rate := 5.00; -- 5%
  
  -- Calculer le montant de la commission
  v_commission_amount := NEW.total * (v_commission_rate / 100);
  
  -- Créer l'entrée de commission
  INSERT INTO public.commissions (
    user_id,
    sale_id,
    store_id,
    sale_amount,
    commission_rate,
    amount,
    status,
    created_at
  ) VALUES (
    v_user_id,
    NEW.id,
    NEW.store_id,
    NEW.total,
    v_commission_rate,
    v_commission_amount,
    'pending',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer les commissions automatiquement
DROP TRIGGER IF EXISTS trigger_calculate_commission ON public.sales;
CREATE TRIGGER trigger_calculate_commission
  AFTER INSERT ON public.sales
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION calculate_commission();

-- Fonction pour mettre à jour les objectifs de vente
CREATE OR REPLACE FUNCTION update_sales_target()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le montant réalisé pour tous les objectifs concernés
  UPDATE public.sales_targets
  SET achieved_amount = achieved_amount + NEW.total,
      updated_at = NOW()
  WHERE user_id = NEW.created_by
    AND store_id = NEW.store_id
    AND NEW.created_at BETWEEN period_start AND period_end;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les objectifs
DROP TRIGGER IF EXISTS trigger_update_sales_target ON public.sales;
CREATE TRIGGER trigger_update_sales_target
  AFTER INSERT ON public.sales
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_sales_target();

-- Fonction pour vérifier et marquer les factures en retard
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status IN ('pending', 'partial')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier et marquer les devis expirés
CREATE OR REPLACE FUNCTION check_expired_quotes()
RETURNS void AS $$
BEGIN
  UPDATE public.quotes
  SET status = 'expired',
      updated_at = NOW()
  WHERE status IN ('draft', 'sent', 'pending')
    AND validity_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Vue pour le tableau de bord comptable
CREATE OR REPLACE VIEW v_accounting_dashboard AS
SELECT 
  store_id,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices,
  COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices,
  SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as total_paid,
  SUM(CASE WHEN status IN ('pending', 'partial') THEN total - paid_amount ELSE 0 END) as total_outstanding,
  SUM(CASE WHEN status = 'overdue' THEN total - paid_amount ELSE 0 END) as total_overdue
FROM public.invoices
WHERE created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY store_id;

-- Vue pour le tableau de bord commercial
CREATE OR REPLACE VIEW v_commercial_dashboard AS
SELECT 
  store_id,
  COUNT(DISTINCT q.id) as total_quotes,
  COUNT(CASE WHEN q.status = 'accepted' OR q.status = 'converted' THEN 1 END) as accepted_quotes,
  SUM(CASE WHEN q.status = 'pending' THEN q.total ELSE 0 END) as pending_quotes_value,
  COUNT(DISTINCT p.id) as total_prospects,
  COUNT(CASE WHEN p.status = 'converted' THEN 1 END) as converted_prospects,
  SUM(CASE WHEN p.status NOT IN ('converted', 'lost') THEN p.estimated_value ELSE 0 END) as pipeline_value
FROM public.quotes q
FULL OUTER JOIN public.prospects p ON q.store_id = p.store_id
WHERE q.created_at >= date_trunc('month', CURRENT_DATE)
   OR p.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY COALESCE(q.store_id, p.store_id);

-- Ajout de colonnes manquantes si nécessaire
DO $$
BEGIN
  -- Ajouter converted_client_id à prospects si manquant
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prospects' AND column_name = 'converted_client_id') THEN
    ALTER TABLE public.prospects ADD COLUMN converted_client_id UUID REFERENCES public.clients(id);
  END IF;
END $$;

-- RLS Policies pour les nouvelles tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs voient les données de leur boutique
CREATE POLICY invoices_store_policy ON public.invoices
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()));

CREATE POLICY payments_store_policy ON public.payments
  FOR ALL USING (invoice_id IN (
    SELECT id FROM public.invoices WHERE store_id IN (
      SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY cash_journal_store_policy ON public.cash_journal
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()));

CREATE POLICY quotes_store_policy ON public.quotes
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()));

CREATE POLICY prospects_store_policy ON public.prospects
  FOR ALL USING (store_id IN (SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()));

CREATE POLICY commissions_user_policy ON public.commissions
  FOR ALL USING (user_id = auth.uid() OR store_id IN (
    SELECT store_id FROM public.user_stores WHERE user_id = auth.uid()
  ));

CREATE POLICY reminders_user_policy ON public.reminders
  FOR ALL USING (user_id = auth.uid());
