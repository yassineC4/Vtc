# Comment Configurer les Variables d'Environnement sur Vercel

Votre application est déployée sur Vercel, mais la clé API Google Maps n'est pas configurée. Suivez ces étapes :

## 🔧 Étape 1 : Accéder aux Paramètres de Votre Projet

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur votre projet **"vtc-phi"** (ou le nom de votre projet)
3. Cliquez sur l'onglet **"Settings"** (Paramètres) en haut
4. Dans le menu de gauche, cliquez sur **"Environment Variables"** (Variables d'environnement)

## 🔑 Étape 2 : Ajouter la Clé API Google Maps

1. Cliquez sur **"Add New"** ou **"Add"**
2. Remplissez les champs :
   - **Key (Nom)** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value (Valeur)** : Collez votre clé API Google Maps
   - **Environments** : Cochez **Production**, **Preview**, et **Development** (ou au minimum **Production**)
3. Cliquez sur **"Save"**

## 📋 Vérifier Toutes les Variables Nécessaires

Assurez-vous que toutes ces variables sont configurées :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Dashboard Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (⚠️ SECRET) | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clé API Google Maps | Google Cloud Console |

## 🔄 Étape 3 : Redéployer l'Application

Après avoir ajouté les variables :

1. **Option A - Redéploiement automatique** : 
   - Allez dans l'onglet **"Deployments"**
   - Cliquez sur les **"..."** (trois points) du dernier déploiement
   - Cliquez sur **"Redeploy"**
   - Sélectionnez **"Use existing Build Cache"** ou laissez tel quel
   - Cliquez sur **"Redeploy"**

2. **Option B - Nouveau déploiement via Git** :
   - Faites un petit changement (ajoutez un espace dans un fichier)
   - Commitez et poussez :
   ```bash
   git add .
   git commit -m "Trigger redeploy for environment variables"
   git push
   ```

## ✅ Étape 4 : Vérifier que ça Fonctionne

1. Attendez que le redéploiement se termine (2-5 minutes)
2. Visitez votre site : https://vtc-phi.vercel.app
3. Testez le calculateur de prix :
   - Les champs d'adresse devraient se charger sans erreur
   - L'autocomplétion Google Maps devrait fonctionner
   - Le calcul de distance/prix devrait fonctionner

## 🗺️ Étape 5 : Configurer les Restrictions Google Maps (Important)

Pour sécuriser votre clé API Google Maps :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Naviguez vers **APIs & Services** > **Credentials**
3. Cliquez sur votre clé API Google Maps
4. Dans **"Application restrictions"**, sélectionnez **"HTTP referrers (web sites)"**
5. Ajoutez ces domaines :
   ```
   https://vtc-phi.vercel.app/*
   https://*.vercel.app/*
   ```
   (Pour autoriser aussi les previews de branches)
6. Cliquez sur **"Save"**

## 🔍 Vérifier les APIs Activées

Assurez-vous que ces APIs sont activées dans Google Cloud Console :
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Distance Matrix API
- ✅ Geocoding API (optionnel)

## ❓ Problèmes Courants

### "La clé API n'est toujours pas reconnue après le redéploiement"
→ Attendez 1-2 minutes supplémentaires. Les variables peuvent prendre un peu de temps à se propager.

### "Erreur CORS ou clé API invalide"
→ Vérifiez que vous avez ajouté le domaine Vercel dans les restrictions Google Maps (étape 5)

### "Les APIs ne sont pas activées"
→ Allez dans Google Cloud Console > APIs & Services > Library et activez les APIs nécessaires

## 📞 Besoin d'Aide ?

Si vous avez toujours des problèmes :
1. Vérifiez les logs de déploiement dans Vercel (onglet "Deployments" > cliquez sur un déploiement > "Logs")
2. Vérifiez la console du navigateur (F12) pour d'autres erreurs
3. Vérifiez que votre clé API Google Maps est valide et a les quotas nécessaires


