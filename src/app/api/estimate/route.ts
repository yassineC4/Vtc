import { NextRequest, NextResponse } from 'next/server'

/**
 * ✅ Route API pour l'estimation de prix - VTC SOLO
 * POST /api/estimate
 * 
 * Body:
 * {
 *   origin: string
 *   destination: string
 *   category: 'standard' | 'berline' | 'van'
 *   is_round_trip?: boolean (optionnel, par défaut false)
 * }
 * 
 * Response:
 * {
 *   price: number (en euros)
 *   distance: string (formaté, ex: "15.5 km")
 *   duration: string (formaté, ex: "45 min")
 *   traffic_surcharge: boolean
 * }
 */
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, category, is_round_trip = false } = body

    // Validation des champs requis
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'origin et destination sont requis' },
        { status: 400 }
      )
    }

    if (!category || !['standard', 'berline', 'van'].includes(category)) {
      return NextResponse.json(
        { error: 'category doit être "standard", "berline" ou "van"' },
        { status: 400 }
      )
    }

    // Appeler Google Maps Distance Matrix API
    // ✅ Utiliser GOOGLE_MAPS_API_KEY (sans NEXT_PUBLIC) car c'est côté serveur
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY not configured')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', origin)
    url.searchParams.set('destinations', destination)
    url.searchParams.set('mode', 'driving')
    url.searchParams.set('units', 'metric')
    url.searchParams.set('departure_time', 'now') // ✅ Pour obtenir duration_in_traffic
    url.searchParams.set('traffic_model', 'best_guess')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      console.error('❌ Google Maps API error:', data.status, data)
      return NextResponse.json(
        { error: `Erreur Google Maps: ${data.status}` },
        { status: 500 }
      )
    }

    const element = data.rows[0].elements[0]
    if (element.status !== 'OK') {
      console.error('❌ Route calculation failed:', element.status)
      return NextResponse.json(
        { error: `Impossible de calculer l'itinéraire: ${element.status}` },
        { status: 500 }
      )
    }

    // ✅ Récupérer distance et durée (priorité à duration_in_traffic si disponible)
    const distanceInMeters = element.distance.value // en mètres
    const durationInSeconds = element.duration_in_traffic?.value || element.duration.value // en secondes (priorité au trafic)
    const distanceInKm = distanceInMeters / 1000 // convertir mètres en km
    const durationInMinutes = durationInSeconds / 60 // convertir secondes en minutes

    // ✅ A. CALCUL FORFAIT (ZONES) - VTC SOLO
    let priceForfait: number
    if (category === 'standard') {
      if (distanceInKm <= 3) {
        priceForfait = 15 // Zone 1 : 0 - 3 km
      } else if (distanceInKm <= 7) {
        priceForfait = 25 // Zone 2 : 3.01 - 7 km
      } else {
        priceForfait = 25 + ((distanceInKm - 7) * 1.90) // Zone 3 : > 7 km
      }
    } else {
      // berline ou van
      if (distanceInKm <= 3) {
        priceForfait = 20 // Zone 1 : 0 - 3 km
      } else if (distanceInKm <= 7) {
        priceForfait = 30 // Zone 2 : 3.01 - 7 km
      } else {
        priceForfait = 30 + ((distanceInKm - 7) * 3.50) // Zone 3 : > 7 km
      }
    }

    // ✅ B. CALCUL SÉCURITÉ TRAFIC (TEMPS)
    const priceTrafic = (distanceInKm * 1.10) + (durationInMinutes * 0.80)

    // ✅ C. ARBITRAGE : Prendre le maximum
    let oneWayPrice = Math.max(priceForfait, priceTrafic)

    // Détecter si le trafic est la cause de la majoration
    const traffic_surcharge = priceTrafic > priceForfait

    // Appliquer majoration si aller-retour (prix * 2)
    let finalPrice = oneWayPrice
    if (is_round_trip) {
      finalPrice = oneWayPrice * 2
    }

    // Arrondir à 2 décimales
    finalPrice = Math.round(finalPrice * 100) / 100

    // ✅ Formater distance et durée en strings
    const distanceFormatted = distanceInKm >= 1 
      ? `${distanceInKm.toFixed(1)} km`
      : `${Math.round(distanceInMeters)} m`
    
    const totalMinutes = Math.round(durationInMinutes)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const durationFormatted = hours > 0
      ? `${hours}h ${minutes}min`
      : `${minutes} min`

    return NextResponse.json({
      price: finalPrice,
      distance: distanceFormatted,
      duration: durationFormatted,
      traffic_surcharge,
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'estimation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'estimation' },
      { status: 500 }
    )
  }
}

