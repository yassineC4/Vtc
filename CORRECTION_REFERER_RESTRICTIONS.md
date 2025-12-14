# 🔧 Correction : "API keys with referer restrictions cannot be used with this API"

## ❌ Le problème

Vous voyez cette erreur parce que votre clé API Google Maps a des **restrictions HTTP referrers**, mais elle est utilisée dans `/api/estimate` qui est une route **côté serveur**.

Les restrictions HTTP referrers ne fonctionnent **que** pour les appels côté client (navigateur), pas pour les appels serveur (Next.js API routes).

## ✅ Solution : Créer deux clés API séparées (RECOMMANDÉ)

### Étape 1 : Créer la clé pour le serveur

1. Allez dans [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials** > **Create Credentials** > **API Key**
3. Nommez-la : `VTC Server Key` (ou similaire)
4. Cliquez sur la clé créée pour la configurer :
   - **Application restrictions** : Choisissez **"None"** (ou "IP addresses" si vous connaissez les IPs Vercel)
   - ⚠️ **PAS de HTTP referrers** pour cette clé
   - **API restrictions** : **"Restrict key"** > Sélectionnez uniquement :
     - ✅ Distance Matrix API

5. **Copiez cette clé** → C'est votre `GOOGLE_MAPS_API_KEY`

### Étape 2 : Garder/modifier la clé pour le client

Si vous avez déjà une clé avec HTTP referrers :

1. Vérifiez qu'elle a les restrictions HTTP referrers
2. **API restrictions** : Maps JavaScript API, Places API
3. **Copiez cette clé** → C'est votre `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Étape 3 : Configurer dans Vercel

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez/modifiez :
   - `GOOGLE_MAPS_API_KEY` = Clé serveur (sans HTTP referrers)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Clé client (avec HTTP referrers OK)
4. **Redéployez** votre projet

### Étape 4 : Vérifier que ça fonctionne

1. Après le redéploiement, testez à nouveau l'estimation de prix
2. Les logs serveur Vercel ne devraient plus montrer l'erreur "referer restrictions"
3. L'API devrait fonctionner correctement

## 🔒 Sécurité

- ✅ **Clé serveur** : Sans HTTP referrers, mais avec restrictions API (Distance Matrix uniquement)
- ✅ **Clé client** : Avec HTTP referrers (domaines autorisés), restrictions API (Maps JS + Places)
- ✅ Les deux clés ont des **restrictions API** pour limiter leur usage

## 📝 Alternative : Une seule clé sans HTTP referrers

Si vous préférez une seule clé (moins sécurisé) :

1. **APIs & Services** > **Credentials** > Votre clé
2. **Application restrictions** : Choisissez **"None"** (ou "IP addresses")
3. ⚠️ **Enlevez les HTTP referrers**
4. **API restrictions** : Distance Matrix API, Maps JavaScript API, Places API
5. Utilisez cette clé pour `GOOGLE_MAPS_API_KEY` ET `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
6. Redéployez

Cette solution fonctionne mais est moins sécurisée car la clé côté client n'a pas de restrictions de domaine.

