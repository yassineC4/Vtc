'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { PopularDestination } from '@/types'
import { getTranslations, type Locale } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import { ReservationForm, type ReservationData } from '@/components/home/ReservationForm'
import { MapPin, Plane, Train, Navigation, ArrowRight } from 'lucide-react'

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

export function PopularDestinations({ locale, whatsappNumber = '0033695297192' }: PopularDestinationsProps) {
  const t = getTranslations(locale)
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<PopularDestination | null>(null)

  useEffect(() => {
    loadDestinations()
  }, [])

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
        setDestinations(data as PopularDestination[])
      }
    } catch (error) {
      console.error('Error loading destinations:', error)
      // En cas d'erreur, on garde un tableau vide plutôt que de planter
      setDestinations([])
    } finally {
      setLoading(false)
    }
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

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' ? 'Destinations Populaires' : 'Popular Destinations'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Réservez en un clic vers les destinations les plus demandées avec nos tarifs fixes'
              : 'Book in one click to the most requested destinations with our fixed rates'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => {
            const IconComponent = destination.icon
              ? iconMap[destination.icon] || MapPin
              : MapPin

            return (
              <Card
                key={destination.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/20 animate-fade-in-up"
                style={{ animationDelay: `${destination.display_order * 0.1}s` }}
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {locale === 'fr' ? 'Prix fixe' : 'Fixed price'}
                      </p>
                      <p className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(destination.fixed_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleQuickBook(destination)}
                      size="lg"
                      className="rounded-full gap-2 relative overflow-hidden group/btn transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {t.common.book}
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

