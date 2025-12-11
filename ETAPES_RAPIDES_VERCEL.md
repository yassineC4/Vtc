# 🚀 Guide Rapide : Déploiement sur Vercel

## ✅ Prérequis Vérifiés
- ✅ Code sur GitHub : `yassineC4/Vtc`
- ✅ Build fonctionne localement
- ✅ Git configuré et synchronisé

---

## 📝 Étape par Étape

### ÉTAPE 1 : Aller sur Vercel

1. Ouvrez [vercel.com](https://vercel.com) dans votre navigateur
2. Connectez-vous avec GitHub (ou créez un compte)
3. Autorisez Vercel à accéder à vos dépôts GitHub si demandé

### ÉTAPE 2 : Supprimer l'Ancien Projet (Si Existant)

**Cherchez votre ancien projet "vtc-phi" :**

1. Dans votre tableau de bord Vercel, regardez la liste des projets
2. Si vous voyez **"vtc-phi"** ou un projet lié à Vtc :
   - Cliquez dessus
   - Allez dans **Settings** (Paramètres)
   - Scrollez jusqu'en bas → **Danger Zone**
   - Cliquez sur **"Delete Project"**
   - Confirmez la suppression

✅ **Si vous ne voyez pas d'ancien projet, passez à l'étape 3.**

### ÉTAPE 3 : Créer un Nouveau Projet

1. Cliquez sur **"Add New..."** ou **"New Project"** (bouton en haut à droite)
2. Si vous voyez une liste de dépôts GitHub :
   - Cherchez **"Vtc"** ou **"yassineC4/Vtc"**
   - Si vous ne le voyez pas :
     - Cliquez sur **"Adjust GitHub App Permissions"**
     - Sélectionnez votre dépôt **Vtc**
     - Autorisez l'accès
     - Rechargez la page
3. Cliquez sur **"Import"** à côté de votre dépôt **Vtc**

### ÉTAPE 4 : Configuration du Projet

**Vercel détecte automatiquement Next.js, vérifiez :**

- **Framework Preset** : `Next.js` ✅
- **Root Directory** : `./` ✅
- **Build Command** : `npm run build` ✅
- **Output Directory** : `.next` ✅
- **Install Command** : `npm install` ✅

**NE CLIQUEZ PAS ENCORE SUR "DEPLOY" !** On configure d'abord les variables.

### ÉTAPE 5 : Configurer les Variables d'Environnement ⚠️ IMPORTANT

**Dans la section "Environment Variables", ajoutez ces 5 variables :**

#### Variable 1 : Supabase URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: [Votre URL Supabase - ex: https://xxxxx.supabase.co]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2 : Supabase Anon Key
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Votre clé anonyme Supabase - commence par eyJ...]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3 : Supabase Service Role Key
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Votre clé service_role - longue chaîne]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 4 : Google Maps API Key
```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: [Votre clé API Google Maps]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 5 : App URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://vtc-phi.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

**Après avoir ajouté chaque variable, cliquez sur "Add" ou laissez tel quel.**

### ÉTAPE 6 : Déployer 🚀

1. Une fois toutes les variables ajoutées, cliquez sur **"Deploy"**
2. ⏳ **Attendez 2-5 minutes** pendant que Vercel :
   - Installe les dépendances
   - Build votre application
   - Déploie sur leurs serveurs
3. Vous verrez les logs en temps réel
4. Quand c'est terminé, vous verrez : ✅ **Ready**

### ÉTAPE 7 : Récupérer l'URL

1. Une fois le déploiement terminé, vous verrez une URL
2. Exemple : `https://vtc-phi-xxxxx.vercel.app` ou `https://vtc-phi.vercel.app`
3. **Notez cette URL** (vous en aurez besoin pour Google Maps)

### ÉTAPE 8 : Configurer les Restrictions Google Maps 🔒

**Pour sécuriser votre clé API Google Maps :**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. Cliquez sur votre clé API Google Maps
4. Dans **"Application restrictions"** :
   - Sélectionnez **"HTTP referrers (web sites)"**
   - Cliquez sur **"Add an item"**
   - Ajoutez votre URL Vercel (ex: `https://vtc-phi.vercel.app/*`)
   - Ajoutez aussi `https://*.vercel.app/*` (pour les previews)
   - Ajoutez `http://localhost:3000/*` (pour le développement local)
5. Cliquez sur **"Save"**
6. ⏳ **Attendez 5 minutes** pour que les restrictions prennent effet

### ÉTAPE 9 : Tester Votre Site ✅

1. Visitez votre URL Vercel
2. Testez le calculateur de prix :
   - Tapez une adresse dans "Lieu de départ"
   - L'autocomplétion Google Maps doit fonctionner
   - Sélectionnez une adresse
   - Faites de même pour "Lieu d'arrivée"
   - Cliquez sur "Estimer le prix"
   - Le prix doit s'afficher sans erreur ✅

---

## 📋 Checklist Finale

- [ ] Connecté à Vercel
- [ ] Ancien projet supprimé (si existant)
- [ ] Nouveau projet créé et connecté à GitHub
- [ ] Toutes les 5 variables d'environnement ajoutées
- [ ] Déploiement lancé et réussi (statut "Ready")
- [ ] URL du site notée
- [ ] Restrictions Google Maps configurées
- [ ] Site testé et fonctionnel

---

## 🆘 Si vous rencontrez des problèmes

### "Project already exists"
→ Supprimez l'ancien projet d'abord (Étape 2)

### "Cannot access repository"
→ Vérifiez que vous avez autorisé Vercel à accéder à votre dépôt GitHub

### "Build failed"
→ Vérifiez les logs de build dans Vercel pour voir l'erreur exacte

### "Google Maps not working"
→ Vérifiez que :
1. La variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` est bien configurée
2. Vous avez redéployé après avoir ajouté les variables
3. Les restrictions Google Maps incluent votre domaine Vercel

### "Supabase errors"
→ Vérifiez que vos 3 clés Supabase sont correctes et que votre base de données est active

---

## 🎉 C'est Terminé !

Votre application est maintenant déployée et accessible publiquement !

**Prochaines étapes optionnelles :**
- Configurer un domaine personnalisé
- Configurer les déploiements automatiques (déjà actifs par défaut)
- Ajouter des analyses (analytics)

---

**Besoin d'aide ?** Consultez les logs dans Vercel > Deployments > [Votre déploiement] > Logs

