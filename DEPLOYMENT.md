# Guide de Déploiement - Application VTC

Ce guide vous aidera à déployer votre application Next.js sur différentes plateformes.

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir :

1. ✅ Un compte Supabase avec votre base de données configurée
2. ✅ Une clé API Google Maps (avec Places API et Distance Matrix API activées)
3. ✅ Un compte sur la plateforme de déploiement choisie
4. ✅ Votre projet versionné sur GitHub/GitLab/Bitbucket (recommandé)

## 🚀 Option 1 : Déploiement sur Vercel (Recommandé)

Vercel est la plateforme officielle pour Next.js, offrant un déploiement automatique et des performances optimales.

### Étape 1 : Préparer votre projet

1. Assurez-vous que votre projet est sur GitHub/GitLab/Bitbucket
2. Vérifiez que votre `.gitignore` exclut les fichiers `.env*.local`

### Étape 2 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub/GitLab/Bitbucket

### Étape 3 : Déployer le projet

1. Cliquez sur **"Add New Project"**
2. Importez votre dépôt Git
3. Configurez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Clé service role Supabase
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Clé API Google Maps

4. Configurez les paramètres de build :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `npm install` (par défaut)

5. Cliquez sur **"Deploy"**

### Étape 4 : Configurer les domaines Google Maps

⚠️ **Important** : Ajoutez votre domaine Vercel dans les restrictions de votre clé API Google Maps :
1. Allez dans [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services > Credentials
3. Modifiez votre clé API Google Maps
4. Dans "Application restrictions" > "HTTP referrers", ajoutez :
   ```
   https://votre-projet.vercel.app/*
   https://*.vercel.app/*
   ```

### Avantages Vercel :
- ✅ Déploiement automatique à chaque push
- ✅ Prévisualisation pour chaque Pull Request
- ✅ SSL gratuit
- ✅ CDN global
- ✅ Analytics intégrés (optionnel)

---

## 🌐 Option 2 : Déploiement sur Netlify

### Étape 1 : Préparer le projet

1. Créez un fichier `netlify.toml` à la racine :
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. Commitez et poussez sur votre dépôt Git

### Étape 2 : Déployer sur Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez sur **"Add new site"** > **"Import an existing project"**
3. Connectez votre dépôt Git
4. Configurez :
   - **Build command** : `npm run build`
   - **Publish directory** : `.next`

5. Ajoutez les variables d'environnement dans **Site settings > Environment variables**

6. Déployez !

### Étape 3 : Configurer Google Maps API

Ajoutez votre domaine Netlify dans les restrictions Google Maps :
```
https://votre-projet.netlify.app/*
https://*.netlify.app/*
```

---

## 🚂 Option 3 : Déploiement sur Railway

### Étape 1 : Installer Railway CLI (optionnel)

```bash
npm i -g @railway/cli
railway login
```

### Étape 2 : Déployer

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"** > **"Deploy from GitHub repo"**
3. Sélectionnez votre dépôt
4. Railway détectera automatiquement Next.js

### Étape 3 : Variables d'environnement

Dans votre projet Railway :
1. Allez dans **Variables**
2. Ajoutez toutes les variables d'environnement nécessaires

### Étape 4 : Configurer le port

Railway assigne automatiquement un port via la variable `PORT`. Next.js utilise `3000` par défaut, mais Railway gère cela automatiquement.

---

## 🔧 Option 4 : Déploiement sur Render

### Étape 1 : Créer un service Web

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"New +"** > **"Web Service"**
3. Connectez votre dépôt Git

### Étape 2 : Configuration

- **Name** : Nom de votre service
- **Environment** : Node
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`
- **Plan** : Free ou Starter (selon vos besoins)

### Étape 3 : Variables d'environnement

Ajoutez toutes les variables nécessaires dans **Environment**

---

## 🔒 Sécurité - Variables d'environnement

### Variables à configurer :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Dashboard Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (⚠️ SECRET) | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clé API Google Maps | Google Cloud Console |

⚠️ **Important** : 
- Ne jamais commiter les fichiers `.env*.local`
- `SUPABASE_SERVICE_ROLE_KEY` est très sensible, ne la partagez jamais publiquement
- Utilisez toujours les variables d'environnement fournies par votre plateforme de déploiement

---

## 🗄️ Configuration Supabase

### Avant le déploiement :

1. **Vérifiez que votre schéma SQL est appliqué**
   - Allez dans Supabase Dashboard > SQL Editor
   - Exécutez le contenu de `supabase-schema.sql`

2. **Configurez les politiques RLS (Row Level Security)**
   - Assurez-vous que les politiques sont correctement configurées pour votre cas d'usage

3. **Configurez les utilisateurs admin**
   - Créez vos utilisateurs admin dans Supabase Auth
   - Ces utilisateurs pourront accéder à `/admin`

---

## 🗺️ Configuration Google Maps API

### Restrictions HTTP referrers recommandées :

Pour la production, restreignez votre clé API aux domaines autorisés :

```
https://votre-domaine.com/*
https://*.votre-domaine.com/*
https://votre-projet.vercel.app/*  (si Vercel)
https://*.vercel.app/*              (si Vercel - pour les previews)
https://votre-projet.netlify.app/*  (si Netlify)
https://*.netlify.app/*             (si Netlify)
```

### APIs nécessaires :

Assurez-vous que ces APIs sont activées dans Google Cloud Console :
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Distance Matrix API
- ✅ Geocoding API (si nécessaire)

---

## ✅ Checklist post-déploiement

Après le déploiement, vérifiez :

- [ ] L'application se charge correctement
- [ ] Les images s'affichent
- [ ] Le calcul de course fonctionne (testez avec des adresses réelles)
- [ ] Le formulaire de réservation fonctionne
- [ ] La connexion admin fonctionne (`/admin/login`)
- [ ] Les traductions fonctionnent (FR/EN/AR)
- [ ] Les avis s'affichent et peuvent être créés
- [ ] Les destinations populaires s'affichent
- [ ] WhatsApp s'ouvre avec les bonnes informations

---

## 🐛 Résolution de problèmes

### Erreur "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Vérifiez que toutes les variables d'environnement sont bien définies dans votre plateforme
- Redéployez après avoir ajouté les variables

### Google Maps ne charge pas
- Vérifiez que votre clé API est correcte
- Vérifiez que les restrictions de domaine autorisent votre domaine de production
- Vérifiez que les APIs nécessaires sont activées

### Erreurs CORS
- Vérifiez la configuration Supabase (Settings > API > CORS)
- Ajoutez votre domaine de production dans les origines autorisées

### Build échoue
- Vérifiez les logs de build pour identifier l'erreur
- Testez le build en local : `npm run build`
- Vérifiez que toutes les dépendances sont dans `package.json`

---

## 📞 Support

En cas de problème, consultez :
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Google Maps](https://developers.google.com/maps/documentation)

