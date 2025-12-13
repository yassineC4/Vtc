'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { PopularDestination } from '@/types'
import { getTranslations, type Locale } from '@/lib/i18n'
import { formatPrice, formatDistance } from '@/lib/utils'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'
import { ReservationForm, type ReservationData } from '@/components/home/ReservationForm'
import { MapPin, Plane, Train, Navigation, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useGoogleMapsAutocomplete } from '@/hooks/useGoogleMaps'
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistanceMatrixBatch } from '@/lib/google-maps'
import { useDebounce } from '@/lib/debounce'

interface PopularDestinationsProps {
  locale: Locale
  whatsappNumber?: string
}

const iconMap: Record<string, React.ElementType> = {
  airplane: Plane,
  train: Train,
  location: MapPin,
  navigation: Navigation,
  mapPin: MapPin,
}

type VehicleCategory = 'standard' | 'berline' | 'van'

// ✅ Fonction utilitaire : Obtenir le taux au km selon la distance totale et la catégorie (tarification dégressive)
function getRatePerKm(distanceInKm: number, category: VehicleCategory): number {
  if (category === 'standard') {
    if (distanceInKm <= 15) return 3.00
    if (distanceInKm <= 50) return 2.70
    if (distanceInKm <= 70) return 2.50
    if (distanceInKm <= 200) return 2.10
    return 1.70
  } else {
    if (distanceInKm <= 15) return 4.00
    if (distanceInKm <= 50) return 3.70
    if (distanceInKm <= 70) return 3.50
    if (distanceInKm <= 200) return 3.10
    return 1.90
  }
}

interface DestinationWithCalculation extends PopularDestination {
  calculatedDistance?: number // en mètres
  calculatedDuration?: number // en secondes
  calculatedPrice?: number // prix calculé (pour comparaison)
  loadingCalculation?: boolean
}

