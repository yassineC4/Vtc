# 🔐 Créer un Utilisateur Admin dans Supabase

## ❌ Problème : "Invalid login credentials"

Cette erreur signifie que l'utilisateur `chauffeur@test.com` n'existe pas dans Supabase Auth ou que le mot de passe est incorrect.

---

## ✅ Solution : Créer l'utilisateur dans Supabase

### Méthode 1 : Via l'Interface Supabase (Recommandé)

1. **Allez sur [supabase.com](https://supabase.com)** et connectez-vous
2. **Sélectionnez votre projet**
3. Dans le menu de gauche, cliquez sur **"Authentication"**
4. Cliquez sur l'onglet **"Users"**
5. Cliquez sur le bouton **"Add User"** (en haut à droite) ou **"Invite User"**
6. Remplissez le formulaire :
   - **Email** : `chauffeur@test.com`
   - **Password** : Entrez un mot de passe sécurisé (minimum 6 caractères)
   - **Auto Confirm User** : ✅ Cochez cette case (important !)
   - **Send Invite Email** : ❌ Décochez si vous connaissez déjà le mot de passe
7. Cliquez sur **"Create User"**

### Méthode 2 : Via SQL (Alternative)

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez cette requête SQL :

```sql
-- Créer un utilisateur avec un mot de passe
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'chauffeur@test.com',
  crypt('VOTRE_MOT_DE_PASSE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  ''
);
```

⚠️ **Note** : Cette méthode est plus complexe. La méthode 1 est recommandée.

---

## 🔑 Après avoir créé l'utilisateur

1. **Retournez sur votre application** : `https://vtc-ashen.vercel.app/admin/login`
2. **Connectez-vous avec** :
   - Email : `chauffeur@test.com`
   - Mot de passe : Celui que vous avez défini dans Supabase

---

## 🔍 Vérifier que l'utilisateur existe

1. Dans Supabase → **Authentication** → **Users**
2. Cherchez `chauffeur@test.com` dans la liste
3. Vérifiez que :
   - ✅ L'email est confirmé (colonne "Confirmed")
   - ✅ Le statut est "Active"

---

## ⚠️ Si l'utilisateur existe mais ça ne fonctionne toujours pas

### Vérifier le mot de passe

1. Dans Supabase → **Authentication** → **Users**
2. Cliquez sur l'utilisateur `chauffeur@test.com`
3. Cliquez sur **"Reset Password"** ou **"Update User"**
4. Définissez un nouveau mot de passe
5. Essayez de vous reconnecter

### Vérifier les paramètres Supabase Auth

1. Dans Supabase → **Authentication** → **Providers**
2. Vérifiez que **"Email"** est activé
3. Vérifiez que **"Enable Email Confirmations"** est configuré selon vos besoins
   - Si activé, vous devrez confirmer l'email avant de pouvoir vous connecter
   - Si désactivé, vous pouvez vous connecter directement

### Vérifier les URL autorisées

1. Dans Supabase → **Authentication** → **URL Configuration**
2. Vérifiez que **"Site URL"** contient : `https://vtc-ashen.vercel.app`
3. Dans **"Redirect URLs"**, ajoutez :
   - `https://vtc-ashen.vercel.app/**`
   - `https://vtc-ashen.vercel.app/admin/**`

---

## 🆘 Créer plusieurs utilisateurs admin

Si vous avez besoin de plusieurs comptes admin :

1. Répétez la **Méthode 1** pour chaque utilisateur
2. Utilisez des emails différents
3. Chaque utilisateur pourra accéder à `/admin` avec ses propres identifiants

---

## 📝 Exemples d'utilisateurs à créer

Pour un système avec plusieurs admins, créez :

- `admin@vtc.com` - Compte administrateur principal
- `chauffeur@test.com` - Compte de test
- `manager@vtc.com` - Compte manager
- etc.

---

## 🔒 Sécurité

⚠️ **Important** :
- Utilisez des mots de passe forts (minimum 12 caractères, lettres, chiffres, symboles)
- Ne partagez jamais vos identifiants
- Changez régulièrement les mots de passe
- Utilisez l'authentification à deux facteurs si possible (configurez dans Supabase Auth → Settings)

