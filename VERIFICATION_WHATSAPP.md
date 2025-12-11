# 🔍 Vérification du Format WhatsApp

## Format Correct pour WhatsApp

Le format attendu par `wa.me` est : **code pays + numéro (sans +, sans 0 initial, sans espaces)**

### Exemple pour un numéro français :
- Numéro affiché : `+33 6 95 29 71 92`
- Format WhatsApp : `33695297192`
- URL complète : `https://wa.me/33695297192?text=Message`

## ✅ Vérification

Pour vérifier si votre numéro est correct :

1. **Testez l'URL directement** : `https://wa.me/33695297192`
   - Si WhatsApp s'ouvre ou vous redirige vers WhatsApp Web, le format est correct ✅
   - Si vous voyez une erreur, le numéro n'est peut-être pas valide

2. **Vérifiez le numéro réel** :
   - Assurez-vous que le numéro `+33 6 95 29 71 92` est votre vrai numéro WhatsApp
   - Le numéro doit être enregistré sur WhatsApp
   - Le numéro doit être actif et accessible

## 🔧 Si le Problème Persiste

Si vous obtenez toujours une erreur, cela peut être dû à :

1. **Le numéro n'est pas valide** : Vérifiez que c'est bien votre numéro WhatsApp
2. **Le numéro n'est pas enregistré sur WhatsApp** : Assurez-vous que le numéro est lié à un compte WhatsApp actif
3. **Problème de format** : Vérifiez dans la console du navigateur (F12) l'URL générée

## 📝 Pour Changer le Numéro

Si vous devez changer le numéro de téléphone :

1. **Modifiez `DEFAULT_PHONE_NUMBER`** dans `src/lib/whatsapp.ts` :
```typescript
export const DEFAULT_PHONE_NUMBER = '33695297192' // Remplacez par votre numéro au format 33XXXXXXXXX
```

2. **Mettez à jour dans `HomePageClient.tsx`** :
```typescript
<WhatsAppButton locale={locale} phoneNumber="33695297192" />
```

3. **Mettez à jour dans `Footer.tsx`** si nécessaire :
```typescript
href="tel:+33695297192" // Format pour les appels
href="https://wa.me/33695297192" // Format pour WhatsApp
```

## 🧪 Test Rapide

Ouvrez la console du navigateur (F12) et tapez :
```javascript
// Test du formatage
import { formatPhoneForWhatsApp, createWhatsAppUrl } from '@/lib/whatsapp'
console.log(formatPhoneForWhatsApp('0033695297192')) // Doit retourner: 33695297192
console.log(createWhatsAppUrl('33695297192', 'Test')) // Doit retourner l'URL WhatsApp
```

## ✅ Vérification Finale

1. Le numéro formaté commence toujours par `33` (code pays France)
2. Le numéro formaté a 11 chiffres au total (33 + 9 chiffres)
3. Le numéro ne commence jamais par `0` après formatage
4. L'URL générée est : `https://wa.me/33XXXXXXXXX?text=...`

