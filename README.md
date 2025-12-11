# Application VTC - Chauffeur Privé

Application web complète pour une agence de transport VTC avec gestion de flotte, dispatch de chauffeurs, calcul de course et intégration WhatsApp.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/UI**
- **Supabase** (Base de données + Auth)
- **Google Maps API** (Places Autocomplete + Distance Matrix)
- **WhatsApp Integration** (Système de réservation)

## 📋 Prérequis

- Node.js 18+ et npm/yarn
- Compte Supabase
- Clé API Google Maps (avec Places API et Distance Matrix API activées)

## 🛠️ Installation

1. **Cloner et installer les dépendances :**
```bash
npm install
```

2. **Configurer les variables d'environnement :**
Créer un fichier `.env.local` avec :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Configurer Supabase :**
   - Créer un nouveau projet Supabase
   - Exécuter le script SQL dans `supabase-schema.sql` via l'éditeur SQL de Supabase
   - Créer un utilisateur admin dans Authentication > Users

4. **Lancer le projet :**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🚀 Déploiement

Pour déployer votre application en production, consultez le guide complet dans **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

**Options recommandées :**
- **Vercel** (recommandé pour Next.js) - Déploiement en quelques minutes
- **Netlify** - Alternative simple et gratuite

## 🔐 Authentification Admin

L'accès au panel admin (`/admin`) nécessite une authentification Supabase.

1. Créer un utilisateur dans Supabase → Authentication → Users
2. Cocher "Auto Confirm User" lors de la création
3. Se connecter sur `/admin/login` avec les identifiants créés

## 📱 Flux de Réservation WhatsApp

Le système utilise un flux semi-automatisé basé sur WhatsApp :

1. **Client** : Remplit le formulaire → Réservation enregistrée → WhatsApp s'ouvre avec message pré-rempli vers l'admin
2. **Admin** : Voit les réservations en attente → Assigne un chauffeur → WhatsApp s'ouvre avec message de confirmation vers le client

Consultez **[FLUX_WHATSAPP.md](./FLUX_WHATSAPP.md)** pour plus de détails.

## 🎯 Fonctionnalités Principales

### Côté Client
- ✅ Calcul automatique de course avec Google Maps
- ✅ Réservation via formulaire avec redirection WhatsApp
- ✅ Destinations populaires avec prix fixes
- ✅ Gestion des avis clients
- ✅ Support multilingue (FR/EN/AR)

### Côté Admin
- ✅ Dashboard de dispatch avec planning visuel (Gantt)
- ✅ Gestion de flotte (7 chauffeurs)
- ✅ Assignation de courses avec notification WhatsApp
- ✅ Gestion des réservations (statuts : pending → confirmed → in_progress → completed)
- ✅ Configuration des prix et paramètres
- ✅ Gestion des avis (modération)
- ✅ Gestion des destinations populaires

## 📁 Structure Principale

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── admin/             # Panel admin (protégé)
│   │   ├── page.tsx       # Dashboard dispatch
│   │   ├── drivers/       # Gestion chauffeurs
│   │   ├── bookings/      # Gestion réservations
│   │   └── planning/      # Planning journalier
│   └── api/               # Routes API
├── components/            # Composants React
│   ├── home/              # Composants page d'accueil
│   ├── admin/             # Composants admin
│   │   ├── DispatchDashboard.tsx
│   │   ├── PendingBookingsList.tsx
│   │   ├── DriverTimelineGantt.tsx
│   │   └── AssignDriverModal.tsx
│   └── ui/                # Composants Shadcn/UI
├── lib/                   # Utilitaires
│   ├── supabase/          # Clients Supabase
│   ├── google-maps.ts     # Helpers Google Maps
│   └── whatsapp.ts        # Formatage numéros WhatsApp
└── locales/               # Traductions FR/EN/AR
```

## 🔗 URLs Importantes

- **Accueil** : http://localhost:3000
- **Admin Login** : http://localhost:3000/admin/login
- **Admin Panel** : http://localhost:3000/admin
- **Planning Dispatch** : http://localhost:3000/admin (page principale)
- **Gestion Chauffeurs** : http://localhost:3000/admin/drivers
- **Gestion Réservations** : http://localhost:3000/admin/bookings

## 📊 Base de Données

Les tables principales :

- **`drivers`** : Chauffeurs (nom, téléphone, email, statut en ligne)
- **`bookings`** : Réservations (client, trajet, date, statut, chauffeur assigné)
- **`reviews`** : Avis clients (en attente → approuvé)
- **`popular_destinations`** : Destinations avec prix fixes
- **`settings`** : Paramètres de l'application

## 🔒 Sécurité

- Toutes les routes API admin sont protégées par authentification
- Les pages admin nécessitent une session Supabase valide
- Les variables d'environnement sensibles ne sont jamais commitées

## 🌍 Internationalisation

L'application supporte le Français (par défaut), l'Anglais et l'Arabe. Le sélecteur de langue est disponible dans le header.

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Construire pour la production
npm run start        # Démarrer le serveur de production
npm run lint         # Linter le code
npm run check-env    # Vérifier les variables d'environnement
```

## 📚 Documentation Supplémentaire

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide de déploiement détaillé
- **[FLUX_WHATSAPP.md](./FLUX_WHATSAPP.md)** - Documentation du flux WhatsApp
