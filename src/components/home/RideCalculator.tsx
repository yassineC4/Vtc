'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoogleMapsAutocomplete } from '@/hooks/useGoogleMaps'
import { useRideCalculator } from '@/hooks/useRideCalculator'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatPrice, formatDistance, formatDuration } from '@/lib/utils'
import { getTranslations, type Locale } from '@/lib/i18n'
import { useDebounce, debounce } from '@/lib/debounce'
import { ReservationForm, type ReservationData } from '@/components/home/ReservationForm'
import { Calendar, Clock, MapPin, Euro, Sparkles, CheckCircle2, Loader2, Zap, CalendarCheck, Navigation, AlertCircle, TrendingUp, Car, Crown, Users, Gem } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PopularDestination } from '@/types'

interface RideCalculatorProps {
  locale: Locale
  whatsappNumber?: string
}

type RideType = 'immediate' | 'reservation'
type VehicleCategory = 'standard' | 'berline' | 'van'

// Prix fixes selon la catégorie de véhicule (en euros)
const VEHICLE_FIXED_PRICES: Record<VehicleCategory, number> = {
  standard: 2,
  berline: 3,
  van: 3,
}

// Majoration pour garantie de service aller-retour (10% de majoration)
const ROUND_TRIP_PREMIUM_FEE = 0.10

