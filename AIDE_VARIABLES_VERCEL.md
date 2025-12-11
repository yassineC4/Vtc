# 🔧 Aide : Configurer les Variables d'Environnement sur Vercel

## ✅ Vos Variables (Vérifiées)

Voici vos valeurs (gardez-les en sécurité) :

1. ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://psfnaeafqockrvbjhizh.supabase.co`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGc...` (configurée)
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_...` (configurée)
4. ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = `AIzaSy...` (configurée)
5. ⚠️ `NEXT_PUBLIC_APP_URL` = **À compléter** (voir ci-dessous)

---

## 📍 Où Trouver les Options Production/Preview/Development ?

### Si vous êtes en train de créer le projet :

Quand vous ajoutez une variable, vous devriez voir :

**Option 1 : Menu déroulant "Environment"**
- Cliquez sur le menu déroulant à droite du champ "Value"
- Sélectionnez : **"Production, Preview, Development"** (ou les 3 séparément)

**Option 2 : Cases à cocher**
- Après avoir rempli "Key" et "Value"
- Regardez en dessous, il y a 3 cases :
  - ☐ Production
  - ☐ Preview  
  - ☐ Development
- **Cochez les 3** ✅

**Option 3 : Bouton avec un symbole**
- Il y a parfois un bouton avec des points "..." ou un menu
- Cliquez dessus pour voir les options d'environnement

### Si le projet est déjà créé :

1. Allez dans votre projet Vercel
2. Cliquez sur **"Settings"** (en haut)
3. Dans le menu de gauche, cliquez sur **"Environment Variables"**
4. Pour chaque variable existante :
   - Cliquez sur les **3 points "..."** à droite
   - Sélectionnez **"Edit"**
   - Vous verrez les options d'environnement
   - Cochez les 3 : Production, Preview, Development
   - Cliquez sur **"Save"**

---

## ⚠️ Variable NEXT_PUBLIC_APP_URL

Vous n'avez pas encore mis de valeur pour `NEXT_PUBLIC_APP_URL`.

**Deux options :**

### Option 1 : Laisser vide pour l'instant
- Vous pouvez mettre : `https://vtc-phi.vercel.app`
- OU laisser une valeur par défaut et la mettre à jour après le déploiement

### Option 2 : Utiliser une valeur temporaire
- Mettez : `https://vtc-phi.vercel.app`
- Après le déploiement, vous obtiendrez votre vraie URL et pourrez la mettre à jour

**Pour l'instant, mettez :**
```
Key: NEXT_PUBLIC_APP_URL
Value: https://vtc-phi.vercel.app
```

---

## 📸 À Quoi Ressemble l'Interface ?

Quand vous ajoutez une variable, vous devriez voir quelque chose comme :

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Key: [NEXT_PUBLIC_SUPABASE_URL        ]            │
│  Value: [https://psfnaeaf...           ]            │
│                                                      │
│  Environment:                                        │
│  ☐ Production                                        │
│  ☐ Preview                                           │
│  ☐ Development                                       │
│                                                      │
│  [Cancel]  [Add]                                     │
└─────────────────────────────────────────────────────┘
```

OU

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Key: [NEXT_PUBLIC_SUPABASE_URL        ]            │
│  Value: [https://psfnaeaf...           ]            │
│  Environment: [Production, Preview, Development ▼]  │
│                                                      │
│  [Cancel]  [Add]                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Les 5 variables sont ajoutées
- [ ] Chaque variable a les 3 environnements cochés (Production, Preview, Development)
- [ ] NEXT_PUBLIC_APP_URL a une valeur (même temporaire)
- [ ] Toutes les variables sont sauvegardées
- [ ] Prêt à cliquer sur "Deploy"

---

## 🚀 Après Avoir Configuré les Variables

1. Vérifiez que toutes les variables sont bien là
2. Cliquez sur **"Deploy"**
3. Attendez 2-5 minutes
4. Votre site sera en ligne ! 🎉

---

## 🆘 Si Vous Ne Trouvez Toujours Pas les Options

**Essayez ceci :**

1. **Sauvegardez les variables** même sans les options (elles seront par défaut pour Production)
2. **Après le déploiement**, allez dans Settings > Environment Variables
3. **Modifiez chaque variable** et vous verrez les options d'environnement
4. **Cochez les 3 options** et sauvegardez
5. **Redéployez** pour que les variables soient disponibles partout

---

**Besoin d'aide ?** Dites-moi où vous êtes bloqué et je vous aiderai !

