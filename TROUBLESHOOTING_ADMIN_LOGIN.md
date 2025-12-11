# 🔧 Dépannage : Page Admin Login qui ne fonctionne pas

## 🔍 Diagnostic du Problème

### Étape 1 : Vérifier les Variables d'Environnement sur Vercel

**Le problème le plus courant** : Les variables d'environnement Supabase ne sont pas configurées sur Vercel.

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Sélectionnez votre projet **"vtc-ashen"** (ou le nom actuel)
3. Allez dans **Settings** → **Environment Variables**
4. **Vérifiez que ces 4 variables sont bien présentes** :

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

5. **Assurez-vous qu'elles sont configurées pour "Production"** (cochez au minimum Production)

### Étape 2 : Vérifier les Erreurs dans la Console du Navigateur

1. Ouvrez https://vtc-ashen.vercel.app/admin/login
2. Ouvrez les **Outils de Développeur** (F12 ou Cmd+Option+I sur Mac)
3. Allez dans l'onglet **Console**
4. **Regardez les erreurs** qui apparaissent

**Erreurs courantes** :

#### ❌ "Variables d'environnement Supabase manquantes"
→ Les variables `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` ne sont pas configurées sur Vercel.

#### ❌ "Invalid API key" ou erreur 401
→ Votre clé Supabase est incorrecte ou expirée.

#### ❌ Erreur de réseau (CORS ou Network Error)
→ Problème de configuration Supabase (URL Site dans les paramètres Supabase).

### Étape 3 : Vérifier les Logs de Déploiement Vercel

1. Sur Vercel, allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Regardez les **Build Logs** et **Runtime Logs**
4. Cherchez les erreurs (en rouge)

### Étape 4 : Redéployer après avoir ajouté les variables

**Important** : Si vous venez d'ajouter des variables d'environnement :

1. Allez dans **Deployments**
2. Cliquez sur **"..."** (trois points) du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Assurez-vous que **"Use existing Build Cache"** est décoché (ou laissez tel quel)
5. Cliquez sur **"Redeploy"**

⚠️ **Les nouvelles variables d'environnement nécessitent un nouveau déploiement pour être prises en compte !**

---

## ✅ Checklist Complète

Cochez chaque point :

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Variables configurées pour "Production"
- [ ] Redéploiement effectué après ajout des variables
- [ ] URL Supabase correcte (commence par `https://`)
- [ ] Clés Supabase correctes (pas d'espaces, pas coupées)
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Pas d'erreurs dans les logs Vercel

---

## 🔑 Où trouver vos clés Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Vous trouverez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Ne la partagez JAMAIS)

---

## 🆘 Si ça ne fonctionne toujours pas

1. **Testez en local d'abord** :
   ```bash
   npm run dev
   ```
   Puis allez sur `http://localhost:3000/admin/login`

2. **Vérifiez votre `.env.local`** (en local) :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
   ```

3. **Vérifiez que vous avez créé un utilisateur dans Supabase Auth** :
   - Allez dans Supabase → **Authentication** → **Users**
   - Cliquez sur **"Add User"** ou **"Invite User"**
   - Créez un utilisateur avec email et mot de passe
   - Utilisez ces identifiants pour vous connecter

4. **Vérifiez les URL Site dans Supabase** :
   - Allez dans Supabase → **Authentication** → **URL Configuration**
   - Dans **Site URL**, ajoutez : `https://vtc-ashen.vercel.app`
   - Dans **Redirect URLs**, ajoutez : `https://vtc-ashen.vercel.app/**`

---

## 📝 Erreurs Spécifiques et Solutions

### "Email rate limit exceeded"
→ Trop de tentatives de connexion. Attendez quelques minutes.

### "Invalid login credentials"
→ L'email ou le mot de passe est incorrect. Vérifiez dans Supabase Auth que l'utilisateur existe.

### Page blanche ou erreur 500
→ Vérifiez les logs Vercel Runtime. Probablement une variable d'environnement manquante.

### "Cannot read property of undefined"
→ Vérifiez que les traductions sont bien chargées (le fichier de traduction devrait contenir `auth.login`).

---

## 🔗 Liens Utiles

- Dashboard Vercel : https://vercel.com/dashboard
- Dashboard Supabase : https://supabase.com/dashboard
- Documentation Supabase Auth : https://supabase.com/docs/guides/auth

