# 🔧 Résolution : Erreur Clé API Google Maps

## ❌ Pourquoi vous avez cette erreur

**Le problème** : Votre application sur Vercel ne trouve pas la clé API Google Maps.

**La cause** : Les variables d'environnement ne sont **PAS** stockées dans votre code Git (et c'est normal !). Elles doivent être configurées **directement dans Vercel**.

⚠️ **Important** : Avoir un dépôt Git public ou privé n'a **AUCUN IMPACT** sur les variables d'environnement. C'est deux choses séparées :
- **Git** = Votre code source
- **Vercel Dashboard** = Configuration des variables d'environnement pour le déploiement

---

## ✅ Solution : Configurer les variables dans Vercel

### Étape 1 : Connecter Vercel à votre dépôt (si pas déjà fait)

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre dépôt GitHub : `yassineC4/Vtc`
4. Vercel va détecter automatiquement Next.js

### Étape 2 : Configurer les variables d'environnement

**Pendant la configuration initiale OU après dans Settings :**

1. Dans la section **"Environment Variables"**, cliquez sur **"Add"**
2. Ajoutez **TOUTES** ces variables une par une :

#### Variable 1 : Clé API Google Maps
```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: [Votre clé API Google Maps]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2 : Supabase URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: [Votre URL Supabase]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3 : Supabase Anon Key
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Votre clé anonyme Supabase]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 4 : Supabase Service Role Key
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Votre clé service role Supabase]
Environments: ✅ Production ✅ Preview ✅ Development
```

### Étape 3 : Déployer ou Redéployer

- Si c'est la première fois : Cliquez sur **"Deploy"**
- Si le projet existe déjà :
  1. Allez dans **"Deployments"**
  2. Cliquez sur **"..."** (trois points) du dernier déploiement
  3. Cliquez sur **"Redeploy"**
  4. Sélectionnez **"Use existing Build Cache"** ou laissez par défaut
  5. Cliquez sur **"Redeploy"**

### Étape 4 : Attendre et Vérifier

1. Attendez 2-5 minutes que le déploiement se termine
2. Visitez : https://vtc-phi.vercel.app
3. Testez le calculateur de prix
4. L'erreur devrait avoir disparu ! ✅

---

## 🔍 Vérifier où trouver vos clés

### Google Maps API Key
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. Copiez votre clé API (celle qui a Places API et Distance Matrix API activées)

### Supabase Keys
1. Allez sur votre projet Supabase
2. **Settings** > **API**
3. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ gardez-la secrète)

---

## 🗺️ Configuration Google Maps (Important !)

Après avoir ajouté la clé, sécurisez-la dans Google Cloud Console :

1. **Google Cloud Console** > **APIs & Services** > **Credentials**
2. Cliquez sur votre clé API
3. Dans **"Application restrictions"**, sélectionnez **"HTTP referrers (web sites)"**
4. Ajoutez ces domaines :
   ```
   https://vtc-phi.vercel.app/*
   https://*.vercel.app/*
   ```
5. Cliquez sur **"Save"**

---

## ❓ Questions Fréquentes

### Q: Pourquoi je ne peux pas mettre les variables dans Git ?
**R:** C'est pour la sécurité ! Les variables d'environnement contiennent des secrets (clés API, mots de passe). Si elles étaient dans Git, n'importe qui pourrait les voir. Vercel stocke ces secrets de manière sécurisée.

### Q: Mon dépôt est public, est-ce que ça pose un problème ?
**R:** Non ! Les variables d'environnement ne sont **PAS** dans Git (grâce au .gitignore), donc elles restent privées même si votre code est public.

### Q: Comment vérifier que les variables sont bien configurées sur Vercel ?
**R:** 
1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Vous devriez voir toutes les variables listées

### Q: J'ai ajouté les variables mais ça ne fonctionne toujours pas ?
**R:**
1. **Redéployez** votre application (les variables sont injectées au moment du build)
2. Attendez 2-3 minutes
3. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
4. Vérifiez les logs de déploiement dans Vercel pour voir s'il y a des erreurs

### Q: Comment savoir si mon déploiement utilise bien les nouvelles variables ?
**R:** Dans Vercel, allez dans **"Deployments"** > Cliquez sur un déploiement > Regardez les **"Build Logs"**. Vous ne verrez pas les valeurs des variables (c'est sécurisé), mais vous verrez si le build réussit.

---

## ✅ Checklist de Résolution

- [ ] Connexion Vercel au dépôt GitHub `yassineC4/Vtc`
- [ ] Variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ajoutée dans Vercel
- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` ajoutée dans Vercel
- [ ] Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajoutée dans Vercel
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` ajoutée dans Vercel
- [ ] Redéploiement effectué après avoir ajouté les variables
- [ ] Attendu 2-5 minutes que le déploiement se termine
- [ ] Testé le site : https://vtc-phi.vercel.app
- [ ] Le calculateur de prix fonctionne sans erreur

---

## 🆘 Besoin d'Aide ?

Si après avoir suivi ces étapes le problème persiste :

1. Vérifiez les **logs de build** dans Vercel (Deployments > Cliquez sur un déploiement > Logs)
2. Vérifiez la **console du navigateur** (F12 > Console) pour voir les erreurs exactes
3. Vérifiez que votre clé API Google Maps est **valide** et a les **quotas nécessaires**
4. Vérifiez que les **APIs sont activées** dans Google Cloud Console :
   - Maps JavaScript API
   - Places API
   - Distance Matrix API


