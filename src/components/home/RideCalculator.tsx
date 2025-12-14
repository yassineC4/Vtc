'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoogleMapsAutocomplete } from '@/hooks/useGoogleMaps'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatPrice, formatDistance, formatDuration } from '@/lib/utils'
import { getTranslations, type Locale } from '@/lib/i18n'
import { useDebounce, debounce } from '@/lib/debounce'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER, formatPhoneForWhatsApp } from '@/lib/whatsapp'
import { ReservationForm, type ReservationData } from '@/components/home/ReservationForm'
import { Calendar, Clock, MapPin, Euro, Sparkles, CheckCircle2, Loader2, Zap, CalendarCheck, Navigation, AlertCircle, Car, Crown, Users, Gem } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RideCalculatorProps {
  locale: Locale
  whatsappNumber?: string
}

type RideType = 'immediate' | 'reservation'
type VehicleCategory = 'standard' | 'berline' | 'van'

// ✅ PARAMÈTRES DE BASE (Ajustables)
const RATE_PER_MINUTE = 0.50 // Pour compenser le temps passé dans les bouchons
const MIN_PRICE_STANDARD = 15 // Prix minimum pour Standard
const MIN_PRICE_VAN = 25 // Prix minimum pour Van/Berline
const APPROACH_DISTANCE_THRESHOLD = 10 // Distance en km au-delà de laquelle on ajoute un supplément
const APPROACH_SURCHARGE = 10 // Supplément en € pour approche lointaine

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

  // Debounce pour les champs de saisie (1500ms)
  const debouncedDeparture = useDebounce(departureInput, 1500)
  const debouncedArrival = useDebounce(arrivalInput, 1500)

  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { requestLocation, loading: geolocationLoading, error: geolocationError, address: currentAddress, reset: resetGeolocation } = useGeolocation()

  const handleDepartureSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setDeparture(place.formatted_address)
      setDepartureInput(place.formatted_address)
    }
  }, [])

  const handleArrivalSelect = useCallback((place: google.maps.places.PlaceResult) => {
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
    
    if (!finalDeparture || !finalArrival) {
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
      // ✅ Appel à la route API /api/estimate
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: finalDeparture,
          destination: finalArrival,
          category: vehicleCategory,
          is_round_trip: isRoundTrip,
        }),
      })

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
      console.log('Réponse API:', result)
      console.log('✅ Réponse API /api/estimate:', result)
      
      // ✅ Afficher une alerte si erreur détectée
      if (result.error) {
        alert(`Erreur API: ${result.error}${result.details ? '\n\nDétails: ' + result.details : ''}`)
        setApiError(result.error)
        setApiLoading(false)
        return
      }
      
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
    // 🔒 Protection contre les doubles clics (race condition)
    if (isSubmitting || !calculation || !departure || !arrival) return

    // Valider à nouveau la date/heure avant confirmation
    if (rideType === 'reservation' && date && time) {
      const error = validateDateTime(date, time)
      if (error) {
        setDateTimeError(error)
        return
      }
    }

    setIsBooking(true)
    setIsSubmitting(true) // 🔒 Blocage immédiat
    setDateTimeError(null)

    try {
      // Construire la date/heure programmée
      let scheduledDate: string | null = null
      let formattedDateTime = ''
      if (rideType === 'reservation' && date && time) {
        const [year, month, day] = date.split('-').map(Number)
        const [hours, minutes] = time.split(':').map(Number)
        const bookingDate = new Date(year, month - 1, day, hours, minutes)
        scheduledDate = bookingDate.toISOString()
        
        // Formater la date pour le message WhatsApp (compatible Safari)
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
          // Fallback si toLocaleDateString/toLocaleTimeString échouent (Safari iOS parfois)
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

      // Créer la réservation dans la base de données
      const bookingData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        departure_address: departure,
        arrival_address: arrival,
        scheduled_date: scheduledDate,
        ride_type: rideType,
        vehicle_category: vehicleCategory,
        is_round_trip: isRoundTrip,
        number_of_passengers: data.numberOfPassengers,
        baby_seat: data.babySeat,
        payment_method: data.paymentMethod,
        estimated_price: calculation.price,
        estimated_distance: calculation.distance,
        estimated_duration: calculation.duration,
        // Le statut sera défini côté serveur (confirmed pour VTC Solo)
      }

      console.log('📤 Envoi de la réservation:', bookingData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      console.log('📥 Réponse API:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erreur API:', errorData)
        throw new Error(errorData.error || `Failed to create booking (${response.status})`)
      }

      // Vérifier que la réponse contient bien les données de la réservation créée
      const result = await response.json()
      console.log('✅ Résultat API:', result)
      
      if (!result.data || !result.data.id) {
        console.error('❌ Pas de données retournées:', result)
        throw new Error('Booking was not created successfully - No data returned')
      }
      
      console.log('✅ Réservation créée avec ID:', result.data.id)

      setReservationData(data)
      setIsBooking(false)
      setIsSubmitting(false) // 🔓 Déblocage après succès
      
      // ✅ SÉQUENCE CORRECTE : WhatsApp s'ouvre APRÈS la confirmation de l'insertion en DB
      // Générer le message WhatsApp pour l'admin
      const adminMessage = locale === 'fr'
        ? `Bonjour, je viens de faire une demande de réservation sur le site.

Trajet : ${departure} ➔ ${arrival}

Date : ${formattedDateTime}

Client : ${data.firstName} ${data.lastName}`
        : `Hello, I just made a reservation request on the website.

Route: ${departure} ➔ ${arrival}

Date: ${formattedDateTime}

Client: ${data.firstName} ${data.lastName}`
      
      // Ouvrir WhatsApp vers le numéro admin
      const whatsappUrl = createWhatsAppUrl(whatsappNumber || DEFAULT_PHONE_NUMBER, adminMessage)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      
      // Afficher une modale de succès
      const successMessage = locale === 'fr'
        ? `✅ Demande enregistrée ! Veuillez envoyer le message WhatsApp qui vient de s'ouvrir pour finaliser la demande.`
        : locale === 'ar'
        ? `✅ تم تسجيل الطلب! يرجى إرسال رسالة واتساب التي تم فتحها للتو لإنهاء الطلب.`
        : `✅ Request saved! Please send the WhatsApp message that just opened to finalize your request.`
      
      alert(successMessage)
    } catch (error) {
      console.error('❌ Erreur lors de la création de la réservation:', error)
      setIsBooking(false)
      setIsSubmitting(false) // 🔓 Déblocage après erreur
      
      // Afficher un message d'erreur détaillé pour le debug
      const errorMessage = error instanceof Error 
        ? error.message 
        : (locale === 'fr'
          ? 'Erreur lors de la création de la réservation. Veuillez réessayer.'
          : locale === 'ar'
          ? 'خطأ في إنشاء الحجز. يرجى المحاولة مرة أخرى.'
          : 'Error creating booking. Please try again.')
      
      const fullErrorMessage = locale === 'fr'
        ? `Erreur : ${errorMessage}\n\nVérifiez la console du navigateur (F12) et les logs serveur pour plus de détails.`
        : `Error: ${errorMessage}\n\nCheck the browser console (F12) and server logs for more details.`
      
      alert(fullErrorMessage)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            {t.home.calculate}
          </h2>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
          {locale === 'fr' 
            ? 'Obtenez une estimation instantanée de votre course en quelques secondes'
            : 'Get an instant estimate of your ride in seconds'}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Formulaire en premier pour mobile-first */}
        <div className="lg:col-span-3 order-2 lg:order-1">
      <Card className="p-8 md:p-12">
        <CardContent className="space-y-8 p-0">
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

          {/* Sélection du type de course */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {locale === 'fr' ? 'Type de course' : 'Ride type'}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRideType('immediate')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  rideType === 'immediate'
                    ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <Zap className={`w-5 h-5 ${rideType === 'immediate' ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Course immédiate' : 'Immediate ride'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRideType('reservation')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  rideType === 'reservation'
                    ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <CalendarCheck className={`w-5 h-5 ${rideType === 'reservation' ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Réservation' : 'Reservation'}
                </span>
              </button>
            </div>
          </div>

          {/* Sélection de la catégorie de véhicule */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t.home.vehicleCategory}
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setVehicleCategory('standard')}
                className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  vehicleCategory === 'standard'
                    ? 'border-primary/50 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-2xl shadow-primary/20 scale-105 ring-2 ring-primary/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                <div className={`relative p-4 rounded-2xl transition-all duration-500 ${
                  vehicleCategory === 'standard' 
                    ? 'bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/30' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-gray-200 group-hover:to-gray-100'
                }`}>
                  <Car className={`w-10 h-10 transition-all duration-500 ${
                    vehicleCategory === 'standard' 
                      ? 'text-primary drop-shadow-lg' 
                      : 'text-gray-600 group-hover:text-gray-800'
                  } ${vehicleCategory === 'standard' ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`font-bold text-sm transition-colors duration-300 ${
                  vehicleCategory === 'standard' ? 'text-primary' : 'text-gray-700'
                }`}>
                  {t.home.standard}
                </span>
                {vehicleCategory === 'standard' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setVehicleCategory('berline')}
                className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  vehicleCategory === 'berline'
                    ? 'border-amber-400/60 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-amber-50/40 text-amber-700 shadow-2xl shadow-amber-300/30 scale-105 ring-2 ring-amber-300/30'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                <div className={`relative p-4 rounded-2xl transition-all duration-500 ${
                  vehicleCategory === 'berline' 
                    ? 'bg-gradient-to-br from-amber-200/40 via-yellow-100/30 to-amber-100/20 shadow-lg shadow-amber-300/40' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-gray-200 group-hover:to-gray-100'
                }`}>
                  <Crown className={`w-10 h-10 transition-all duration-500 ${
                    vehicleCategory === 'berline' 
                      ? 'text-amber-600 drop-shadow-lg fill-amber-500/30' 
                      : 'text-gray-600 group-hover:text-gray-800'
                  } ${vehicleCategory === 'berline' ? 'animate-pulse' : ''}`} />
                  <Gem className={`absolute -top-1 -right-1 w-4 h-4 transition-all duration-500 ${
                    vehicleCategory === 'berline' ? 'text-amber-500 animate-ping' : 'opacity-0'
                  }`} />
                </div>
                <span className={`font-bold text-sm transition-colors duration-300 ${
                  vehicleCategory === 'berline' ? 'text-amber-700' : 'text-gray-700'
                }`}>
                  {t.home.berline}
                </span>
                {vehicleCategory === 'berline' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setVehicleCategory('van')}
                className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  vehicleCategory === 'van'
                    ? 'border-blue-400/60 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-blue-50/40 text-blue-700 shadow-2xl shadow-blue-300/30 scale-105 ring-2 ring-blue-300/30'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                <div className={`relative p-4 rounded-2xl transition-all duration-500 ${
                  vehicleCategory === 'van' 
                    ? 'bg-gradient-to-br from-blue-200/40 via-indigo-100/30 to-blue-100/20 shadow-lg shadow-blue-300/40' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-gray-200 group-hover:to-gray-100'
                }`}>
                  <Users className={`w-10 h-10 transition-all duration-500 ${
                    vehicleCategory === 'van' 
                      ? 'text-blue-600 drop-shadow-lg' 
                      : 'text-gray-600 group-hover:text-gray-800'
                  } ${vehicleCategory === 'van' ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`font-bold text-sm transition-colors duration-300 ${
                  vehicleCategory === 'van' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {t.home.van}
                </span>
                {vehicleCategory === 'van' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>
            </div>
          </div>

          {/* Option Aller-retour */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary/30 transition-all duration-200">
            <input
              type="checkbox"
              id="roundTrip"
              checked={isRoundTrip}
              onChange={(e) => setIsRoundTrip(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="roundTrip" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {t.home.roundTrip}
                </span>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  {t.home.roundTripDescription}
                </span>
              </div>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="departure" className="text-base">
                  {t.home.departure}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  disabled={geolocationLoading || !isMapsLoaded}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  {geolocationLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{locale === 'fr' ? 'Détection...' : 'Detecting...'}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3" />
                      <span>{locale === 'fr' ? 'Ma position' : 'My location'}</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="departure"
                  ref={departureRef}
                  placeholder={
                    isMapsLoaded 
                      ? (locale === 'fr' ? 'Votre adresse de départ' : 'Your departure address')
                      : (locale === 'fr' ? 'Chargement...' : 'Loading...')
                  }
                  value={departureInput}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setDepartureInput(newValue)
                    // Ne pas mettre à jour departure immédiatement - attendre le debounce
                    if (currentAddress && newValue !== currentAddress) {
                      resetGeolocation()
                    }
                  }}
                  className="pl-12"
                  disabled={!isMapsLoaded}
                />
              </div>
              {geolocationError && (
                <div className="flex items-start gap-2 p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">{geolocationError}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="arrival" className="text-base">
                {t.home.arrival}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="arrival"
                  ref={arrivalRef}
                  placeholder={
                    isMapsLoaded 
                      ? t.home.arrival 
                      : (locale === 'fr' ? 'Chargement...' : 'Loading...')
                  }
                  value={arrivalInput}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setArrivalInput(newValue)
                    // Ne pas mettre à jour arrival immédiatement - attendre le debounce
                  }}
                  className="pl-12"
                  disabled={!isMapsLoaded}
                />
              </div>
            </div>
          </div>

          {/* Champs date/heure uniquement pour les réservations */}
          {rideType === 'reservation' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-base">
                    {t.home.date}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value)
                        setDateTimeError(null)
                      }}
                      className="pl-12"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="time" className="text-base">
                    {t.home.time}
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                            // ✅ FIX 2: Si date/heure invalide (< 1h), basculer automatiquement sur "Course immédiate"
                            setRideType('immediate')
                            // Afficher un message informatif
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
                      className="pl-12"
                    />
                  </div>
                </div>
              </div>
              
              {dateTimeError && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{dateTimeError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={apiLoading || (!departure && !departureInput) || (!arrival && !arrivalInput)}
            className="w-full h-14 text-base relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {apiLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.common.loading}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                {t.home.estimatePrice}
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          </Button>

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

          {calculation && (
            <div 
              id="calculation-result"
              className="mt-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 space-y-6 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in"
            >
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    {t.home.distance}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDistance(calculation.distance, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    {t.home.duration}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(calculation.duration, locale)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-700">
                    {t.home.estimatedPrice}
                  </span>
                  <div className="flex items-center gap-2">
                    {showSuccess && (
                      <CheckCircle2 className="w-6 h-6 text-green-500 animate-scale-in" />
                    )}
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      {formatPrice(calculation.price, locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
                
                {/* ✅ Alerte trafic dense si le prix basé sur le temps est supérieur */}
                {calculation.isTrafficSurcharge && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 rounded-xl shadow-md animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 flex items-center gap-1">
                        <span className="text-xl">🚗</span>
                        <span className="text-xl">⏳</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-orange-900 leading-relaxed">
                          {locale === 'fr' ? (
                            <>
                              <span className="font-semibold">⚠️ Trafic dense détecté.</span> Le trajet va durer plus longtemps que prévu (environ{' '}
                              <span className="font-bold text-orange-950">{Math.round(calculation.duration / 60)} min</span>). Le prix a été ajusté pour tenir compte de cette durée.
                            </>
                          ) : locale === 'ar' ? (
                            <>
                              <span className="font-semibold">⚠️ تم اكتشاف ازدحام مروري.</span> ستستغرق الرحلة وقتاً أطول مما هو متوقع (حوالي{' '}
                              <span className="font-bold text-orange-950">{Math.round(calculation.duration / 60)} دقيقة</span>). تم تعديل السعر لمراعاة هذه المدة.
                            </>
                          ) : (
                            <>
                              <span className="font-semibold">⚠️ Heavy traffic detected.</span> The journey will take longer than expected (approximately{' '}
                              <span className="font-bold text-orange-950">{Math.round(calculation.duration / 60)} min</span>). The price has been adjusted to account for this duration.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isRoundTrip && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-indigo-900">
                      {t.home.includesRoundTrip}
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleBook} 
                disabled={isBooking || isSubmitting || (rideType === 'reservation' && !!dateTimeError)}
                className="w-full h-14 text-base mt-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isBooking ? (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {locale === 'fr' ? 'Réservation...' : locale === 'ar' ? 'جارٍ الحجز...' : 'Booking...'}
                  </span>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t.home.bookRide}
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Image décorative - après le formulaire pour ne pas masquer le contenu */}
        <div className="hidden lg:block lg:col-span-2 order-1 lg:order-2 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
          <div className="sticky top-24 relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500">
            <Image
              src="/images/calculator-side.jpg"
              alt="Service VTC premium"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 1024px) 0vw, 40vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
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

