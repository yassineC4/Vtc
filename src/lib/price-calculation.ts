/**
 * Calcul du prix côté serveur pour validation
 * ✅ LOGIQUE HYBRIDE : Max entre "Forfait Kilométrique" et "Tarification Temps"
 */

// ✅ Fonction de calcul du prix zonale (identique à RideCalculator.tsx)
function calculateZonalPrice(distanceInKm: number, category: 'standard' | 'berline' | 'van'): number {
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

// ✅ Prix basé sur le temps réel (Sécurité Trafic)
function calculateTimeBasedPrice(distanceInKm: number, durationInMinutes: number): number {
  return (distanceInKm * 1.10) + (durationInMinutes * 0.80)
}

interface PriceCalculationParams {
  departure_address: string
  arrival_address: string
  vehicle_category: 'standard' | 'berline' | 'van'
  is_round_trip: boolean
  price_per_km: number // Plus utilisé pour la tarification zonale, mais gardé pour compatibilité
}

/**
 * Calcule le prix d'une course côté serveur
 * Utilise Google Maps Distance Matrix API
 */
export async function calculatePriceServerSide(
  params: PriceCalculationParams
): Promise<number> {
  const { departure_address, arrival_address, vehicle_category, is_round_trip, price_per_km } = params

  // Appeler Google Maps Distance Matrix API
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured')
  }

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', departure_address)
  url.searchParams.set('destinations', arrival_address)
  url.searchParams.set('mode', 'driving')
  url.searchParams.set('units', 'metric')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())
  const data = await response.json()

  if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
    throw new Error(`Google Maps API error: ${data.status}`)
  }

  const element = data.rows[0].elements[0]
  if (element.status !== 'OK') {
    throw new Error(`Route calculation failed: ${element.status}`)
  }

  // ✅ LOGIQUE HYBRIDE : Calculer le prix avec tarification zonale ET temps réel, prendre le max
  const distanceInKm = element.distance.value / 1000 // convertir mètres en km
  const durationInMinutes = element.duration.value / 60 // convertir secondes en minutes
  
  // Prix A : Forfait Distance (Tarification Zonale)
  const priceBasedOnDistance = calculateZonalPrice(distanceInKm, vehicle_category)
  
  // Prix B : Temps Réel (Sécurité Trafic)
  const priceBasedOnTime = calculateTimeBasedPrice(distanceInKm, durationInMinutes)
  
  // Arbitrage : Prendre le maximum (le plus rentable/protectif)
  let oneWayPrice = Math.max(priceBasedOnDistance, priceBasedOnTime)

  // Appliquer majoration si aller-retour (prix * 2)
  let finalPrice = oneWayPrice
  if (is_round_trip) {
    finalPrice = oneWayPrice * 2
  }

  // Arrondir à 2 décimales
  return Math.round(finalPrice * 100) / 100
}

/**
 * Valide que le prix envoyé correspond au prix calculé côté serveur
 * Autorise une tolérance de 10% pour les variations de trafic
 */
export async function validatePrice(
  estimatedPrice: number,
  params: PriceCalculationParams
): Promise<{ valid: boolean; calculatedPrice?: number; error?: string }> {
  try {
    const calculatedPrice = await calculatePriceServerSide(params)
    const tolerance = calculatedPrice * 0.10 // 10% de tolérance

    // Vérifier si le prix est dans la tolérance
    const priceDifference = Math.abs(estimatedPrice - calculatedPrice)
    const valid = priceDifference <= tolerance

    if (!valid) {
      return {
        valid: false,
        calculatedPrice,
        error: `Price mismatch. Expected ~${calculatedPrice.toFixed(2)}€ but received ${estimatedPrice.toFixed(2)}€`,
      }
    }

    return { valid: true, calculatedPrice }
  } catch (error) {
    // En cas d'erreur de calcul (ex: API Google Maps indisponible), on accepte le prix
    // avec un warning dans les logs
    console.warn('Price validation failed, accepting client price:', error)
    return { valid: true }
  }
}