export function RideCalculator({ locale, whatsappNumber = '0033695297192' }: RideCalculatorProps) {
  const t = getTranslations(locale)
  const [rideType, setRideType] = useState<RideType>('immediate')
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('standard')
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [departure, setDeparture] = useState('')
  const [arrival, setArrival] = useState('')
  const [date, setDate] = useState(() => {
    // Initialiser avec la date d'aujourd'hui au format YYYY-MM-DD
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState('')
  const [calculation, setCalculation] = useState<{
    distance: number
    duration: number
    price: number
  } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [destinationPrices, setDestinationPrices] = useState<Array<{
    destination: PopularDestination
    price: number
    distance: number
    loading: boolean
  }>>([])
  const [calculatingPrices, setCalculatingPrices] = useState(false)
  const [departureInput, setDepartureInput] = useState('')
  const [arrivalInput, setArrivalInput] = useState('')
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce pour les champs de saisie (1500ms)
  const debouncedDeparture = useDebounce(departureInput, 1500)
  const debouncedArrival = useDebounce(arrivalInput, 1500)

  const { calculateRide, loading, error } = useRideCalculator()
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

  const { inputRef: departureRef, isLoaded: isMapsLoaded } = useGoogleMapsAutocomplete(handleDepartureSelect)
  const { inputRef: arrivalRef } = useGoogleMapsAutocomplete(handleArrivalSelect)

  // Gérer la géolocalisation
  const handleUseMyLocation = async () => {
    const result = await requestLocation(locale)
    if (result && result.address) {
      setDeparture(result.address)
      setDepartureInput(result.address)
      // Calculer automatiquement les prix vers les destinations populaires
      await calculateDestinationPrices(result.address)
    }
  }

  // Calculer les prix vers les destinations populaires
  const calculateDestinationPrices = async (originAddress: string) => {
    setCalculatingPrices(true)
    try {
      const supabase = createClient()
      const { data: destinations, error } = await supabase
        .from('popular_destinations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6)

      if (error || !destinations) {
        console.error('Error loading destinations:', error)
        return
      }

      // Initialiser les destinations avec loading
      const destinationsWithPrices = destinations.map((dest: any) => ({
        destination: dest as PopularDestination,
        price: dest.fixed_price,
        distance: 0,
        loading: true,
      }))
      setDestinationPrices(destinationsWithPrices)

      // Calculer les prix réels pour chaque destination
      const calculatedPrices = await Promise.all(
        destinations.map(async (dest: any) => {
          try {
            const result = await calculateRide(originAddress, dest.address)
            if (result) {
              // Ajouter le prix fixe selon la catégorie de véhicule
              const fixedPrice = VEHICLE_FIXED_PRICES[vehicleCategory]
              let oneWayPrice = result.price + fixedPrice
              
              // Appliquer majoration si aller-retour : (Prix_Aller * 2) * 1.10
              let adjustedPrice = oneWayPrice
              if (isRoundTrip) {
                adjustedPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
              }
              
              return {
                destination: dest as PopularDestination,
                price: Math.round(adjustedPrice * 100) / 100,
                distance: result.distance,
                loading: false,
              }
            } else {
              // En cas d'erreur, utiliser le prix fixe de la destination + prix fixe véhicule
              const fixedPrice = VEHICLE_FIXED_PRICES[vehicleCategory]
              let oneWayPrice = dest.fixed_price + fixedPrice
              
              let finalPrice = oneWayPrice
              if (isRoundTrip) {
                finalPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
              }
              
              return {
                destination: dest as PopularDestination,
                price: Math.round(finalPrice * 100) / 100,
                distance: 0,
                loading: false,
              }
            }
          } catch (err) {
            console.error(`Error calculating price for ${dest.name_fr}:`, err)
            const fixedPrice = VEHICLE_FIXED_PRICES[vehicleCategory]
            let oneWayPrice = dest.fixed_price + fixedPrice
            
            let finalPrice = oneWayPrice
            if (isRoundTrip) {
              finalPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
            }
            
            return {
              destination: dest as PopularDestination,
              price: Math.round(finalPrice * 100) / 100,
              distance: 0,
              loading: false,
            }
          }
        })
      )

      setDestinationPrices(calculatedPrices)
    } catch (error) {
      console.error('Error calculating destination prices:', error)
    } finally {
      setCalculatingPrices(false)
    }
  }

  // Recalculer les prix des destinations quand la catégorie change (MAIS SEULEMENT si on a déjà une position)
  useEffect(() => {
    // On ne recalcule PAS automatiquement - l'utilisateur doit cliquer sur "Ma position" à nouveau
    // pour économiser les appels API
  }, [vehicleCategory])

  const handleCalculate = async () => {
    if (!departure || !arrival) {
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
    
    try {
      const result = await calculateRide(departure, arrival)
      if (result) {
        // Ajouter le prix fixe selon la catégorie de véhicule
        const fixedPrice = VEHICLE_FIXED_PRICES[vehicleCategory]
        const oneWayPrice = result.price + fixedPrice
        
        // Appliquer majoration si aller-retour : (Prix_Aller * 2) * 1.10
        let finalPrice = oneWayPrice
        if (isRoundTrip) {
          finalPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
        }
        
        setCalculation({
          ...result,
          price: Math.round(finalPrice * 100) / 100,
        })
        setShowSuccess(true)
        setRetryCount(0)
        
        // Scroll smooth vers le résultat
        setTimeout(() => {
          const resultElement = document.getElementById('calculation-result')
          resultElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 100)
      } else {
        setRetryCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Calculation error:', err)
      setRetryCount(prev => prev + 1)
    }
  }

  const handleBook = () => {
    if (!calculation || !departure || !arrival) return
    // Ouvrir le formulaire de réservation
    setShowReservationForm(true)
  }

  const handleReservationConfirm = (data: ReservationData) => {
    if (!calculation || !departure || !arrival) return

    setReservationData(data)
    
    let message: string

    const vehicleCategoryName = locale === 'fr'
      ? vehicleCategory === 'standard' ? 'Standard' : vehicleCategory === 'berline' ? 'Berline' : 'Van'
      : locale === 'ar'
      ? vehicleCategory === 'standard' ? 'ستاندرد' : vehicleCategory === 'berline' ? 'برلين' : 'فان'
      : vehicleCategory.charAt(0).toUpperCase() + vehicleCategory.slice(1)

    // Construire le message avec les informations du formulaire
    const passengerInfo = locale === 'fr'
      ? `\n👤 Passager: ${data.firstName} ${data.lastName}\n👥 Nombre de passagers: ${data.numberOfPassengers}`
      : locale === 'ar'
      ? `\n👤 الراكب: ${data.firstName} ${data.lastName}\n👥 عدد الركاب: ${data.numberOfPassengers}`
      : `\n👤 Passenger: ${data.firstName} ${data.lastName}\n👥 Number of passengers: ${data.numberOfPassengers}`

    const babySeatInfo = data.babySeat
      ? (locale === 'fr' ? '\n👶 Siège bébé: Oui' : locale === 'ar' ? '\n👶 مقعد الطفل: نعم' : '\n👶 Baby seat: Yes')
      : ''

    const paymentMethodText = data.paymentMethod === 'cash'
      ? (locale === 'fr' ? 'Espèces' : locale === 'ar' ? 'نقداً' : 'Cash')
      : (locale === 'fr' ? 'Carte' : locale === 'ar' ? 'بطاقة' : 'Card')
    
    const paymentInfo = locale === 'fr'
      ? `\n💳 Moyen de paiement: ${paymentMethodText}`
      : locale === 'ar'
      ? `\n💳 طريقة الدفع: ${paymentMethodText}`
      : `\n💳 Payment method: ${paymentMethodText}`

    const roundTripInfo = isRoundTrip
      ? (locale === 'fr' ? '\n🔁 Type: Aller-retour' : locale === 'ar' ? '\n🔁 النوع: ذهاب وعودة' : '\n🔁 Type: Round trip')
      : ''

    if (rideType === 'immediate') {
      // Course immédiate
      message = locale === 'fr'
        ? `Bonjour, je souhaite une course immédiate :\n📍 ${departure} > ${arrival}\n🚗 Catégorie : ${vehicleCategoryName}${roundTripInfo}\n💰 Prix estimé : ${formatPrice(calculation.price, 'fr-FR')}${passengerInfo}${babySeatInfo}${paymentInfo}`
        : locale === 'ar'
        ? `مرحباً، أرغب برحلة فورية:\n📍 ${departure} > ${arrival}\n🚗 الفئة: ${vehicleCategoryName}${roundTripInfo}\n💰 السعر المقدر: ${formatPrice(calculation.price, 'ar-SA')}${passengerInfo}${babySeatInfo}${paymentInfo}`
        : `Hello, I would like an immediate ride:\n📍 ${departure} > ${arrival}\n🚗 Category: ${vehicleCategoryName}${roundTripInfo}\n💰 Estimated price: ${formatPrice(calculation.price, 'en-US')}${passengerInfo}${babySeatInfo}${paymentInfo}`
    } else {
      // Réservation
      const dateStr = date || new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US')
      const timeStr = time || new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      message = locale === 'fr'
        ? `Bonjour, réservation souhaitée :\n📍 ${departure} > ${arrival}\n📅 Date : ${dateStr} à ${timeStr}\n🚗 Catégorie : ${vehicleCategoryName}${roundTripInfo}\n💰 Prix estimé : ${formatPrice(calculation.price, 'fr-FR')}${passengerInfo}${babySeatInfo}${paymentInfo}`
        : locale === 'ar'
        ? `مرحباً، حجز مطلوب:\n📍 ${departure} > ${arrival}\n📅 التاريخ: ${dateStr} في ${timeStr}\n🚗 الفئة: ${vehicleCategoryName}${roundTripInfo}\n💰 السعر المقدر: ${formatPrice(calculation.price, 'ar-SA')}${passengerInfo}${babySeatInfo}${paymentInfo}`
        : `Hello, booking requested:\n📍 ${departure} > ${arrival}\n📅 Date: ${dateStr} at ${timeStr}\n🚗 Category: ${vehicleCategoryName}${roundTripInfo}\n💰 Estimated price: ${formatPrice(calculation.price, 'en-US')}${passengerInfo}${babySeatInfo}${paymentInfo}`
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            {t.home.calculate}
          </h2>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
                      setDestinationPrices([])
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
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
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
                    onChange={(e) => setDate(e.target.value)}
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
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={loading || !departure || !arrival}
            className="w-full h-14 text-base relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.common.loading}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                {t.home.estimatePrice}
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          </Button>

          {/* Section des prix vers destinations populaires depuis la position */}
          {currentAddress && destinationPrices.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {locale === 'fr' 
                    ? `Prix depuis votre position` 
                    : `Prices from your location`}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span className="truncate">{currentAddress}</span>
              </p>
              
              {calculatingPrices ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {locale === 'fr' ? 'Calcul des prix en cours...' : 'Calculating prices...'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destinationPrices.map((item, index) => {
                    const dest = item.destination
                    const destName = locale === 'fr' ? dest.name_fr : dest.name_en
                    return (
                      <button
                        key={dest.id}
                        onClick={async () => {
                          setArrival(dest.address)
                          setArrivalInput(dest.address)
                          // Calculer automatiquement le prix avec la catégorie sélectionnée
                          if (departure) {
                            try {
                              const result = await calculateRide(departure, dest.address)
                              if (result) {
                                // Ajouter le prix fixe selon la catégorie de véhicule
                                const fixedPrice = VEHICLE_FIXED_PRICES[vehicleCategory]
                                const oneWayPrice = result.price + fixedPrice
                                
                                // Appliquer majoration si aller-retour : (Prix_Aller * 2) * 1.10
                                let finalPrice = oneWayPrice
                                if (isRoundTrip) {
                                  finalPrice = (oneWayPrice * 2) * (1 + ROUND_TRIP_PREMIUM_FEE)
                                }
                                
                                setCalculation({
                                  ...result,
                                  price: Math.round(finalPrice * 100) / 100,
                                })
                                setShowSuccess(true)
                                // Scroll vers le résultat
                                setTimeout(() => {
                                  document.getElementById('calculation-result')?.scrollIntoView({ behavior: 'smooth' })
                                }, 100)
                              }
                            } catch (err) {
                              console.error('Error calculating price:', err)
                            }
                          }
                        }}
                        className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {destName}
                            </p>
                            {item.distance > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDistance(item.distance, locale)}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {item.loading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            ) : (
                              <p className="font-bold text-blue-600 text-sm whitespace-nowrap">
                                {formatPrice(item.price, locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                {locale === 'fr'
                  ? 'Cliquez sur une destination pour l\'ajouter à votre trajet'
                  : 'Click on a destination to add it to your trip'}
              </p>
            </div>
          )}

          {error && retryCount > 0 && (
            <div className="p-4 text-sm text-destructive bg-red-50 border-2 border-red-100 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <p>{error}</p>
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
              className="mt-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 space-y-6 animate-scale-in shadow-xl hover:shadow-2xl transition-all duration-500"
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
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
                      {formatPrice(calculation.price, locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
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
                className="w-full h-14 text-base mt-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse-glow"
                size="lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t.home.bookRide}
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
        onClose={() => setShowReservationForm(false)}
        onConfirm={handleReservationConfirm}
      />
    </div>
  )
}

