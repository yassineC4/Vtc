-- ============================================
-- SCHEMA SUPABASE POUR APPLICATION VTC
-- Version sécurisée (peut être exécutée plusieurs fois)
-- ============================================

-- Table des paramètres de configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis clients
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des destinations populaires
CREATE TABLE IF NOT EXISTS popular_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address TEXT NOT NULL,
  icon TEXT, -- Nom de l'icône (ex: 'airport', 'train', 'location')
  fixed_price NUMERIC NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des chauffeurs
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations (bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  departure_address TEXT NOT NULL,
  arrival_address TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  ride_type TEXT NOT NULL CHECK (ride_type IN ('immediate', 'reservation')),
  vehicle_category TEXT NOT NULL CHECK (vehicle_category IN ('standard', 'berline', 'van')),
  is_round_trip BOOLEAN DEFAULT false,
  number_of_passengers INTEGER NOT NULL DEFAULT 1,
  baby_seat BOOLEAN DEFAULT false,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
  estimated_price NUMERIC NOT NULL,
  estimated_distance NUMERIC,
  estimated_duration INTEGER, -- en minutes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  driver_assigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_popular_destinations_active ON popular_destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_popular_destinations_order ON popular_destinations(display_order);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Insertion de la valeur par défaut pour price_per_km
INSERT INTO settings (key, value) 
VALUES ('price_per_km', 1.50)
ON CONFLICT (key) DO NOTHING;

-- Insertion des destinations populaires par défaut
INSERT INTO popular_destinations (name_fr, name_en, address, icon, fixed_price, display_order) VALUES
('Aéroport CDG', 'CDG Airport', '95700 Roissy-en-France', 'airplane', 60.00, 1),
('Aéroport Orly', 'Orly Airport', '94390 Orly', 'airplane', 50.00, 2),
('Gare du Nord', 'Gare du Nord', '75010 Paris', 'train', 25.00, 3),
('Gare de Lyon', 'Gare de Lyon', '75012 Paris', 'train', 30.00, 4),
('Disneyland Paris', 'Disneyland Paris', '77700 Chessy', 'mapPin', 70.00, 5),
('Gare Montparnasse', 'Gare Montparnasse', '75014 Paris', 'train', 35.00, 6)
ON CONFLICT DO NOTHING;

-- Insertion des 7 chauffeurs par défaut
INSERT INTO drivers (first_name, last_name, phone, email, is_online) VALUES
('Jean', 'Dupont', '0612345678', 'jean.dupont@vtc.com', false),
('Marie', 'Martin', '0623456789', 'marie.martin@vtc.com', false),
('Pierre', 'Bernard', '0634567890', 'pierre.bernard@vtc.com', false),
('Sophie', 'Dubois', '0645678901', 'sophie.dubois@vtc.com', false),
('Lucas', 'Moreau', '0656789012', 'lucas.moreau@vtc.com', false),
('Emma', 'Laurent', '0667890123', 'emma.laurent@vtc.com', false),
('Thomas', 'Simon', '0678901234', 'thomas.simon@vtc.com', false)
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers s'ils existent déjà (pour éviter les erreurs)
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_popular_destinations_updated_at ON popular_destinations;

-- Créer les triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popular_destinations_updated_at
  BEFORE UPDATE ON popular_destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur les tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes pour éviter les conflits
-- (Certaines peuvent avoir été créées par d'autres scripts)

-- Supprimer les politiques settings
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- Supprimer les politiques reviews
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Anyone can create a review" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

-- Supprimer les politiques popular_destinations
DROP POLICY IF EXISTS "Active destinations are viewable by everyone" ON popular_destinations;

-- Supprimer TOUTES les politiques bookings (anciennes et nouvelles)
DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Public insert for bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "No direct read access to bookings" ON bookings;
DROP POLICY IF EXISTS "No direct update access to bookings" ON bookings;
DROP POLICY IF EXISTS "No direct delete access to bookings" ON bookings;

-- Supprimer TOUTES les politiques drivers
DROP POLICY IF EXISTS "No direct access to drivers" ON drivers;
DROP POLICY IF EXISTS "No direct update access to drivers" ON drivers;
DROP POLICY IF EXISTS "No direct delete access to drivers" ON drivers;

-- Politique pour settings : Lecture publique, écriture admin uniquement
CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT
  USING (true);

-- Politique pour reviews : Lecture publique des avis approuvés, écriture publique pour création
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can create a review"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Politique pour popular_destinations : Lecture publique des destinations actives
CREATE POLICY "Active destinations are viewable by everyone"
  ON popular_destinations FOR SELECT
  USING (is_active = true);

-- Politique pour bookings : Création publique, lecture/modification admin uniquement (via service role)
CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- ✅ SÉCURITÉ CRITIQUE: Bloquer tout accès direct à bookings (SELECT/UPDATE/DELETE)
-- Seul le service_role (via API) peut accéder à ces données
CREATE POLICY "No direct read access to bookings"
  ON bookings FOR SELECT
  USING (false);

CREATE POLICY "No direct update access to bookings"
  ON bookings FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete access to bookings"
  ON bookings FOR DELETE
  USING (false);

-- ✅ SÉCURITÉ CRITIQUE: Bloquer tout accès direct à drivers
-- Seul le service_role (via API) peut accéder à ces données
CREATE POLICY "No direct access to drivers"
  ON drivers FOR SELECT
  USING (false);

CREATE POLICY "No direct update access to drivers"
  ON drivers FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete access to drivers"
  ON drivers FOR DELETE
  USING (false);

-- Note: Pour les opérations UPDATE/DELETE sur reviews et settings,
-- vous devrez créer des politiques spécifiques basées sur l'authentification
-- ou utiliser le service role de Supabase côté serveur

-- Exemple de politique pour les admins (à adapter selon votre système d'auth)
-- CREATE POLICY "Admins can update settings"
--   ON settings FOR UPDATE
--   USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can manage reviews"
--   ON reviews FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

