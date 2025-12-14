# 🔍 Résolution de l'erreur REQUEST_DENIED - Google Maps API

## ❌ Erreur : `REQUEST_DENIED`

Cette erreur indique que Google Maps a rejeté votre requête. Voici comment la résoudre :

## ✅ Solutions par ordre de priorité

### 1. Vérifier que l'API est activée

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet
3. **APIs & Services** > **Library**
4. Recherchez et **activez** :
   - ✅ **Distance Matrix API**
   - ✅ **Maps JavaScript API** (pour l'autocomplete)
   - ✅ **Places API** (pour l'autocomplete)

### 2. Vérifier les restrictions HTTP referrers

⚠️ **Pour les routes API côté serveur** (`/api/estimate`), les restrictions HTTP referrers **ne fonctionnent pas** car les requêtes viennent du serveur Vercel, pas du navigateur.

**Solution :**

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur votre clé API
3. Dans **"Application restrictions"**, choisissez **"None"** OU **"IP addresses"** :
   - Si vous choisissez **"IP addresses"**, vous devez ajouter les IPs de Vercel (complexe)
   - **Recommandation** : Choisissez **"None"** pour le développement/production simple

4. Dans **"API restrictions"**, sélectionnez **"Restrict key"** et ajoutez uniquement :
   - ✅ Distance Matrix API
   - ✅ Maps JavaScript API
   - ✅ Places API

### 3. Vérifier la variable d'environnement

**Pour Vercel :**

1. Allez dans votre projet Vercel > **Settings** > **Environment Variables**
2. Vérifiez que `GOOGLE_MAPS_API_KEY` est définie (sans `NEXT_PUBLIC_` pour les routes API)
3. **OU** définissez `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (utilisée en fallback)

**Pour le développement local :**

Créez un fichier `.env.local` :
```env
GOOGLE_MAPS_API_KEY=votre_cle_api_ici
# OU
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_api_ici
```

### 4. Vérifier la facturation

1. Allez dans **Billing** dans Google Cloud Console
2. Assurez-vous qu'un compte de facturation est activé
3. ⚠️ Google Maps nécessite un compte de facturation même si vous êtes dans la période gratuite

### 5. Vérifier les quotas

1. Allez dans **APIs & Services** > **Dashboard**
2. Sélectionnez **Distance Matrix API**
3. Vérifiez que vous n'avez pas dépassé vos quotas

## 🔒 Sécurité recommandée

Au lieu de **"None"** pour les restrictions, vous pouvez utiliser **"IP addresses"** :

1. **APIs & Services** > **Credentials** > Votre clé API
2. **Application restrictions** > **IP addresses**
3. Ajoutez les IPs de Vercel (consultez [Vercel IP ranges](https://vercel.com/docs/security/ip-addresses))

**OU** créez deux clés API séparées :
- **Clé 1** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client-side) avec restrictions HTTP referrers
- **Clé 2** : `GOOGLE_MAPS_API_KEY` (server-side) sans restrictions ou avec IP restrictions

## 🧪 Test rapide

Testez votre clé API directement :

```bash
curl "https://maps.googleapis.com/maps/api/distancematrix/json?origins=Paris&destinations=Lyon&key=VOTRE_CLE_API"
```

Si vous obtenez `REQUEST_DENIED`, le problème est dans la configuration Google Cloud.

## 📝 Checklist de vérification

- [ ] Distance Matrix API activée
- [ ] Maps JavaScript API activée (si utilisé)
- [ ] Places API activée (si utilisé)
- [ ] Restrictions d'application : **"None"** OU **"IP addresses"** (pas HTTP referrers pour les routes API)
- [ ] Restrictions API : Distance Matrix API autorisée
- [ ] Compte de facturation activé
- [ ] Variable d'environnement `GOOGLE_MAPS_API_KEY` définie dans Vercel
- [ ] Redéploiement après modification des variables d'environnement

## 🆘 Si le problème persiste

1. Vérifiez les logs serveur Vercel pour voir l'erreur exacte
2. Vérifiez que la clé API est correcte (pas d'espaces, caractères corrects)
3. Testez avec une nouvelle clé API
4. Contactez le support Google Cloud si nécessaire

