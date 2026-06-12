-- ============================================================================
-- SYNCHRONISATION AUTOMATIQUE: CLIENTS <-> PROFILES
-- ============================================================================
-- 
-- Ce script crée des triggers pour synchroniser automatiquement
-- les données entre la table 'clients' et la table 'profiles'
-- 
-- UTILISATION:
-- 1. Ouvrez Supabase Dashboard > SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez (Run)
-- 
-- RÉSULTAT:
-- - Création d'un client → Crée aussi un profile avec role='client'
-- - Modification d'un client → Met à jour le profile correspondant
-- - Désactivation d'un client → Désactive aussi le profile
-- ============================================================================

-- ============================================================================
-- FONCTION 1: Synchroniser client vers profile (INSERT)
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_client_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer ou mettre à jour le profile correspondant
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    address,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.name,
    NEW.email,
    NEW.phone,
    NEW.address,
    'client',
    NEW.is_active,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    is_active = EXCLUDED.is_active,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION 2: Synchroniser client vers profile (UPDATE)
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_client_update_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le profile si il existe
  UPDATE public.profiles SET
    name = NEW.name,
    email = NEW.email,
    phone = NEW.phone,
    address = NEW.address,
    is_active = NEW.is_active,
    updated_at = NEW.updated_at
  WHERE id = NEW.id AND role = 'client';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION 3: Synchroniser profile vers client (INSERT)
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_profile_to_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement pour les profiles avec role='client'
  IF NEW.role = 'client' THEN
    INSERT INTO public.clients (
      id,
      name,
      email,
      phone,
      address,
      client_type,
      is_active,
      total_spent,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.email,
      NEW.phone,
      NEW.address,
      'individual',
      NEW.is_active,
      0,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      is_active = EXCLUDED.is_active,
      updated_at = EXCLUDED.updated_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION 4: Synchroniser profile vers client (UPDATE)
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_profile_update_to_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement pour les profiles avec role='client'
  IF NEW.role = 'client' THEN
    UPDATE public.clients SET
      name = NEW.name,
      email = NEW.email,
      phone = NEW.phone,
      address = NEW.address,
      is_active = NEW.is_active,
      updated_at = NEW.updated_at
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRÉER LES TRIGGERS
-- ============================================================================

-- Supprimer les triggers existants si présents
DROP TRIGGER IF EXISTS trigger_sync_client_to_profile ON public.clients;
DROP TRIGGER IF EXISTS trigger_sync_client_update_to_profile ON public.clients;
DROP TRIGGER IF EXISTS trigger_sync_profile_to_client ON public.profiles;
DROP TRIGGER IF EXISTS trigger_sync_profile_update_to_client ON public.profiles;

-- TRIGGER 1: Quand un client est créé → Créer le profile
CREATE TRIGGER trigger_sync_client_to_profile
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_client_to_profile();

-- TRIGGER 2: Quand un client est modifié → Mettre à jour le profile
CREATE TRIGGER trigger_sync_client_update_to_profile
  AFTER UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_client_update_to_profile();

-- TRIGGER 3: Quand un profile client est créé → Créer le client
CREATE TRIGGER trigger_sync_profile_to_client
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_to_client();

-- TRIGGER 4: Quand un profile client est modifié → Mettre à jour le client
CREATE TRIGGER trigger_sync_profile_update_to_client
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_update_to_client();

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ SYNCHRONISATION ACTIVÉE!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Les triggers suivants ont été créés:';
  RAISE NOTICE '  1. trigger_sync_client_to_profile (INSERT)';
  RAISE NOTICE '  2. trigger_sync_client_update_to_profile (UPDATE)';
  RAISE NOTICE '  3. trigger_sync_profile_to_client (INSERT)';
  RAISE NOTICE '  4. trigger_sync_profile_update_to_client (UPDATE)';
  RAISE NOTICE '';
  RAISE NOTICE 'RÉSULTAT:';
  RAISE NOTICE '  - Création client → Profile créé automatiquement';
  RAISE NOTICE '  - Modification client → Profile synchronisé';
  RAISE NOTICE '  - Création profile (role=client) → Client créé';
  RAISE NOTICE '  - Modification profile (role=client) → Client synchronisé';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
END $$;

-- ============================================================================
-- TEST (Optionnel - décommentez pour tester)
-- ============================================================================
/*
-- Test 1: Créer un client
INSERT INTO clients (id, name, email, phone, address, client_type, is_active)
VALUES (gen_random_uuid(), 'Test Client Sync', 'test@sync.cm', '+237 6 00 00 00 00', 'Test Address', 'individual', true);

-- Vérifier que le profile a été créé
SELECT * FROM profiles WHERE name = 'Test Client Sync';

-- Test 2: Modifier le client
UPDATE clients SET name = 'Test Client Modifié' WHERE name = 'Test Client Sync';

-- Vérifier que le profile a été mis à jour
SELECT * FROM profiles WHERE name = 'Test Client Modifié';
*/
