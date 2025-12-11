# Application VTC - Chauffeur Privé

Application web complète pour une agence de transport VTC avec calcul de course, gestion des avis et panel administrateur.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/UI**
- **Supabase** (Base de données + Auth)
- **Google Maps API** (Places Autocomplete + Distance Matrix)

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
```

3. **Configurer Supabase :**
   - Créer un nouveau projet Supabase
   - Exécuter le script SQL dans `supabase-schema.sql` via l'éditeur SQL de Supabase

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
- **Railway** ou **Render** - Autres options populaires

Le guide inclut des instructions détaillées pour chaque plateforme, la configuration des variables d'environnement, et la résolution de problèmes courants.

## 🔐 Authentification Admin

L'accès au panel admin (`/admin`) nécessite une authentification Supabase. Configurez vos utilisateurs admin dans Supabase Auth.

## 🌍 Internationalisation

L'application supporte le Français (par défaut), l'Anglais et l'Arabe. Le sélecteur de langue est disponible dans le header.

## 📝 Fonctionnalités

- ✅ Calcul automatique de course avec Google Maps
- ✅ Réservation via WhatsApp avec formulaire de détails
- ✅ Destinations populaires avec prix fixes
- ✅ Gestion des avis clients avec modération
- ✅ Panel admin pour configuration et modération
- ✅ Support multilingue (FR/EN/AR)
- ✅ Section "Pourquoi nous choisir" (Value Proposition)
- ✅ Service de mise à disposition de chauffeur

## 📁 Structure Principale

```
src/
├── app/              # Pages Next.js (App Router)
│   ├── page.tsx      # Page d'accueil
│   ├── admin/        # Panel admin (protégé)
│   └── legal/        # Mentions légales
├── components/       # Composants React
│   ├── home/         # Composants page d'accueil
│   ├── admin/        # Composants admin
│   └── ui/           # Composants Shadcn/UI
├── lib/              # Utilitaires
│   ├── supabase/     # Clients Supabase
│   └── google-maps.ts # Helpers Google Maps
└── locales/          # Traductions FR/EN/AR
```

## 🔗 URLs Importantes

- **Accueil** : http://localhost:3000
- **Admin Login** : http://localhost:3000/admin/login
- **Admin Panel** : http://localhost:3000/admin
- **Mentions Légales** : http://localhost:3000/legal
