# 📱 Flux de Réservation WhatsApp - Documentation

## ✅ Implémentation Complète

Le système de réservation basé sur WhatsApp et Supabase est maintenant entièrement fonctionnel.

---

## 🔄 Workflow

### 1. **Côté Client (BookingForm)**

#### Processus :
1. L'utilisateur remplit le formulaire de réservation
2. À la soumission, les données sont enregistrées dans Supabase avec le statut `pending`
3. Une fois l'enregistrement réussi :
   - WhatsApp s'ouvre automatiquement vers le numéro admin
   - Un message pré-rempli est généré avec :
     - Le trajet (Départ ➔ Arrivée)
     - La date et l'heure
     - Le nom du client
   - Une modale de succès s'affiche : *"Demande enregistrée ! Veuillez envoyer le message WhatsApp qui vient de s'ouvrir pour finaliser la demande."*

#### Fichiers modifiés :
- `src/components/home/RideCalculator.tsx` : Fonction `handleReservationConfirm`
- `src/lib/whatsapp.ts` : Amélioration du formatage des numéros

---

### 2. **Côté Admin (Dashboard Dispatch)**

#### Processus :
1. L'admin voit les courses "En attente" dans la colonne gauche
2. Il clique sur "Assigner" sur une course
3. Une modale s'ouvre avec la liste des chauffeurs disponibles
4. L'admin sélectionne un chauffeur
5. Il clique sur **"Confirmer & WhatsApp Client"**
6. Le système :
   - Met à jour le statut à `confirmed` dans Supabase
   - Assigne le `driver_id` sélectionné
   - Ouvre WhatsApp vers le numéro du CLIENT
   - Pré-remplit un message de confirmation avec :
     - Le nom du client
     - Le nom du chauffeur assigné
     - Un message rassurant

#### Fichiers modifiés :
- `src/components/admin/AssignDriverModal.tsx` : Bouton et logique de confirmation WhatsApp
- `src/components/admin/PendingBookingsList.tsx` : Affichage des courses en attente

---

## 📝 Format des Messages WhatsApp

### Message Client → Admin (après réservation) :

```
Bonjour, je viens de faire une demande de réservation sur le site.

Trajet : [Adresse départ] ➔ [Adresse arrivée]

Date : [Date formatée] à [Heure]

Client : [Prénom Nom]
```

### Message Admin → Client (après assignation) :

```
Bonjour [Prénom], votre course est confirmée ✅.

Votre chauffeur sera : [Prénom Nom Chauffeur].

Il vous contactera à son arrivée.

Merci de votre confiance !
```

---

## 🔧 Formatage des Numéros de Téléphone

La fonction `formatPhoneForWhatsApp()` gère automatiquement :

- ✅ `+33 6 95 29 71 92`
- ✅ `0033695297192`
- ✅ `33695297192`
- ✅ `0695297192` (assume code pays 33)
- ✅ `6 95 29 71 92` (avec espaces)
- ✅ Tous les caractères non numériques sont supprimés

**Format de sortie** : `33695297192` (code pays + numéro sans espaces, sans +, sans 0 initial)

---

## 🌐 Compatibilité WhatsApp

- ✅ **Mobile** : Ouvre l'app WhatsApp native
- ✅ **Desktop** : Ouvre WhatsApp Web dans un nouvel onglet
- ✅ **Gestion des popups** : Utilise `window.open()` avec `noopener,noreferrer` pour la sécurité

---

## 🔐 Sécurité

- ✅ Les liens WhatsApp utilisent `_blank` avec `noopener,noreferrer`
- ✅ Le formatage des numéros empêche l'injection de caractères malveillants
- ✅ Validation côté client et serveur

---

## 📍 Configuration

### Numéro Admin

Le numéro admin est défini dans :
- `src/lib/whatsapp.ts` : `DEFAULT_PHONE_NUMBER = '33695297192'`
- Peut être surchargé via la prop `whatsappNumber` dans `RideCalculator`

### Variables d'environnement

Aucune variable d'environnement supplémentaire n'est nécessaire. Le système utilise :
- Les numéros fournis dans les formulaires (clients)
- Le numéro admin par défaut ou configuré

---

## 🧪 Test du Flux

### Test Client :
1. Remplir le formulaire de réservation
2. Soumettre
3. Vérifier que :
   - La réservation apparaît dans Supabase avec `status = 'pending'`
   - WhatsApp s'ouvre avec le message pré-rempli
   - La modale de succès s'affiche

### Test Admin :
1. Se connecter au dashboard admin
2. Voir les courses "En attente" à gauche
3. Cliquer sur "Assigner" sur une course
4. Sélectionner un chauffeur disponible
5. Cliquer sur "Confirmer & WhatsApp Client"
6. Vérifier que :
   - Le statut passe à `confirmed` dans Supabase
   - Le `driver_id` est assigné
   - WhatsApp s'ouvre vers le client avec le message de confirmation

---

## ⚠️ Notes Importantes

1. **Numéro client requis** : Pour que l'admin puisse envoyer un WhatsApp au client, le champ `phone` doit être rempli lors de la réservation.

2. **Message semi-automatisé** : Le système prépare les messages, mais l'humain doit valider l'envoi (le message s'ouvre pré-rempli, l'utilisateur doit cliquer sur "Envoyer").

3. **Support multi-langue** : Les messages sont générés en français ou anglais selon la langue de l'interface.

4. **Format de date** : La date est formatée selon la locale (français : "lundi 15 janvier 2024 à 14:30", anglais : "Monday, January 15, 2024 at 02:30 PM").

---

## 🐛 Dépannage

### Le WhatsApp ne s'ouvre pas :
- Vérifier que les popups ne sont pas bloquées dans le navigateur
- Vérifier que WhatsApp est installé (mobile) ou accessible (desktop)

### Le numéro est mal formaté :
- Vérifier le format d'entrée dans le formulaire
- Consulter les logs de la console (en développement) pour voir le formatage

### Le message n'apparaît pas pré-rempli :
- Vérifier que l'URL WhatsApp contient bien le paramètre `?text=...`
- Vérifier que le message est bien encodé avec `encodeURIComponent()`

---

## 📊 Structure de la Base de Données

La table `bookings` contient :
- `status` : `'pending'` → `'confirmed'` → `'in_progress'` → `'completed'`
- `driver_id` : NULL au départ, assigné par l'admin
- `phone` : Numéro du client (requis pour WhatsApp)
- `scheduled_date` : Date/heure de la course

---

## 🚀 Améliorations Futures

- [ ] Envoi automatique d'email en complément de WhatsApp
- [ ] Notifications push pour l'admin quand une nouvelle réservation arrive
- [ ] Historique des messages WhatsApp envoyés
- [ ] Templates de messages personnalisables
- [ ] Support de WhatsApp Business API pour l'envoi automatique


