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
    console.log('📥 POST /api/estimate - Requête reçue')
    const body = await request.json()
    console.log('📥 POST /api/estimate - Body:', JSON.stringify(body, null, 2))
    
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

    console.log('🌐 Appel Google Maps Distance Matrix:', {
      origin,
      destination,
      url: url.toString().replace(apiKey, '***KEY***'),
    })

    const response = await fetch(url.toString())
    const data = await response.json()
    
    console.log('📥 Réponse Google Maps:', {
      status: data.status,
      error_message: data.error_message,
      rows_count: data.rows?.length,
      element_status: data.rows?.[0]?.elements?.[0]?.status,
    })

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      console.error('❌ Google Maps API error:', {
        status: data.status,
        error_message: data.error_message,
        data,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
      })
      
      // Message d'erreur détaillé selon le type d'erreur
      let errorMessage = `Erreur Google Maps: ${data.status}`
      if (data.status === 'REQUEST_DENIED') {
        errorMessage = data.error_message || 'REQUEST_DENIED'
        
        // ✅ Détection spécifique de l'erreur "referer restrictions"
        if (data.error_message?.includes('referer restrictions') || 
            data.error_message?.includes('referrer restrictions')) {
          console.error('❌ ERREUR SPÉCIFIQUE : Restrictions HTTP referrers détectées')
          console.error('🔧 SOLUTION :')
          console.error('1. Allez dans Google Cloud Console > APIs & Services > Credentials')
          console.error('2. Cliquez sur votre clé API utilisée pour GOOGLE_MAPS_API_KEY')
          console.error('3. Dans "Application restrictions", choisissez "None" (pas "HTTP referrers")')
          console.error('4. OU créez une clé API séparée SANS HTTP referrers pour le serveur')
          console.error('5. Utilisez cette nouvelle clé pour GOOGLE_MAPS_API_KEY dans Vercel')
          console.error('6. Redéployez votre application')
          errorMessage = 'La clé API a des restrictions HTTP referrers qui ne fonctionnent pas côté serveur. Consultez les logs pour la solution.'
        } else {
          console.error('🔍 Causes possibles de REQUEST_DENIED:')
          console.error('1. Clé API invalide ou expirée')
          console.error('2. Restrictions HTTP referrers (domaines autorisés) - PROBLÈME DÉTECTÉ')
          console.error('3. Restrictions IP (si configurées, bloquent Vercel)')
          console.error('4. Distance Matrix API non activée dans Google Cloud Console')
          console.error('5. Quotas dépassés ou facturation non activée')
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: data.status,
          details: data.error_message || 'Vérifiez la console serveur pour plus de détails'
        },
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
    if (!element.distance || !element.distance.value) {
      console.error('❌ Distance non disponible dans la réponse Google Maps')
      return NextResponse.json(
        { error: 'Distance non disponible dans la réponse Google Maps' },
        { status: 500 }
      )
    }

    if (!element.duration || !element.duration.value) {
      console.error('❌ Durée non disponible dans la réponse Google Maps')
      return NextResponse.json(
        { error: 'Durée non disponible dans la réponse Google Maps' },
        { status: 500 }
      )
    }

    const distanceInMeters = element.distance.value // en mètres
    // ✅ duration_in_traffic peut ne pas être disponible si facturation non activée
    // Dans ce cas, on utilise duration normale
    const durationInSeconds = element.duration_in_traffic?.value || element.duration.value // en secondes (priorité au trafic)
    const distanceInKm = distanceInMeters / 1000 // convertir mètres en km
    const durationInMinutes = durationInSeconds / 60 // convertir secondes en minutes

    console.log('✅ Données extraites:', {
      distanceInKm: distanceInKm.toFixed(2),
      durationInMinutes: durationInMinutes.toFixed(2),
      hasTrafficData: !!element.duration_in_traffic,
    })

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
    console.error('❌ Erreur lors de l\'estimation:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      body: request.body ? 'Body received' : 'No body',
    })
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors de l\'estimation'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error && error.stack 
          ? error.stack.split('\n').slice(0, 3).join('\n')
          : undefined,
      },
      { status: 500 }
    )
  }
}

