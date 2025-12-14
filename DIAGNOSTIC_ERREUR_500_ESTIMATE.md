# 🔍 Diagnostic Erreur 500 - `/api/estimate`

## Comment comprendre l'erreur

L'erreur 500 sur `/api/estimate` peut avoir plusieurs causes. Voici comment la diagnostiquer :

### 1. Vérifier les logs serveur Vercel

1. Allez dans votre projet Vercel
2. **Deployments** > Cliquez sur le dernier déploiement
3. **Functions** > Cliquez sur `/api/estimate`
4. Regardez les **Logs** pour voir les messages d'erreur détaillés

### 2. Causes possibles

#### A. Clé API Google Maps manquante ou invalide
**Symptôme :** `REQUEST_DENIED` ou `Configuration serveur manquante`

**Solution :**
- Vérifiez que `GOOGLE_MAPS_API_KEY` est définie dans Vercel (Settings > Environment Variables)
- OU que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` est définie
- Redéployez après modification

#### B. Distance Matrix API non activée
**Symptôme :** `REQUEST_DENIED` avec message d'erreur Google

**Solution :**
1. Allez dans [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Library**
3. Recherchez "Distance Matrix API"
4. Cliquez sur **Enable**

#### C. Restrictions de la clé API
**Symptôme :** `REQUEST_DENIED`

**Solution :**
1. **APIs & Services** > **Credentials** > Votre clé API
2. **Application restrictions** : Choisissez **"None"** (pour les routes API serveur)
3. **API restrictions** : Autorisez uniquement "Distance Matrix API"

#### D. Problème avec `departure_time: 'now'`
**Symptôme :** Erreur lors de l'appel Google Maps

**Solution :** Si `duration_in_traffic` n'est pas disponible, le code utilise `duration` en fallback (ligne 138)

#### E. Erreur de parsing JSON
**Symptôme :** Erreur dans le `catch` block

**Solution :** Vérifiez que le body de la requête est valide JSON

### 3. Vérifier dans la console navigateur

Ouvrez la console (F12) et regardez :
- L'erreur exacte affichée
- Les logs `❌ Erreur lors de l'estimation:` avec tous les détails
- Le statut HTTP (500)
- Le message d'erreur retourné par l'API

### 4. Test manuel de l'API

Testez directement l'API avec curl :

```bash
curl -X POST https://vtc-ashen.vercel.app/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Paris, France",
    "destination": "Lyon, France",
    "category": "standard",
    "is_round_trip": false
  }'
```

### 5. Vérifier les variables d'environnement

Dans Vercel :
1. **Settings** > **Environment Variables**
2. Vérifiez que `GOOGLE_MAPS_API_KEY` existe
3. Vérifiez qu'elle n'a pas d'espaces avant/après
4. **Redéployez** après modification

### 6. Logs ajoutés

Le code affiche maintenant des logs détaillés :
- `📥 POST /api/estimate - Requête reçue`
- `📥 POST /api/estimate - Body:` (avec le contenu de la requête)
- `🌐 Appel Google Maps Distance Matrix:` (URL sans la clé)
- `📥 Réponse Google Maps:` (statut et erreurs)
- `❌ Google Maps API error:` (en cas d'erreur)

Consultez ces logs dans Vercel pour identifier le problème exact.

