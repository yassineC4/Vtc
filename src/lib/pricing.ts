/**
 * Logique de calcul de prix pour les courses VTC
 * Logique Hybride : Max entre "Forfait Distance" (Zonale) et "Tarification Temps"
 */

export type VehicleCategory = 'standard' | 'berline' | 'van'

/**
 * Calcul du prix zonale (tarification par zones)
 * STANDARD :
 *   0 à 3 km : 15€ fixe
 *   3 à 7 km : 25€ fixe
 *   > 7 km : 25€ + ((Distance - 7) * 1.90€)
 * BERLINE/VAN :
 *   0 à 3 km : 25€ fixe
 *   3 à 7 km : 35€ fixe
 *   > 7 km : 35€ + ((Distance - 7) * 3.50€)
 */
export function calculateZonalPrice(distanceInKm: number, category: VehicleCategory): number {
  if (category === 'standard') {
    // STANDARD
    if (distanceInKm <= 3) {
      return 15 // Zone 1 : Forfait fixe
    } else if (distanceInKm <= 7) {
      return 25 // Zone 2 : Forfait fixe
    } else {
      // Zone 3 : 25€ + (Distance - 7) * 1.90€
      return 25 + ((distanceInKm - 7) * 1.90)
    }
  } else {
    // BERLINE & VAN
    if (distanceInKm <= 3) {
      return 25 // Zone 1 : 25€ fixe
    } else if (distanceInKm <= 7) {
      return 35 // Zone 2 : 35€ fixe
    } else {
      // Zone 3 : 35€ + (Distance - 7) * 3.50€
      return 35 + ((distanceInKm - 7) * 3.50)
    }
  }
}

/**
 * Prix basé sur le temps réel (Sécurité Trafic)
 * Simule un tarif taximètre : (Distance * 1.10€) + (Durée_Minutes * 0.80€)
 */
export function calculateTimeBasedPrice(distanceInKm: number, durationInMinutes: number): number {
  return (distanceInKm * 1.10) + (durationInMinutes * 0.80)
}

/**
 * Calcule le prix final en utilisant la logique hybride
 * Prend le maximum entre le prix zonale et le prix basé sur le temps
 * 
 * @param distanceInKm - Distance en kilomètres
 * @param durationInMinutes - Durée en minutes
 * @param category - Catégorie de véhicule
 * @param isRoundTrip - Si true, multiplie le prix par 2
 * @returns Prix final arrondi à 2 décimales
 */
export function calculateFinalPrice(
  distanceInKm: number,
  durationInMinutes: number,
  category: VehicleCategory,
  isRoundTrip: boolean = false
): {
  price: number
  priceBasedOnDistance: number
  priceBasedOnTime: number
  isTrafficSurcharge: boolean
} {
  // Prix A : Forfait Distance (Tarification Zonale)
  const priceBasedOnDistance = calculateZonalPrice(distanceInKm, category)
  
  // Prix B : Temps Réel (Sécurité Trafic)
  const priceBasedOnTime = calculateTimeBasedPrice(distanceInKm, durationInMinutes)
  
  // Arbitrage : Prendre le maximum (le plus rentable/protectif)
  let oneWayPrice = Math.max(priceBasedOnDistance, priceBasedOnTime)
  
  // Détecter si le trafic est la cause de la majoration
  const isTrafficSurcharge = priceBasedOnTime > priceBasedOnDistance
  
  // Appliquer majoration si aller-retour (prix * 2)
  let finalPrice = oneWayPrice
  if (isRoundTrip) {
    finalPrice = oneWayPrice * 2
  }
  
  // Arrondir à 2 décimales
  finalPrice = Math.round(finalPrice * 100) / 100
  
  return {
    price: finalPrice,
    priceBasedOnDistance: Math.round(priceBasedOnDistance * 100) / 100,
    priceBasedOnTime: Math.round(priceBasedOnTime * 100) / 100,
    isTrafficSurcharge,
  }
}

