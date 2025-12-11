/**
 * Utilitaire pour formater les numéros de téléphone pour WhatsApp
 * Format attendu par wa.me : code pays + numéro (sans +, sans 0 initial, sans espaces)
 * Exemple : 33695297192 pour +33 6 95 29 71 92
 */

/**
 * Formate un numéro de téléphone pour WhatsApp
 * Accepte plusieurs formats d'entrée :
 * - +33 6 95 29 71 92
 * - 0033695297192
 * - 33695297192
 * - 0695297192 (assumera code pays 33)
 * 
 * Retourne : 33695297192 (format attendu par wa.me)
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    console.error('Invalid phone number:', phoneNumber)
    return DEFAULT_PHONE_NUMBER
  }

  // Supprimer tous les caractères non numériques (espaces, tirets, parenthèses, +, etc.)
  let cleaned = phoneNumber.replace(/[^0-9]/g, '')
  
  // Si vide après nettoyage, retourner le défaut
  if (!cleaned) {
    console.error('Phone number is empty after cleaning:', phoneNumber)
    return DEFAULT_PHONE_NUMBER
  }
  
  // Si le numéro commence par 00 (format international avec zéros), supprimer les deux premiers zéros
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2)
  }
  
  // Si le numéro commence par un seul 0 et fait 10 chiffres (format français : 06...)
  // Remplacer le 0 par le code pays 33
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '33' + cleaned.substring(1) // Enlève le 0 et ajoute 33
  }
  
  // Si le numéro ne commence pas par un code pays et fait 9 chiffres
  // C'est probablement un numéro français sans le 0 initial (695297192), ajouter 33
  if (!cleaned.startsWith('33') && cleaned.length === 9) {
    cleaned = '33' + cleaned
  }
  
  // Vérifier que le numéro formaté est valide (doit commencer par 33 et avoir au moins 11 chiffres pour un mobile français)
  if (cleaned.startsWith('33') && cleaned.length < 11) {
    console.warn('Phone number seems too short after formatting:', cleaned, 'Original:', phoneNumber)
  }
  
  // Log pour debug en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('Phone number formatted:', phoneNumber, '->', cleaned)
  }
  
  return cleaned
}

/**
 * Crée une URL WhatsApp avec un message
 */
export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const formattedNumber = formatPhoneForWhatsApp(phoneNumber)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`
}

/**
 * Numéro de téléphone par défaut (format français)
 * Format: code pays (33) + numéro mobile sans le 0 initial
 * Exemple: +33 6 95 29 71 92 devient 33695297192
 */
export const DEFAULT_PHONE_NUMBER = '33695297192' // Format WhatsApp: 33 + 695297192 (depuis 0695297192)

/**
 * Valide si un numéro de téléphone formaté est correct
 * Pour la France: doit commencer par 33 et avoir 11 chiffres au total (33 + 9 chiffres)
 */
export function isValidFrenchPhoneNumber(formattedNumber: string): boolean {
  return /^33[67]\d{8}$/.test(formattedNumber) // 33 suivi de 6 ou 7 (mobile français) puis 8 chiffres
}

