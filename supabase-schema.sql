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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_popular_destinations_active ON popular_destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_popular_destinations_order ON popular_destinations(display_order);

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

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur les tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_destinations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques si elles existent déjà (pour éviter les erreurs)
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Anyone can create a review" ON reviews;
DROP POLICY IF EXISTS "Active destinations are viewable by everyone" ON popular_destinations;

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

