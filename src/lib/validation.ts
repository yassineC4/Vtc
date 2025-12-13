/**
 * Utilitaires de validation et sanitization pour la sécurité
 */

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Valide un numéro de téléphone (format français ou international)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/[^0-9+]/g, '')
  // Format français: 0612345678 ou +33612345678
  // Format international: +33...
  const frenchPhoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/
  return frenchPhoneRegex.test(cleaned) || cleaned.length >= 10
}

/**
 * Sanitize une chaîne de caractères
 * - Supprime les caractères de contrôle
 * - Limite la longueur
 * - Trim les espaces
 */
export function sanitizeString(str: string, maxLength: number = 255): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer caractères de contrôle
    .slice(0, maxLength)
    .trim()
}

/**
 * Valide un prix (nombre positif)
 */
export function validatePrice(price: number | string): boolean {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return !isNaN(numPrice) && numPrice > 0 && numPrice < 100000 // Max 100000€
}

/**
 * Valide un nombre de passagers (1-8)
 */
export function validatePassengers(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= 8
}

/**
 * Valide les valeurs enum pour ride_type
 */
export function validateRideType(type: string): type is 'immediate' | 'reservation' {
  return type === 'immediate' || type === 'reservation'
}

/**
 * Valide les valeurs enum pour vehicle_category
 */
export function validateVehicleCategory(category: string): category is 'standard' | 'berline' | 'van' {
  return ['standard', 'berline', 'van'].includes(category)
}

/**
 * Valide les valeurs enum pour payment_method
 */
export function validatePaymentMethod(method: string): method is 'cash' | 'card' {
  return method === 'cash' || method === 'card'
}

