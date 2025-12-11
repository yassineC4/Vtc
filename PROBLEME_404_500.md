# Résolution des erreurs 404 et 500

## Problèmes identifiés

1. **Erreurs 404** pour les fichiers JavaScript (`app-pages-internals.js`, `main-app.js`, `page.js`, `layout.css`)
   - Cause : Cache corrompu dans le dossier `.next`
   - Solution : Supprimer le dossier `.next` et rebuilder

2. **Erreur 500** pour `manifest.webmanifest`
   - Cause : Variable `siteUrl` non utilisée mais déclarée, et référence à `/favicon.ico` qui n'existe pas
   - Solution : Simplifier le manifest et retirer la référence au favicon

## Actions effectuées

✅ Cache `.next` supprimé
✅ Fichier `manifest.ts` corrigé (variable inutilisée supprimée, favicon retiré)
✅ Build vérifié (compilation réussie)

## Pour résoudre complètement

1. **Arrêter le serveur de développement** (Ctrl+C dans le terminal où `npm run dev` tourne)

2. **Relancer le serveur** :
   ```bash
   npm run dev
   ```

3. **Vider le cache du navigateur** :
   - Chrome/Edge : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
   - Ou ouvrir les DevTools (F12) > Onglet Network > Cocher "Disable cache"

4. **Redémarrer le serveur si nécessaire** :
   - Les fichiers JavaScript seront régénérés au prochain démarrage
   - Le manifest sera servi correctement

## Si les erreurs persistent

1. Vérifier que le port 3000 n'est pas déjà utilisé :
   ```bash
   lsof -i :3000
   ```

2. Essayer un autre port :
   ```bash
   npm run dev -- -p 3001
   ```

3. Vérifier les logs du serveur pour plus de détails

