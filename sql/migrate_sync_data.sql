-- ============================================================================
-- MIGRATION: SYNCHRONISER LES DONNÉES EXISTANTES
-- ============================================================================
-- 
-- Ce script migre les données existantes pour créer la synchronisation:
-- 1. Tous les profiles avec role='client' → Créer dans 'clients'
-- 2. Tous les clients existants → Créer dans 'profiles'
-- 
-- UTILISATION:
-- 1. Ouvrez Supabase Dashboard > SQL Editor
-- 2. Exécutez d'abord: sync_clients_profiles.sql (pour les triggers)
-- 3. Puis exécutez ce script
-- ============================================================================

DO $$
DECLARE
  profiles_migrated INTEGER := 0;
  clients_migrated INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'MIGRATION: SYNCHRONISATION DES DONNÉES EXISTANTES';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  
  -- =========================================================================
  -- ÉTAPE 1: Migrer les profiles (role='client') vers clients
  -- =========================================================================
  RAISE NOTICE 'Étape 1: Migration profiles → clients...';
  
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
  )
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.address,
    'individual' as client_type,
    p.is_active,
    0 as total_spent,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.role = 'client'
    AND NOT EXISTS (
      SELECT 1 FROM public.clients c WHERE c.id = p.id
    );
  
  GET DIAGNOSTICS profiles_migrated = ROW_COUNT;
  RAISE NOTICE '  ✅ % profile(s) migrés vers clients', profiles_migrated;
  
  -- =========================================================================
  -- ÉTAPE 2: Migrer les clients vers profiles
  -- =========================================================================
  RAISE NOTICE '';
  RAISE NOTICE 'Étape 2: Migration clients → profiles...';
  
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
  )
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.address,
    'client' as role,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM public.clients c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = c.id
  );
  
  GET DIAGNOSTICS clients_migrated = ROW_COUNT;
  RAISE NOTICE '  ✅ % client(s) migrés vers profiles', clients_migrated;
  
  -- =========================================================================
  -- RÉSUMÉ
  -- =========================================================================
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'MIGRATION TERMINÉE!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Résumé:';
  RAISE NOTICE '  - Profiles → Clients: % enregistrement(s)', profiles_migrated;
  RAISE NOTICE '  - Clients → Profiles: % enregistrement(s)', clients_migrated;
  RAISE NOTICE '';
  RAISE NOTICE 'Total synchronisé: % enregistrement(s)', profiles_migrated + clients_migrated;
  RAISE NOTICE '';
  
  -- Statistiques finales
  DECLARE
    total_clients INTEGER;
    total_profiles_client INTEGER;
  BEGIN
    SELECT COUNT(*) INTO total_clients FROM public.clients;
    SELECT COUNT(*) INTO total_profiles_client FROM public.profiles WHERE role = 'client';
    
    RAISE NOTICE 'État actuel:';
    RAISE NOTICE '  - Table clients: % enregistrement(s)', total_clients;
    RAISE NOTICE '  - Table profiles (role=client): % enregistrement(s)', total_profiles_client;
    
    IF total_clients = total_profiles_client THEN
      RAISE NOTICE '';
      RAISE NOTICE '✅ SYNCHRONISATION PARFAITE!';
      RAISE NOTICE '   Les deux tables ont le même nombre d''enregistrements.';
    ELSE
      RAISE NOTICE '';
      RAISE NOTICE '⚠️  ATTENTION: Les tables ne sont pas parfaitement synchronisées.';
      RAISE NOTICE '   Différence: % enregistrement(s)', ABS(total_clients - total_profiles_client);
    END IF;
  END;
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- VÉRIFICATION DÉTAILLÉE (Optionnel)
-- ============================================================================
/*
-- Voir tous les clients
SELECT 'CLIENTS' as table_name, id, name, email, phone FROM clients
UNION ALL
SELECT 'PROFILES' as table_name, id, name, email, phone FROM profiles WHERE role = 'client'
ORDER BY name;

-- Trouver les incohérences
SELECT 'Client sans profile' as issue, c.id, c.name 
FROM clients c 
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.id AND p.role = 'client')
UNION ALL
SELECT 'Profile sans client' as issue, p.id, p.name 
FROM profiles p 
WHERE p.role = 'client' 
  AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = p.id);
*/
