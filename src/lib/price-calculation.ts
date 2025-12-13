/**
 * Calcul du prix côté serveur pour validation
 */

const VEHICLE_FIXED_PRICES: Record<string, number> = {
  standard: 2,
  berline: 3,
  van: 3,
}

const ROUND_TRIP_PREMIUM_FEE = 0.10
const MINIMUM_PRICE = 15

interface PriceCalculationParams {
  departure_address: string
  arrival_address: string
  vehicle_category: 'standard' | 'berline' | 'van'
  is_round_trip: boolean
  price_per_km: number
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

  // Calculer le prix de base
  const distanceInKm = element.distance.value / 1000 // convertir mètres en km
  let price = distanceInKm * price_per_km

  // Tarif minimum
  if (price < MINIMUM_PRICE) {
    price = MINIMUM_PRICE
  }

  // Ajouter le prix fixe selon la catégorie de véhicule
  const fixedPrice = VEHICLE_FIXED_PRICES[vehicle_category] || 2
  let oneWayPrice = price + fixedPrice

  // Appliquer majoration si aller-retour
  let finalPrice = oneWayPrice
  if (is_round_trip) {
    finalPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
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