export function PopularDestinations({ locale, whatsappNumber = DEFAULT_PHONE_NUMBER }: PopularDestinationsProps) {
  const t = getTranslations(locale)
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [destinationsWithCalc, setDestinationsWithCalc] = useState<DestinationWithCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<PopularDestination | null>(null)
  
  // ✅ État pour le point de départ
  const [departureAddress, setDepartureAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtc_departure') || ''
    }
    return ''
  })
  const [departureInput, setDepartureInput] = useState(departureAddress)
  const [calculatingPrices, setCalculatingPrices] = useState(false)
  
  // ✅ Debounce de l'adresse de départ (1500ms) pour éviter de spammer l'API
  const debouncedDeparture = useDebounce(departureInput, 1500)
  
  // ✅ Hooks pour Google Maps et géolocalisation
  const handleDepartureSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setDepartureAddress(place.formatted_address)
      setDepartureInput(place.formatted_address)
      // Stocker dans localStorage pour synchronisation avec RideCalculator
      if (typeof window !== 'undefined') {
        localStorage.setItem('vtc_departure', place.formatted_address)
      }
    }
  }, [])
  
  const { inputRef: departureRef, isLoaded: isMapsLoaded } = useGoogleMapsAutocomplete(handleDepartureSelect)
  const { requestLocation, loading: geolocationLoading, error: geolocationError } = useGeolocation()

  useEffect(() => {
    loadDestinations()
  }, [])

  // ✅ Charger l'adresse de départ depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDeparture = localStorage.getItem('vtc_departure')
      if (savedDeparture) {
        setDepartureAddress(savedDeparture)
        setDepartureInput(savedDeparture)
      }
    }
  }, [])

  // ✅ Synchroniser debouncedDeparture avec departureAddress
  useEffect(() => {
    if (debouncedDeparture && debouncedDeparture !== departureAddress) {
      setDepartureAddress(debouncedDeparture)
      if (typeof window !== 'undefined') {
        localStorage.setItem('vtc_departure', debouncedDeparture)
      }
    }
  }, [debouncedDeparture])

  // ✅ Calculer les prix quand l'adresse de départ (debounced) change - SEULE REQUÊTE BATCH
  useEffect(() => {
    if (debouncedDeparture && destinations.length > 0) {
      calculatePricesForDestinationsBatch(debouncedDeparture)
    } else {
      // Réinitialiser les calculs si pas d'adresse
      setDestinationsWithCalc(destinations.map(dest => ({ ...dest })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDeparture, destinations.length]) // destinations.length pour éviter les re-calculs inutiles

  // ✅ Gérer la géolocalisation
  const handleUseMyLocation = async () => {
    const result = await requestLocation(locale)
    if (result && result.address) {
      setDepartureAddress(result.address)
      setDepartureInput(result.address)
      if (typeof window !== 'undefined') {
        localStorage.setItem('vtc_departure', result.address)
      }
    }
  }

  // ✅ Calcul batch optimisé : Une seule requête API pour toutes les destinations
  const calculatePricesForDestinationsBatch = async (originAddress: string) => {
    if (destinations.length === 0) return
    
    setCalculatingPrices(true)
    
    // Initialiser avec loading
    const destinationsWithLoading = destinations.map(dest => ({
      ...dest,
      loadingCalculation: true,
    }))
    setDestinationsWithCalc(destinationsWithLoading)
    
    try {
      // ✅ REQUÊTE BATCH : Toutes les adresses de destinations en une seule fois
      const destinationAddresses = destinations.map(dest => dest.address)
      const batchResults = await calculateDistanceMatrixBatch(originAddress, destinationAddresses)
      
      // ✅ Mapper les résultats aux destinations
      const destinationsWithCalculations = destinations.map((dest, index) => {
        const routeResult = batchResults[index]
        
        if (!routeResult) {
          // Si le calcul a échoué pour cette destination
          return {
            ...dest,
            loadingCalculation: false,
          }
        }
        
        // Calculer le prix avec les paliers dégressifs (catégorie standard par défaut)
        const distanceInKm = routeResult.distance / 1000
        const ratePerKm = getRatePerKm(distanceInKm, 'standard')
        const calculatedPrice = distanceInKm * ratePerKm
        
        return {
          ...dest,
          calculatedDistance: routeResult.distance,
          calculatedDuration: routeResult.duration, // en secondes
          calculatedPrice: Math.round(calculatedPrice * 100) / 100,
          loadingCalculation: false,
        }
      })
      
      setDestinationsWithCalc(destinationsWithCalculations)
    } catch (error) {
      console.error('Error calculating prices in batch:', error)
      // En cas d'erreur, réinitialiser sans calculs
      setDestinationsWithCalc(destinations.map(dest => ({ ...dest, loadingCalculation: false })))
    } finally {
      setCalculatingPrices(false)
    }
  }

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('popular_destinations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6)

      if (error) {
        throw error
      }

      if (data) {
        const destinationsData = data as PopularDestination[]
        setDestinations(destinationsData)
        // Initialiser destinationsWithCalc avec les destinations (sans calculs pour l'instant)
        setDestinationsWithCalc(destinationsData.map(dest => ({ ...dest })))
      }
    } catch (error) {
      console.error('Error loading destinations:', error)
      // En cas d'erreur, on garde un tableau vide plutôt que de planter
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Gérer le clic sur une destination : pré-remplir le calculateur et scroller
  const handleDestinationClick = (destination: PopularDestination) => {
    // Stocker la destination et l'adresse d'arrivée dans localStorage pour RideCalculator
    if (typeof window !== 'undefined') {
      localStorage.setItem('vtc_arrival', destination.address)
      // Stocker également un flag pour indiquer que c'est une destination populaire
      localStorage.setItem('vtc_selected_popular_destination', JSON.stringify({
        id: destination.id,
        address: destination.address,
        fixed_price: destination.fixed_price,
      }))
      
      // Déclencher un événement personnalisé pour notifier RideCalculator
      window.dispatchEvent(new CustomEvent('popularDestinationSelected', {
        detail: { destination }
      }))
    }
    
    // Scroller vers le calculateur
    setTimeout(() => {
      const calculatorSection = document.getElementById('ride-calculator')
      if (calculatorSection) {
        calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleQuickBook = (destination: PopularDestination) => {
    // Ouvrir le formulaire de réservation
    setSelectedDestination(destination)
    setShowReservationForm(true)
  }

  const handleReservationConfirm = (data: ReservationData) => {
    if (!selectedDestination) return

    const destinationName = locale === 'fr' ? selectedDestination.name_fr : selectedDestination.name_en
    
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

    const message = locale === 'fr'
      ? `Bonjour, je souhaite réserver un trajet vers ${destinationName} (${selectedDestination.address}) pour un prix fixe de ${formatPrice(selectedDestination.fixed_price, 'fr-FR')}.${passengerInfo}${babySeatInfo}${paymentInfo}`
      : locale === 'ar'
      ? `مرحباً، أرغب بحجز رحلة إلى ${destinationName} (${selectedDestination.address}) بسعر ثابت ${formatPrice(selectedDestination.fixed_price, 'ar-SA')}.${passengerInfo}${babySeatInfo}${paymentInfo}`
      : `Hello, I would like to book a ride to ${destinationName} (${selectedDestination.address}) for a fixed price of ${formatPrice(selectedDestination.fixed_price, 'en-US')}.${passengerInfo}${babySeatInfo}${paymentInfo}`

    const whatsappUrl = createWhatsAppUrl(whatsappNumber, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setSelectedDestination(null)
  }

  if (loading) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">{t.common.loading}</p>
          </div>
        </div>
      </section>
    )
  }

  if (destinations.length === 0) {
    return null
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' ? 'Destinations Populaires' : 'Popular Destinations'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Réservez en un clic vers les destinations les plus demandées avec nos tarifs fixes'
              : 'Book in one click to the most requested destinations with our fixed rates'}
          </p>
        </div>

        {/* ✅ Barre de Départ (Global Pickup Input) */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
          <Label htmlFor="global-departure" className="text-base font-semibold mb-3 block">
            {locale === 'fr' ? 'Je pars de :' : "I'm leaving from:"}
          </Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                id="global-departure"
                ref={departureRef}
                placeholder={
                  isMapsLoaded
                    ? (locale === 'fr' ? 'Votre adresse de départ' : 'Your departure address')
                    : (locale === 'fr' ? 'Chargement...' : 'Loading...')
                }
                value={departureInput}
                onChange={(e) => {
                  setDepartureInput(e.target.value)
                }}
                onBlur={() => {
                  if (departureInput && departureInput !== departureAddress) {
                    setDepartureAddress(departureInput)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('vtc_departure', departureInput)
                    }
                  }
                }}
                className="pl-12"
                disabled={!isMapsLoaded}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={geolocationLoading || !isMapsLoaded}
              className="whitespace-nowrap gap-2"
            >
              {geolocationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === 'fr' ? 'Détection...' : 'Detecting...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>{locale === 'fr' ? '📍 Ma position' : '📍 My location'}</span>
                </>
              )}
            </Button>
          </div>
          {geolocationError && (
            <p className="text-sm text-red-600 mt-2">{geolocationError}</p>
          )}
          {departureAddress && (
            <p className="text-sm text-blue-700 mt-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {locale === 'fr'
                  ? 'Les prix sont calculés depuis votre point de départ'
                  : 'Prices are calculated from your departure point'}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(destinationsWithCalc.length > 0 ? destinationsWithCalc : destinations).map((destination) => {
            const IconComponent = destination.icon
              ? iconMap[destination.icon] || MapPin
              : MapPin
            
            const destinationCalc = destinationsWithCalc.find(d => d.id === destination.id)
            const isLoading = destinationCalc?.loadingCalculation || false
            const calculatedDistance = destinationCalc?.calculatedDistance

            return (
              <Card
                key={destination.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/20 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${destination.display_order * 0.1}s` }}
                onClick={() => {
                  if (departureAddress) {
                    handleDestinationClick(destination)
                  } else {
                    handleQuickBook(destination)
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {locale === 'fr' ? destination.name_fr : destination.name_en}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {destination.address}
                      </p>
                      {/* ✅ Afficher la distance calculée si disponible */}
                      {calculatedDistance !== undefined && calculatedDistance > 0 && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {formatDistance(calculatedDistance, locale)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {destinationCalc?.calculatedPrice && destinationCalc.calculatedPrice < destination.fixed_price
                          ? (locale === 'fr' ? 'Prix depuis votre position' : 'Price from your location')
                          : (locale === 'fr' ? 'Prix fixe' : 'Fixed price')}
                      </p>
                      <div className="flex items-center gap-2">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        ) : (
                          <p className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {/* ✅ Afficher le meilleur prix (calculé ou fixe) */}
                            {destinationCalc?.calculatedPrice && destinationCalc.calculatedPrice < destination.fixed_price
                              ? formatPrice(destinationCalc.calculatedPrice, locale === 'fr' ? 'fr-FR' : 'en-US')
                              : formatPrice(destination.fixed_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                          </p>
                        )}
                      </div>
                      {/* ✅ Comparaison intelligente : Afficher le meilleur prix */}
                      {destinationCalc?.calculatedPrice && destinationCalc.calculatedPrice > 0 && (
                        <div className="mt-2 space-y-1">
                          {destinationCalc.calculatedPrice < destination.fixed_price ? (
                            // ✅ Le prix calculé est meilleur que le prix fixe
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-green-600">
                                {locale === 'fr' ? '✨ Meilleur prix depuis votre position:' : '✨ Best price from your location:'}
                              </p>
                              <p className="text-sm font-bold text-green-700">
                                {formatPrice(destinationCalc.calculatedPrice, locale === 'fr' ? 'fr-FR' : 'en-US')}
                              </p>
                            </div>
                          ) : (
                            // ✅ Le prix fixe est meilleur, montrer le prix calculé en grisé
                            <p className="text-xs text-gray-400 line-through">
                              {locale === 'fr' ? 'Prix calculé:' : 'Calculated price:'} {formatPrice(destinationCalc.calculatedPrice, locale === 'fr' ? 'fr-FR' : 'en-US')}
                            </p>
                          )}
                        </div>
                      )}
                      {/* ✅ Afficher la durée estimée depuis la position */}
                      {destinationCalc?.calculatedDuration && destinationCalc.calculatedDuration > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {locale === 'fr' 
                            ? `Depuis votre position : ${Math.round(destinationCalc.calculatedDuration / 60)} min`
                            : `From your location: ${Math.round(destinationCalc.calculatedDuration / 60)} min`}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation() // Empêcher le clic sur la card
                        if (departureAddress) {
                          handleDestinationClick(destination)
                        } else {
                          handleQuickBook(destination)
                        }
                      }}
                      size="lg"
                      className="rounded-full gap-2 relative overflow-hidden group/btn transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {departureAddress 
                          ? (locale === 'fr' ? 'Réserver' : 'Book')
                          : t.common.book}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Formulaire de réservation */}
      <ReservationForm
        open={showReservationForm}
        onClose={() => {
          setShowReservationForm(false)
          setSelectedDestination(null)
        }}
        onConfirm={handleReservationConfirm}
      />
    </section>
  )
}

