'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useGoogleMapsAutocomplete } from '@/hooks/useGoogleMaps'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatPrice, formatDistance, formatDuration } from '@/lib/utils'
import { getTranslations, type Locale } from '@/lib/i18n'
import { useDebounce } from '@/lib/debounce'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'
import { ReservationForm, type ReservationData } from '@/components/home/ReservationForm'
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Loader2, Zap, CalendarCheck, Navigation, AlertCircle, Car, Crown, Users, Gem, Music, Music2, Music4, Thermometer, ThermometerSun, ThermometerSnowflake, MessageSquare, MessageSquareOff, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RideCalculatorProps {
  locale: Locale
  whatsappNumber?: string
}

type RideType = 'immediate' | 'reservation'
type VehicleCategory = 'standard' | 'berline' | 'van'

// ✅ NOUVELLE LOGIQUE : Tarification zonale (Zonal Pricing) - MODIFIÉE
// STANDARD :
//   0 à 3 km : 15€ fixe
//   3 à 7 km : 25€ fixe
//   > 7 km : 25€ + ((Distance - 7) * 1.90€) <-- Augmenté pour la rentabilité
// BERLINE/VAN :
//   0 à 3 km : 25€ fixe
//   3 à 7 km : 35€ fixe
//   > 7 km : 35€ + ((Distance - 7) * 3.50€)
function calculateZonalPrice(distanceInKm: number, category: VehicleCategory): number {
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
// Simule un tarif taximètre : (Distance * 1.10€) + (Durée_Minutes * 0.80€)
function calculateTimeBasedPrice(distanceInKm: number, durationInMinutes: number): number {
  return (distanceInKm * 1.10) + (durationInMinutes * 0.80)
}

export function RideCalculator({ locale, whatsappNumber = DEFAULT_PHONE_NUMBER }: RideCalculatorProps) {
  const t = getTranslations(locale)
  const [rideType, setRideType] = useState<RideType>('immediate')
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('standard')
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  // Initialiser depuis localStorage si disponible
  const [departure, setDeparture] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtc_departure') || ''
    }
    return ''
  })
  const [arrival, setArrival] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtc_arrival') || ''
    }
    return ''
  })
  const [date, setDate] = useState(() => {
    // Initialiser avec la date d'aujourd'hui au format YYYY-MM-DD
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState(() => {
    // Initialiser avec l'heure actuelle au format HH:MM
    if (typeof window !== 'undefined') {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return ''
  })
  const [dateTimeError, setDateTimeError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Protection contre les doubles clics
  const [isImmediateAvailable, setIsImmediateAvailable] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [calculation, setCalculation] = useState<{
    distance: number
    duration: number
    price: number
    priceBasedOnDistance?: number // Prix A : Forfait Distance
    priceBasedOnTime?: number // Prix B : Temps Réel
    isTrafficSurcharge?: boolean // TRUE si Prix B > Prix A (trafic dense)
    approachSurcharge?: number // Supplément approche si > 10km
  } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [departureInput, setDepartureInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtc_departure') || ''
    }
    return ''
  })
  const [arrivalInput, setArrivalInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtc_arrival') || ''
    }
    return ''
  })
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Préférences à bord (On-board preferences)
  const [musicPreference, setMusicPreference] = useState<'silence' | 'classic' | 'pop' | null>(null)
  const [temperaturePreference, setTemperaturePreference] = useState<'cool' | 'normal' | 'warm' | null>(null)
  const [conversationPreference, setConversationPreference] = useState<'work' | 'chat' | null>(null)

  // Debounce pour les champs de saisie (1500ms)
  const debouncedDeparture = useDebounce(departureInput, 1500)
  const debouncedArrival = useDebounce(arrivalInput, 1500)

  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { requestLocation, loading: geolocationLoading, error: geolocationError, address: currentAddress, reset: resetGeolocation } = useGeolocation()

  const handleDepartureSelect = useCallback((place: any) => {
    if (place.formatted_address) {
      setDeparture(place.formatted_address)
      setDepartureInput(place.formatted_address)
    }
  }, [])

  const handleArrivalSelect = useCallback((place: any) => {
    if (place.formatted_address) {
      setArrival(place.formatted_address)
      setArrivalInput(place.formatted_address)
    }
  }, [])

  // Synchroniser les valeurs debounced avec les états principaux (seulement si différentes)
  useEffect(() => {
    if (debouncedDeparture !== departure) {
      setDeparture(debouncedDeparture)
    }
  }, [debouncedDeparture])

  useEffect(() => {
    if (debouncedArrival !== arrival) {
      setArrival(debouncedArrival)
    }
  }, [debouncedArrival])

  // Synchroniser les sélections depuis l'autocomplete Google
  useEffect(() => {
    if (departure && departure !== departureInput) {
      setDepartureInput(departure)
    }
  }, [departure])

  useEffect(() => {
    if (arrival && arrival !== arrivalInput) {
      setArrivalInput(arrival)
    }
  }, [arrival])

  // Sauvegarder dans localStorage quand départ/arrivée changent
  useEffect(() => {
    if (typeof window !== 'undefined' && departure) {
      localStorage.setItem('vtc_departure', departure)
    }
  }, [departure])

  useEffect(() => {
    if (typeof window !== 'undefined' && arrival) {
      localStorage.setItem('vtc_arrival', arrival)
    }
  }, [arrival])

  // ✅ Synchroniser avec localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDeparture = localStorage.getItem('vtc_departure')
      if (savedDeparture && savedDeparture !== departure) {
        setDeparture(savedDeparture)
        setDepartureInput(savedDeparture)
      }
      
      const savedArrival = localStorage.getItem('vtc_arrival')
      if (savedArrival && savedArrival !== arrival) {
        setArrival(savedArrival)
        setArrivalInput(savedArrival)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Seulement au montage

  // ✅ FIX 3: Désactivé - Les courses immédiates sont toujours disponibles (gestion manuelle via WhatsApp)
  // Plus de vérification de disponibilité des chauffeurs - toujours permettre les courses immédiates
  useEffect(() => {
    // Toujours permettre les courses immédiates, même si aucun chauffeur n'est connecté
    setIsImmediateAvailable(true)
  }, [])

  // ✅ FIX 2: Validation stricte de la date/heure pour les réservations (minimum 1h à l'avance)
  const validateDateTime = (selectedDate: string, selectedTime: string): string | null => {
    if (rideType !== 'reservation' || !selectedDate || !selectedTime) {
      return null
    }

    const now = new Date()
    const [year, month, day] = selectedDate.split('-').map(Number)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    
    const selectedDateTime = new Date(year, month - 1, day, hours, minutes)
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000) // +1 heure

    if (selectedDateTime < oneHourLater) {
      // ✅ Message d'erreur bloquant : les réservations doivent être 1h à l'avance minimum
      return locale === 'fr'
        ? 'Les réservations doivent être faites au minimum 1 heure à l\'avance. Pour un départ immédiat, sélectionnez "Course immédiate".'
        : locale === 'ar'
        ? 'يجب أن تتم الحجوزات قبل ساعة واحدة على الأقل. للرحلات الفورية، يرجى اختيار "رحلة فورية".'
        : 'Reservations must be made at least 1 hour in advance. For immediate departure, select "Immediate ride".'
    }

    return null
  }

  const { inputRef: departureRef, isLoaded: isMapsLoaded } = useGoogleMapsAutocomplete(handleDepartureSelect)
  const { inputRef: arrivalRef } = useGoogleMapsAutocomplete(handleArrivalSelect)

  // Gérer la géolocalisation
  const handleUseMyLocation = async () => {
    const result = await requestLocation(locale)
    if (result && result.address) {
      setDeparture(result.address)
      setDepartureInput(result.address)
    }
  }

  // ✅ Recalculer automatiquement le prix quand la catégorie de véhicule ou l'option aller-retour change
  useEffect(() => {
    // Utiliser la forme fonctionnelle de setState pour accéder à la valeur actuelle sans la mettre en dépendance
    setCalculation((currentCalculation) => {
      // Si un calcul existe déjà avec une distance et une duration, on recalcule le prix avec la logique hybride
      if (currentCalculation && currentCalculation.distance && currentCalculation.duration) {
        // Calculer la distance en km et la durée en minutes
        const distanceInKm = currentCalculation.distance / 1000
        const durationInMinutes = currentCalculation.duration / 60
        
        // ✅ Prix A : Forfait Distance (Tarification Zonale)
        let priceBasedOnDistance = calculateZonalPrice(distanceInKm, vehicleCategory)
        
        // ✅ Prix B : Temps Réel (Sécurité Trafic)
        let priceBasedOnTime = calculateTimeBasedPrice(distanceInKm, durationInMinutes)
        
        // ✅ Arbitrage : Prendre le maximum (le plus rentable/protectif)
        let oneWayPrice = Math.max(priceBasedOnDistance, priceBasedOnTime)
        
        // Détecter si le trafic est la cause de la majoration
        const isTrafficSurcharge = priceBasedOnTime > priceBasedOnDistance
        
        // Récupérer le supplément d'approche existant (s'il existe)
        const approachSurcharge = currentCalculation.approachSurcharge || 0
        
        // Appliquer majoration si aller-retour : prix * 2
        let finalPrice = oneWayPrice + approachSurcharge
        if (isRoundTrip) {
          finalPrice = (oneWayPrice * 2) + approachSurcharge
        }
        
        const newPrice = Math.round(finalPrice * 100) / 100
        
        // Retourner l'objet mis à jour avec toutes les informations
        return {
          ...currentCalculation,
          price: newPrice,
          priceBasedOnDistance: Math.round(priceBasedOnDistance * 100) / 100,
          priceBasedOnTime: Math.round(priceBasedOnTime * 100) / 100,
          isTrafficSurcharge,
          approachSurcharge,
        }
      }
      // Retourner la valeur actuelle si aucune mise à jour nécessaire
      return currentCalculation
    })
  }, [vehicleCategory, isRoundTrip]) // ✅ Dépendances: vehicleCategory et isRoundTrip

  const handleCalculate = async () => {
    // Utiliser departureInput et arrivalInput si departure/arrival sont vides (pour permettre le calcul même si debounce n'a pas encore synchronisé)
    const finalDeparture = departure || departureInput
    const finalArrival = arrival || arrivalInput
    
    console.log('🔍 handleCalculate appelé:', { finalDeparture, finalArrival, vehicleCategory, isRoundTrip })
    
    if (!finalDeparture || !finalArrival) {
      console.warn('⚠️ Champs vides:', { finalDeparture, finalArrival })
      // Animation de shake sur les champs vides
      const inputs = document.querySelectorAll('input[type="text"]')
      inputs.forEach((input) => {
        input.classList.add('animate-pulse')
        setTimeout(() => input.classList.remove('animate-pulse'), 1000)
      })
      return
    }

    setCalculation(null)
    setShowSuccess(false)
    
    // Synchroniser immédiatement les valeurs si elles ne sont pas encore synchronisées
    if (departureInput && !departure) {
      setDeparture(departureInput)
    }
    if (arrivalInput && !arrival) {
      setArrival(arrivalInput)
    }
    
    setApiLoading(true)
    setApiError(null)
    
    try {
      const requestBody = {
        origin: finalDeparture,
        destination: finalArrival,
        category: vehicleCategory,
        is_round_trip: isRoundTrip,
      }
      
      console.log('📤 Envoi requête API /api/estimate:', requestBody)
      
      // ✅ Appel à la route API /api/estimate
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      
      console.log('📥 Réponse reçue:', { status: response.status, statusText: response.statusText, ok: response.ok })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || `Erreur API (${response.status})`
        console.error('❌ Erreur API /api/estimate:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody: {
            origin: finalDeparture,
            destination: finalArrival,
            category: vehicleCategory,
            is_round_trip: isRoundTrip,
          },
        })
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('📦 Données JSON reçues:', result)
      
      // ✅ Afficher une alerte si erreur détectée
      if (result.error) {
        console.error('❌ Erreur dans la réponse:', result.error, result.details)
        const errorMsg = `Erreur API: ${result.error}${result.details ? '\n\nDétails: ' + result.details : ''}`
        alert(errorMsg)
        setApiError(result.error)
        setApiLoading(false)
        return
      }
      
      // Vérifier que les données essentielles sont présentes
      if (!result.price || !result.distance || !result.duration) {
        console.error('❌ Données manquantes dans la réponse:', result)
        const errorMsg = locale === 'fr' 
          ? 'La réponse de l\'API est incomplète. Veuillez réessayer.'
          : 'API response is incomplete. Please try again.'
        alert(errorMsg)
        setApiError(errorMsg)
        setApiLoading(false)
        return
      }
      
      console.log('✅ Données valides reçues:', { price: result.price, distance: result.distance, duration: result.duration })
      
      // ✅ L'API retourne des strings formatées (distance: "15.5 km", duration: "45 min")
      // On doit les convertir en valeurs numériques pour le calcul interne
      // distance est en format "15.5 km" ou "500 m"
      const distanceMatch = result.distance.match(/([\d.]+)\s*(km|m)/)
      const distanceInMeters = distanceMatch 
        ? distanceMatch[2] === 'km' 
          ? Math.round(parseFloat(distanceMatch[1]) * 1000)
          : Math.round(parseFloat(distanceMatch[1]))
        : 0
      
      // duration est en format "45 min" ou "1h 30min"
      const durationMatch = result.duration.match(/(?:(\d+)h\s*)?(\d+)\s*min/)
      const durationInSeconds = durationMatch
        ? (parseInt(durationMatch[1] || '0') * 60 + parseInt(durationMatch[2])) * 60
        : 0
      
      // ✅ Gestion de l'approche (simulation : pour l'instant, on laisse à 0)
      // TODO: Implémenter le calcul réel de distance chauffeur -> départ client avec Google Distance Matrix
      let approachSurcharge = 0
      
      setCalculation({
        distance: distanceInMeters, // en mètres
        duration: durationInSeconds, // en secondes
        price: result.price,
        priceBasedOnDistance: 0, // Non retourné par l'API (calculé côté serveur)
        priceBasedOnTime: 0, // Non retourné par l'API (calculé côté serveur)
        isTrafficSurcharge: result.traffic_surcharge,
        approachSurcharge,
      })
      setShowSuccess(true)
      setRetryCount(0)
      
      // Scroll vers le résultat (compatible Safari - fallback si smooth ne marche pas)
      setTimeout(() => {
        const resultElement = document.getElementById('calculation-result')
        if (resultElement) {
          try {
            // Essayer smooth scroll (Chrome, Firefox)
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          } catch (scrollError) {
            // Fallback pour Safari qui peut avoir des problèmes avec smooth
            try {
              resultElement.scrollIntoView({ block: 'nearest' })
            } catch (fallbackError) {
              // Dernier recours : scroll manuel
              window.scrollTo({
                top: resultElement.offsetTop - 100,
                behavior: 'smooth',
              })
            }
          }
        }
      }, 100)
    } catch (err) {
      // ✅ Logs explicites pour le debug
      const errorMessage = err instanceof Error ? err.message : String(err)
      const errorDetails = err instanceof Error ? err.stack : 'No stack trace'
      
      console.error('❌ Erreur lors de l\'estimation:', {
        message: errorMessage,
        details: errorDetails,
        error: err,
        departure: finalDeparture,
        arrival: finalArrival,
        category: vehicleCategory,
        is_round_trip: isRoundTrip,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      })
      
      // Afficher un message d'erreur plus détaillé à l'utilisateur
      let userFriendlyError = errorMessage
      if (errorMessage.includes('REQUEST_DENIED') || errorMessage.includes('Google Maps')) {
        userFriendlyError = locale === 'fr'
          ? 'Erreur de configuration Google Maps. Veuillez contacter le support.'
          : 'Google Maps configuration error. Please contact support.'
      } else if (errorMessage.includes('Configuration serveur')) {
        userFriendlyError = locale === 'fr'
          ? 'Erreur de configuration serveur. Veuillez réessayer plus tard.'
          : 'Server configuration error. Please try again later.'
      }
      
      setApiError(userFriendlyError)
      setRetryCount(prev => prev + 1)
    } finally {
      setApiLoading(false)
    }
  }

  const handleBook = () => {
    if (!calculation || !departure || !arrival) return
    
    // Valider la date/heure si c'est une réservation
    if (rideType === 'reservation' && date && time) {
      const error = validateDateTime(date, time)
      if (error) {
        setDateTimeError(error)
        return
      }
    }
    
    setDateTimeError(null)
    // Ouvrir le formulaire de réservation
    setIsBooking(true)
    setShowReservationForm(true)
  }

  const handleReservationConfirm = async (data: ReservationData) => {
    if (isSubmitting || !calculation || !departure || !arrival) return

    // Valider à nouveau la date/heure avant confirmation
    if (rideType === 'reservation' && date && time) {
      const error = validateDateTime(date, time)
      if (error) {
        setDateTimeError(error)
        return
      }
    }

    setIsSubmitting(true)
    setDateTimeError(null)

    try {
      // Construire la date/heure programmée
      let formattedDateTime = ''
      if (rideType === 'reservation' && date && time) {
        const [year, month, day] = date.split('-').map(Number)
        const [hours, minutes] = time.split(':').map(Number)
        const bookingDate = new Date(year, month - 1, day, hours, minutes)
        
        // Formater la date pour le message WhatsApp
        try {
          formattedDateTime = bookingDate.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }) + ' à ' + bookingDate.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        } catch (formatError) {
          // Fallback si toLocaleDateString/toLocaleTimeString échouent
          const dayNames = locale === 'fr' 
            ? ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const monthNames = locale === 'fr'
            ? ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
            : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          
          const dayName = dayNames[bookingDate.getDay()]
          const day = bookingDate.getDate()
          const month = monthNames[bookingDate.getMonth()]
          const year = bookingDate.getFullYear()
          const hours = String(bookingDate.getHours()).padStart(2, '0')
          const minutes = String(bookingDate.getMinutes()).padStart(2, '0')
          
          formattedDateTime = locale === 'fr'
            ? `${dayName} ${day} ${month} ${year} à ${hours}:${minutes}`
            : `${dayName}, ${month} ${day}, ${year} at ${hours}:${minutes}`
        }
      } else {
        formattedDateTime = locale === 'fr' ? 'Immédiatement' : 'Immediately'
      }

      // Construire le message WhatsApp avec toutes les informations
      const vehicleCategoryText = locale === 'fr'
        ? (vehicleCategory === 'standard' ? 'Standard' : vehicleCategory === 'berline' ? 'Berline' : 'Van')
        : vehicleCategory
      
      const roundTripText = isRoundTrip 
        ? (locale === 'fr' ? 'Aller-retour' : 'Round trip')
        : (locale === 'fr' ? 'Aller simple' : 'One way')
      
      const paymentMethodText = data.paymentMethod === 'cash'
        ? (locale === 'fr' ? 'Espèces' : 'Cash')
        : (locale === 'fr' ? 'Carte' : 'Card')
      
      const babySeatText = data.babySeat
        ? (locale === 'fr' ? 'Oui' : 'Yes')
        : (locale === 'fr' ? 'Non' : 'No')
      
      // Préférences à bord
      const musicText = musicPreference === 'silence' 
        ? (locale === 'fr' ? 'Silence' : 'Silence')
        : musicPreference === 'classic'
        ? (locale === 'fr' ? 'Classique' : 'Classical')
        : musicPreference === 'pop'
        ? (locale === 'fr' ? 'Pop' : 'Pop')
        : (locale === 'fr' ? 'Non spécifié' : 'Not specified')
      
      const temperatureText = temperaturePreference === 'cool'
        ? (locale === 'fr' ? 'Frais' : 'Cool')
        : temperaturePreference === 'normal'
        ? (locale === 'fr' ? 'Normal' : 'Normal')
        : temperaturePreference === 'warm'
        ? (locale === 'fr' ? 'Chaud' : 'Warm')
        : (locale === 'fr' ? 'Non spécifié' : 'Not specified')
      
      const conversationText = conversationPreference === 'work'
        ? (locale === 'fr' ? 'Travail/Silence' : 'Work/Silence')
        : conversationPreference === 'chat'
        ? (locale === 'fr' ? 'Discussion' : 'Chat')
        : (locale === 'fr' ? 'Non spécifié' : 'Not specified')

      const adminMessage = locale === 'fr'
        ? `Bonjour, je souhaite réserver une course.

📍 Départ : ${departure}
📍 Arrivée : ${arrival}
💰 Prix estimé : ${formatPrice(calculation.price, 'fr-FR')}
📏 Distance : ${calculation.distance ? formatDistance(calculation.distance, locale) : 'N/A'}
⏱️ Durée : ${calculation.duration ? formatDuration(calculation.duration, locale) : 'N/A'}

👤 Client : ${data.firstName} ${data.lastName}
📞 Téléphone : ${data.phone || 'Non fourni'}
📧 Email : ${data.email || 'Non fourni'}

🚗 Catégorie : ${vehicleCategoryText}
🔄 Type : ${roundTripText}
👥 Passagers : ${data.numberOfPassengers}
👶 Siège bébé : ${babySeatText}
💳 Paiement : ${paymentMethodText}
📅 Date/Heure : ${formattedDateTime}

🎵 Préférences à bord :
🎶 Musique : ${musicText}
🌡️ Température : ${temperatureText}
💬 Conversation : ${conversationText}`
        : `Hello, I would like to book a ride.

📍 Departure: ${departure}
📍 Arrival: ${arrival}
💰 Estimated price: ${formatPrice(calculation.price, 'en-US')}
📏 Distance: ${calculation.distance ? formatDistance(calculation.distance, locale) : 'N/A'}
⏱️ Duration: ${calculation.duration ? formatDuration(calculation.duration, locale) : 'N/A'}

👤 Client: ${data.firstName} ${data.lastName}
📞 Phone: ${data.phone || 'Not provided'}
📧 Email: ${data.email || 'Not provided'}

🚗 Category: ${vehicleCategoryText}
🔄 Type: ${roundTripText}
👥 Passengers: ${data.numberOfPassengers}
👶 Baby seat: ${babySeatText}
💳 Payment: ${paymentMethodText}
📅 Date/Time: ${formattedDateTime}

🎵 On-board preferences:
🎶 Music: ${musicText}
🌡️ Temperature: ${temperatureText}
💬 Conversation: ${conversationText}`
      
      // Ouvrir WhatsApp directement
      const whatsappUrl = createWhatsAppUrl(whatsappNumber || DEFAULT_PHONE_NUMBER, adminMessage)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      
      setIsSubmitting(false)
      setShowReservationForm(false)
      setReservationData(null)
      
      // Réinitialiser les préférences après réservation
      setMusicPreference(null)
      setTemperaturePreference(null)
      setConversationPreference(null)
      
      // Message de succès
      const successMessage = locale === 'fr'
        ? '✅ WhatsApp s\'est ouvert avec votre demande. Veuillez envoyer le message pour finaliser votre réservation.'
        : locale === 'ar'
        ? '✅ تم فتح واتساب مع طلبك. يرجى إرسال الرسالة لإنهاء الحجز.'
        : '✅ WhatsApp has opened with your request. Please send the message to finalize your booking.'
      
      alert(successMessage)
    } catch (error) {
      console.error('Error opening WhatsApp:', error)
      setIsSubmitting(false)
      
      const errorMessage = locale === 'fr'
        ? 'Erreur lors de l\'ouverture de WhatsApp. Veuillez réessayer.'
        : 'Error opening WhatsApp. Please try again.'
      
      alert(errorMessage)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* En-tête épuré avec beaucoup d'espace */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          {locale === 'fr' ? 'Estimez votre course' : locale === 'ar' ? 'قدر رحلتك' : 'Estimate your ride'}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {locale === 'fr' 
            ? 'Chauffeur privé en quelques minutes. Prix affiché avant confirmation.'
            : locale === 'ar'
            ? 'سائق خاص في دقائق. السعر معروض قبل التأكيد.'
            : 'Private chauffeur in minutes. Price shown before you confirm.'}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 md:p-12">
        <div className="space-y-8">
          {!isMapsLoaded && (
            <div className="p-4 text-sm text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl mb-4 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="font-medium">
                  {locale === 'fr' 
                    ? 'Chargement de Google Maps...' 
                    : 'Loading Google Maps...'}
                </p>
              </div>
              <p className="text-xs mt-1 text-blue-500">
                {locale === 'fr'
                  ? 'L\'autocomplétion des adresses sera disponible dans quelques secondes.'
                  : 'Address autocomplete will be available in a few seconds.'}
              </p>
            </div>
          )}

          {/* Sélection du type de course - Style onglets premium */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              {locale === 'fr' ? 'Détails du trajet' : locale === 'ar' ? 'تفاصيل الرحلة' : 'Trip details'}
            </Label>
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setRideType('immediate')}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  rideType === 'immediate'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {locale === 'fr' ? 'Course immédiate' : locale === 'ar' ? 'رحلة فورية' : 'Immediate ride'}
              </button>
              <button
                type="button"
                onClick={() => setRideType('reservation')}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  rideType === 'reservation'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {locale === 'fr' ? 'Réservation' : locale === 'ar' ? 'حجز' : 'Reservation'}
              </button>
            </div>
          </div>

          {/* Sélection de la catégorie de véhicule - Style épuré */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              {t.home.vehicleCategory}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVehicleCategory('standard')}
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border transition-all duration-200 ${
                  vehicleCategory === 'standard'
                    ? 'border-gray-900 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Car className={`w-6 h-6 transition-colors ${
                  vehicleCategory === 'standard' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="text-sm font-semibold">
                  {t.home.standard}
                </span>
                <span className="text-xs text-gray-500">
                  {locale === 'fr' ? 'Jusqu\'à 3 passagers' : locale === 'ar' ? 'حتى 3 ركاب' : 'Up to 3 passengers'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleCategory('berline')}
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border transition-all duration-200 ${
                  vehicleCategory === 'berline'
                    ? 'border-gray-900 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Crown className={`w-6 h-6 transition-colors ${
                  vehicleCategory === 'berline' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="text-sm font-semibold">
                  {t.home.berline}
                </span>
                <span className="text-xs text-gray-500">
                  {locale === 'fr' ? 'Berline confort, 3 passagers' : locale === 'ar' ? 'سيارة مريحة، 3 ركاب' : 'Comfort sedan, 3 passengers'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleCategory('van')}
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border transition-all duration-200 ${
                  vehicleCategory === 'van'
                    ? 'border-gray-900 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Users className={`w-6 h-6 transition-colors ${
                  vehicleCategory === 'van' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="text-sm font-semibold">
                  {t.home.van}
                </span>
                <span className="text-xs text-gray-500">
                  {locale === 'fr' ? 'Van spacieux, jusqu\'à 7' : locale === 'ar' ? 'فان واسع، حتى 7' : 'Spacious van, up to 7'}
                </span>
              </button>
            </div>
          </div>

          {/* Option Aller-retour - Style épuré */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="roundTrip"
              checked={isRoundTrip}
              onChange={(e) => setIsRoundTrip(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            />
            <label htmlFor="roundTrip" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">
                {t.home.roundTrip}
              </span>
            </label>
          </div>

          {/* Champs de saisie - Style moderne épuré */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="departure" className="text-sm font-semibold text-gray-900">
                  {t.home.departure}
                </Label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={geolocationLoading || !isMapsLoaded}
                  className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                >
                  {geolocationLoading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {locale === 'fr' ? 'Détection...' : 'Detecting...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {locale === 'fr' ? 'Ma position' : 'My location'}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="departure"
                  ref={departureRef}
                  placeholder={
                    isMapsLoaded 
                      ? (locale === 'fr' ? 'Entrez le point de départ' : 'Enter pickup location')
                      : (locale === 'fr' ? 'Chargement...' : 'Loading...')
                  }
                  value={departureInput}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setDepartureInput(newValue)
                    if (currentAddress && newValue !== currentAddress) {
                      resetGeolocation()
                    }
                  }}
                  className="pl-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
                  disabled={!isMapsLoaded}
                />
              </div>
              {geolocationError && (
                <p className="text-xs text-amber-600">{geolocationError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival" className="text-sm font-semibold text-gray-900">
                {t.home.arrival}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="arrival"
                  ref={arrivalRef}
                  placeholder={
                    isMapsLoaded 
                      ? (locale === 'fr' ? 'Entrez la destination' : 'Enter drop-off location')
                      : (locale === 'fr' ? 'Chargement...' : 'Loading...')
                  }
                  value={arrivalInput}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setArrivalInput(newValue)
                  }}
                  className="pl-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
                  disabled={!isMapsLoaded}
                />
              </div>
            </div>
          </div>

          {/* Champs date/heure uniquement pour les réservations - Style épuré */}
          {rideType === 'reservation' && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-900">
                    {t.home.date}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      setDateTimeError(null)
                    }}
                    className="h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-semibold text-gray-900">
                    {t.home.time}
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTime = e.target.value
                      setTime(newTime)
                      if (date && newTime) {
                        const error = validateDateTime(date, newTime)
                        if (error) {
                          setDateTimeError(error)
                          setRideType('immediate')
                          setTimeout(() => {
                            alert(locale === 'fr'
                              ? '⚠️ La date/heure sélectionnée est trop proche. Passage automatique en "Course immédiate".'
                              : locale === 'ar'
                              ? '⚠️ التاريخ والوقت المحددان قريبان جداً. التحويل التلقائي إلى "رحلة فورية".'
                              : '⚠️ Selected date/time is too close. Automatically switching to "Immediate ride".')
                          }, 100)
                        } else {
                          setDateTimeError(null)
                        }
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
                  />
                </div>
              </div>
              
              {dateTimeError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  <p>{dateTimeError}</p>
                </div>
              )}
            </div>
          )}

          {/* Section Préférences à bord - Style premium minimaliste */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {locale === 'fr' ? 'Préférences à bord' : locale === 'ar' ? 'تفضيلات على متن الطائرة' : 'On-board preferences'}
              </Label>
              <span className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                {locale === 'fr' ? 'Premium' : locale === 'ar' ? 'مميز' : 'Premium'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {locale === 'fr' 
                ? 'Personnalisez votre expérience de trajet' 
                : locale === 'ar' 
                ? 'خصص تجربة رحلتك' 
                : 'Customize your ride experience'}
            </p>
            
            {/* Ambiance musicale */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {locale === 'fr' ? 'Musique' : locale === 'ar' ? 'موسيقى' : 'Music'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMusicPreference(musicPreference === 'silence' ? null : 'silence')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    musicPreference === 'silence'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquareOff className={`w-5 h-5 ${musicPreference === 'silence' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Silence' : locale === 'ar' ? 'صمت' : 'Silence'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMusicPreference(musicPreference === 'classic' ? null : 'classic')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    musicPreference === 'classic'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Music2 className={`w-5 h-5 ${musicPreference === 'classic' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Classique' : locale === 'ar' ? 'كلاسيكي' : 'Classical'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMusicPreference(musicPreference === 'pop' ? null : 'pop')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    musicPreference === 'pop'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Music4 className={`w-5 h-5 ${musicPreference === 'pop' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Pop' : locale === 'ar' ? 'بوب' : 'Pop'}
                  </span>
                </button>
              </div>
            </div>

            {/* Température */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {locale === 'fr' ? 'Température' : locale === 'ar' ? 'درجة الحرارة' : 'Temperature'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTemperaturePreference(temperaturePreference === 'cool' ? null : 'cool')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    temperaturePreference === 'cool'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ThermometerSnowflake className={`w-5 h-5 ${temperaturePreference === 'cool' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Frais' : locale === 'ar' ? 'بارد' : 'Cool'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemperaturePreference(temperaturePreference === 'normal' ? null : 'normal')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    temperaturePreference === 'normal'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Thermometer className={`w-5 h-5 ${temperaturePreference === 'normal' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Normal' : locale === 'ar' ? 'عادي' : 'Normal'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemperaturePreference(temperaturePreference === 'warm' ? null : 'warm')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    temperaturePreference === 'warm'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ThermometerSun className={`w-5 h-5 ${temperaturePreference === 'warm' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {locale === 'fr' ? 'Chaud' : locale === 'ar' ? 'دافئ' : 'Warm'}
                  </span>
                </button>
              </div>
            </div>

            {/* Niveau de conversation */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {locale === 'fr' ? 'Conversation' : locale === 'ar' ? 'محادثة' : 'Conversation'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConversationPreference(conversationPreference === 'work' ? null : 'work')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    conversationPreference === 'work'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className={`w-5 h-5 ${conversationPreference === 'work' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-center">
                    {locale === 'fr' ? 'Travail/Silence' : locale === 'ar' ? 'عمل/صمت' : 'Work/Silence'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setConversationPreference(conversationPreference === 'chat' ? null : 'chat')}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    conversationPreference === 'chat'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className={`w-5 h-5 ${conversationPreference === 'chat' ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-center">
                    {locale === 'fr' ? 'Discussion' : locale === 'ar' ? 'محادثة' : 'Chat'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bouton d'estimation - Style premium épuré */}
          <button
            onClick={handleCalculate}
            disabled={apiLoading || (!departure && !departureInput) || (!arrival && !arrivalInput)}
            className="w-full h-14 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {apiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.common.loading}</span>
              </>
            ) : (
              <span>{t.home.estimatePrice}</span>
            )}
          </button>

          {apiError && (
            <div className="p-4 text-sm text-destructive bg-red-50 border-2 border-red-100 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <p>{apiError}</p>
                {retryCount < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCalculate}
                    className="ml-2"
                  >
                    {locale === 'fr' ? 'Réessayer' : 'Retry'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Résultat du calcul - Style premium épuré */}
          {calculation && (
            <div 
              id="calculation-result"
              className="mt-8 p-8 bg-white rounded-lg border border-gray-200 shadow-sm space-y-6"
            >
              <div className="grid grid-cols-2 gap-8 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t.home.distance}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDistance(calculation.distance, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t.home.duration}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(calculation.duration, locale)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {t.home.estimatedPrice}
                  </span>
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(calculation.price, locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                
                {/* Alerte trafic dense - Style épuré */}
                {calculation.isTrafficSurcharge && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      {locale === 'fr' ? (
                        <>⚠️ <span className="font-semibold">Trafic dense détecté.</span> Le trajet prendra environ{' '}
                        <span className="font-bold">{Math.round(calculation.duration / 60)} min</span>. Le prix a été ajusté.</>
                      ) : locale === 'ar' ? (
                        <>⚠️ <span className="font-semibold">تم اكتشاف ازدحام مروري.</span> ستستغرق الرحلة حوالي{' '}
                        <span className="font-bold">{Math.round(calculation.duration / 60)} دقيقة</span>. تم تعديل السعر.</>
                      ) : (
                        <>⚠️ <span className="font-semibold">Heavy traffic detected.</span> Journey will take approximately{' '}
                        <span className="font-bold">{Math.round(calculation.duration / 60)} min</span>. Price has been adjusted.</>
                      )}
                    </p>
                  </div>
                )}
                
                {isRoundTrip && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">
                      {t.home.includesRoundTrip}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleBook} 
                disabled={isBooking || isSubmitting || (rideType === 'reservation' && !!dateTimeError)}
                className="w-full h-14 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{locale === 'fr' ? 'Réservation...' : locale === 'ar' ? 'جارٍ الحجز...' : 'Booking...'}</span>
                  </>
                ) : (
                  <span>{t.home.bookRide}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de réservation */}
      <ReservationForm
        open={showReservationForm}
        onClose={() => {
          setShowReservationForm(false)
          setIsBooking(false)
        }}
        onConfirm={handleReservationConfirm}
      />
    </div>
  )
}

