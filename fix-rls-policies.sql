-- ============================================
-- SCRIPT DE NETTOYAGE ET CRÉATION DES POLITIQUES RLS
-- Exécutez ce script si vous avez des erreurs de conflit de politiques
-- ============================================

-- 1. Supprimer TOUTES les politiques existantes pour bookings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON bookings';
    END LOOP;
END $$;

-- 2. Supprimer TOUTES les politiques existantes pour drivers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'drivers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON drivers';
    END LOOP;
END $$;

-- 3. Maintenant créer les nouvelles politiques sécurisées

-- Bookings : INSERT public uniquement
CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Bookings : Bloquer SELECT/UPDATE/DELETE directs
CREATE POLICY "No direct read access to bookings"
  ON bookings FOR SELECT
  USING (false);

CREATE POLICY "No direct update access to bookings"
  ON bookings FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete access to bookings"
  ON bookings FOR DELETE
  USING (false);

-- Drivers : Bloquer tous les accès directs
CREATE POLICY "No direct access to drivers"
  ON drivers FOR SELECT
  USING (false);

CREATE POLICY "No direct update access to drivers"
  ON drivers FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete access to drivers"
  ON drivers FOR DELETE
  USING (false);

-- Note: Ces politiques bloquent tout accès direct. 
-- Seul le service_role (via votre API avec createAdminClient) peut accéder à ces données.

