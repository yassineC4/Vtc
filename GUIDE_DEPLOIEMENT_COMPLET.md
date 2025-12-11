# 🚀 Guide Complet de Déploiement - Du Début à la Fin

Ce guide vous accompagne étape par étape pour déployer votre application VTC sur Vercel.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte GitHub
- ✅ Un compte Vercel (gratuit : [vercel.com](https://vercel.com))
- ✅ Un compte Supabase (gratuit : [supabase.com](https://supabase.com))
- ✅ Un compte Google Cloud (pour l'API Google Maps)
- ✅ Votre code poussé sur GitHub : `yassineC4/Vtc`

---

## 🗑️ ÉTAPE 1 : Supprimer le Déploiement Actuel sur Vercel

### 1.1 Accéder à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte (GitHub, GitLab, etc.)

### 1.2 Supprimer le Projet

1. Dans votre tableau de bord Vercel, trouvez votre projet **"vtc-phi"** (ou le nom actuel)
2. Cliquez sur votre projet pour l'ouvrir
3. Allez dans l'onglet **"Settings"** (Paramètres) en haut
4. Faites défiler jusqu'en bas de la page
5. Trouvez la section **"Danger Zone"** (Zone de danger)
6. Cliquez sur **"Delete Project"** (Supprimer le projet)
7. Tapez le nom du projet pour confirmer
8. Cliquez sur **"Delete"** (Supprimer)

✅ **Résultat** : Votre projet et tous ses déploiements sont supprimés.

---

## 📦 ÉTAPE 2 : Préparer Votre Projet

### 2.1 Vérifier que le Code est sur GitHub

1. Ouvrez votre terminal
2. Allez dans le dossier de votre projet :
```bash
cd "/Users/yassine/Desktop/projet vtc"
```

3. Vérifiez le statut Git :
```bash
git status
```

4. Si vous avez des modifications non commitées, ajoutez-les :
```bash
git add .
git commit -m "Préparation pour le déploiement"
git push
```

### 2.2 Vérifier que le Dépôt est Public (optionnel)

1. Allez sur [github.com/yassineC4/Vtc](https://github.com/yassineC4/Vtc)
2. Vérifiez que vous pouvez voir le code (si privé, c'est OK aussi, Vercel y a accès)

---

## 🔑 ÉTAPE 3 : Préparer Vos Clés et Identifiants

Avant de déployer, vous aurez besoin de ces informations :

### 3.1 Clés Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet (ou créez-en un si nécessaire)
3. Allez dans **Settings** (⚙️) > **API**
4. Notez ces 3 valeurs (gardez-les ouvertes, vous en aurez besoin) :
   - **Project URL** → Ce sera `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (clé publique) → Ce sera `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (clé secrète) → Ce sera `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important** : Ne partagez JAMAIS la clé `service_role` publiquement !

### 3.2 Clé API Google Maps

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet (ou créez-en un)
3. Allez dans **APIs & Services** > **Library**
4. Activez ces APIs (si pas déjà fait) :
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
   - ✅ **Distance Matrix API**
   - ✅ **Geocoding API** (optionnel)

5. Allez dans **APIs & Services** > **Credentials**
6. Si vous n'avez pas de clé API :
   - Cliquez sur **"+ CREATE CREDENTIALS"**
   - Sélectionnez **"API key"**
   - Une clé est créée automatiquement
7. **Copiez votre clé API** → Ce sera `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

⚠️ **Note** : Nous configurerons les restrictions de domaine après le déploiement.

### 3.3 URL de l'Application (optionnel)

Pour l'instant, notez :
- `NEXT_PUBLIC_APP_URL` = `https://vtc-phi.vercel.app` (ou votre futur domaine)

---

## 🚀 ÉTAPE 4 : Créer un Nouveau Projet sur Vercel

### 4.1 Démarrer la Création

1. Sur [vercel.com](https://vercel.com), cliquez sur **"Add New..."** ou **"New Project"**
2. Si demandé, autorisez l'accès à GitHub (si pas déjà fait)

### 4.2 Importer le Dépôt

1. Dans la liste des dépôts, cherchez **"Vtc"** ou **"yassineC4/Vtc"**
2. Si vous ne le voyez pas :
   - Cliquez sur **"Adjust GitHub App Permissions"**
   - Autorisez l'accès au dépôt
   - Rechargez la page
3. Cliquez sur **"Import"** à côté de votre dépôt

### 4.3 Configuration du Projet

Vercel devrait détecter automatiquement que c'est un projet Next.js.

**Vérifiez ces paramètres** :

- **Framework Preset** : `Next.js` ✅
- **Root Directory** : `./` (par défaut) ✅
- **Build Command** : `npm run build` ✅ (défaut)
- **Output Directory** : `.next` ✅ (défaut)
- **Install Command** : `npm install` ✅ (défaut)

**Ne cliquez pas encore sur "Deploy" !** On va d'abord configurer les variables d'environnement.

---

## 🔐 ÉTAPE 5 : Configurer les Variables d'Environnement

### 5.1 Ajouter les Variables

Dans la page de configuration, trouvez la section **"Environment Variables"**.

**Ajoutez chaque variable une par une** :

#### Variable 1 : Supabase URL

1. Cliquez sur **"Add"** ou **"Add Another"**
2. Remplissez :
   - **Key** : `NEXT_PUBLIC_SUPABASE_URL`
   - **Value** : Collez votre URL Supabase (ex: `https://xxxxx.supabase.co`)
   - **Environments** : Cochez les 3 cases :
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. Cliquez sur **"Add"** ou laissez tel quel pour passer à la suivante

#### Variable 2 : Supabase Anon Key

1. Ajoutez une nouvelle variable :
   - **Key** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value** : Collez votre clé anonyme Supabase (commence souvent par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Environments** : ✅ Production ✅ Preview ✅ Development

#### Variable 3 : Supabase Service Role Key

1. Ajoutez une nouvelle variable :
   - **Key** : `SUPABASE_SERVICE_ROLE_KEY`
   - **Value** : Collez votre clé service_role (⚠️ C'est une clé secrète, longue)
   - **Environments** : ✅ Production ✅ Preview ✅ Development

#### Variable 4 : Google Maps API Key

1. Ajoutez une nouvelle variable :
   - **Key** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value** : Collez votre clé API Google Maps
   - **Environments** : ✅ Production ✅ Preview ✅ Development

#### Variable 5 : App URL (optionnel)

1. Ajoutez une nouvelle variable :
   - **Key** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://vtc-phi.vercel.app` (ou laissez Vercel générer un nom)
   - **Environments** : ✅ Production ✅ Preview ✅ Development

### 5.2 Vérifier les Variables

Vous devriez maintenant avoir 5 variables configurées :
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`

---

## 🚢 ÉTAPE 6 : Déployer

### 6.1 Lancer le Déploiement

1. Une fois toutes les variables ajoutées, cliquez sur **"Deploy"**
2. Vercel va maintenant :
   - Installer les dépendances (`npm install`)
   - Builder votre application (`npm run build`)
   - Déployer sur leurs serveurs

### 6.2 Suivre le Progrès

1. Vous verrez une page de déploiement avec :
   - **Building...** (en cours de construction)
   - Des logs en temps réel
   - Le temps écoulé

2. ⏳ **Attendez** : Le premier déploiement prend généralement **2-5 minutes**

3. Quand c'est terminé, vous verrez :
   - ✅ **Ready** (Prêt)
   - Une URL : `https://vtc-phi-xxxxx.vercel.app` (ou similaire)

### 6.3 Vérifier les Logs

Si le déploiement échoue :

1. Regardez les **logs de build** (affichés sur la page)
2. Cherchez des erreurs en rouge
3. Erreurs courantes :
   - **Variables d'environnement manquantes** → Vérifiez l'étape 5
   - **Erreurs de build TypeScript** → Vérifiez votre code
   - **Dépendances manquantes** → Vérifiez `package.json`

---

## ✅ ÉTAPE 7 : Vérifier le Déploiement

### 7.1 Visiter le Site

1. Cliquez sur l'URL fournie par Vercel (ex: `https://vtc-phi.vercel.app`)
2. Votre site devrait s'afficher !

### 7.2 Tester les Fonctionnalités

**Test 1 : Page d'accueil**
- [ ] Le site se charge
- [ ] Le contenu s'affiche correctement
- [ ] Pas d'erreurs dans la console (F12 > Console)

**Test 2 : Calculateur de Prix**
- [ ] Cliquez sur "Lieu de départ"
- [ ] Tapez une adresse (ex: "Paris")
- [ ] L'autocomplétion Google Maps apparaît ✅
- [ ] Sélectionnez une adresse
- [ ] Faites de même pour "Lieu d'arrivée"
- [ ] Cliquez sur "Estimer le prix"
- [ ] Le prix s'affiche sans erreur ✅

**Test 3 : Autres Sections**
- [ ] Les destinations populaires s'affichent
- [ ] Les avis clients s'affichent
- [ ] Le bouton WhatsApp fonctionne

---

## 🗺️ ÉTAPE 8 : Configurer les Restrictions Google Maps

Pour sécuriser votre clé API Google Maps :

### 8.1 Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. Cliquez sur votre clé API Google Maps

### 8.2 Configurer les Restrictions

#### Application Restrictions

1. Dans **"Application restrictions"**, sélectionnez :
   - **"HTTP referrers (web sites)"**
2. Cliquez sur **"Add an item"**
3. Ajoutez ces domaines un par un :

```
https://vtc-phi.vercel.app/*
```

```
https://*.vercel.app/*
```

```
http://localhost:3000/*
```

4. Cliquez sur **"Save"**

#### API Restrictions (Optionnel mais Recommandé)

1. Dans **"API restrictions"**, sélectionnez :
   - **"Restrict key"**
2. Cochez uniquement ces APIs :
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Distance Matrix API
   - ✅ Geocoding API
3. Cliquez sur **"Save"**

⚠️ **Important** : Attendez **5 minutes** après avoir sauvegardé pour que les restrictions prennent effet.

### 8.3 Vérifier que ça Fonctionne

1. Attendez 5 minutes
2. Rechargez votre site : https://vtc-phi.vercel.app
3. Testez à nouveau le calculateur de prix
4. Tout devrait fonctionner normalement ✅

---

## 🎯 ÉTAPE 9 : Configuration Finale

### 9.1 Nom du Projet (Optionnel)

Pour avoir une URL plus simple :

1. Dans Vercel, allez dans **Settings** > **General**
2. Dans **"Project Name"**, vous pouvez changer le nom
3. L'URL sera : `https://[nom-du-projet].vercel.app`

### 9.2 Domaine Personnalisé (Optionnel)

Si vous avez votre propre domaine :

1. Allez dans **Settings** > **Domains**
2. Ajoutez votre domaine
3. Suivez les instructions DNS

### 9.3 Vérifier les Variables (Encore une fois)

Pour être sûr que tout est bien configuré :

1. Allez dans **Settings** > **Environment Variables**
2. Vérifiez que les 5 variables sont bien là
3. Vous pouvez cliquer sur chaque variable pour voir son nom (pas sa valeur, c'est sécurisé)

---

## 📊 ÉTAPE 10 : Déploiements Automatiques

### 10.1 Comment ça Fonctionne

Par défaut, Vercel déploie automatiquement :
- ✅ À chaque push sur la branche `main` → Déploiement en **Production**
- ✅ À chaque Pull Request → Déploiement en **Preview**

### 10.2 Tester un Déploiement Automatique

1. Faites une petite modification dans votre code
2. Committez et poussez :
```bash
git add .
git commit -m "Test déploiement automatique"
git push
```

3. Allez sur Vercel
4. Vous verrez un nouveau déploiement en cours automatiquement !

---

## ✅ Checklist Finale

Avant de considérer que tout est terminé, vérifiez :

- [ ] Projet créé sur Vercel
- [ ] Dépôt GitHub connecté
- [ ] Toutes les variables d'environnement configurées (5 variables)
- [ ] Déploiement réussi (statut "Ready")
- [ ] Site accessible sur l'URL Vercel
- [ ] Calculateur de prix fonctionne
- [ ] Google Maps autocomplétion fonctionne
- [ ] Restrictions Google Maps configurées
- [ ] Aucune erreur dans la console du navigateur
- [ ] Déploiements automatiques fonctionnent

---

## 🐛 Résolution de Problèmes

### Problème : "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined"

**Solution** :
1. Vérifiez dans Vercel > Settings > Environment Variables
2. Assurez-vous que la variable est bien là avec le nom exact : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Redéployez après avoir ajouté/modifié les variables

### Problème : "Google Maps API error: This API key is not authorized"

**Solution** :
1. Vérifiez dans Google Cloud Console que les APIs sont activées
2. Vérifiez que vous avez ajouté les restrictions HTTP referrers correctement
3. Attendez 5 minutes après avoir modifié les restrictions

### Problème : Le site ne se charge pas

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Regardez s'il y a des erreurs TypeScript ou de build
3. Vérifiez que toutes les dépendances sont dans `package.json`

### Problème : Erreur Supabase

**Solution** :
1. Vérifiez que vos clés Supabase sont correctes
2. Vérifiez que votre base de données Supabase est active
3. Vérifiez que le schéma SQL a été exécuté (`supabase-schema.sql`)

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans Vercel (Deployments > Cliquez sur un déploiement > Logs)
2. **Vérifiez la console du navigateur** (F12 > Console)
3. **Vérifiez les variables d'environnement** sont bien configurées
4. **Consultez la documentation** :
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)

---

## 🎉 Félicitations !

Si toutes les étapes sont terminées et que tout fonctionne, votre application VTC est maintenant :
- ✅ Déployée en production
- ✅ Accessible publiquement
- ✅ Configurée avec toutes les API nécessaires
- ✅ Prête à recevoir des clients !

---

**Dernière mise à jour** : Décembre 2024

