'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { Car, Users, Luggage, Wifi, Droplets } from 'lucide-react'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'

export function FleetSection() {
  const { locale } = useLocale()

  const vehicles = [
    {
      name: 'Mercedes S-Class',
      category: locale === 'fr' ? 'Exécutif' : locale === 'ar' ? 'تنفيذي' : 'Executive',
      passengers: 3,
      luggage: 2,
      features: [
        { icon: Users, text: '3 sièges' },
        { icon: Luggage, text: '2 bagages' },
        { icon: Wifi, text: 'Wi-Fi' },
        { icon: Droplets, text: 'Eau minérale' },
      ],
    },
    {
      name: locale === 'fr' ? 'Berline Premium' : locale === 'ar' ? 'سيارة فاخرة' : 'Premium Sedan',
      category: locale === 'fr' ? 'Premium' : locale === 'ar' ? 'مميز' : 'Premium',
      passengers: 3,
      luggage: 2,
      features: [
        { icon: Users, text: '3 sièges' },
        { icon: Luggage, text: '2 bagages' },
        { icon: Wifi, text: 'Wi-Fi' },
        { icon: Droplets, text: 'Eau minérale' },
      ],
    },
    {
      name: locale === 'fr' ? 'Van de Luxe' : locale === 'ar' ? 'فان فاخر' : 'Luxury Van',
      category: locale === 'fr' ? 'Groupe' : locale === 'ar' ? 'مجموعة' : 'Group',
      passengers: 7,
      luggage: 6,
      features: [
        { icon: Users, text: '7 sièges' },
        { icon: Luggage, text: '6 bagages' },
        { icon: Wifi, text: 'Wi-Fi' },
        { icon: Droplets, text: 'Eau minérale' },
      ],
    },
  ]

  const handleBookVehicle = (vehicleName: string) => {
    const message = locale === 'fr'
      ? `Bonjour, je souhaite réserver le véhicule : ${vehicleName}`
      : locale === 'ar'
      ? `مرحباً، أرغب بحجز المركبة: ${vehicleName}`
      : `Hello, I would like to book the vehicle: ${vehicleName}`
    
    const whatsappUrl = createWhatsAppUrl(DEFAULT_PHONE_NUMBER, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête avec beaucoup d'espace */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr' ? 'Notre Flotte' : locale === 'ar' ? 'أسطولنا' : 'Our Fleet'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Véhicules exécutifs pour chaque moment.'
              : locale === 'ar'
              ? 'مركبات تنفيذية لكل لحظة.'
              : 'Executive vehicles for every moment.'}
          </p>
        </div>

        {/* Grille de véhicules - Style premium épuré */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {vehicles.map((vehicle, index) => (
            <div
              key={index}
              className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Image placeholder simple */}
              <div className="relative h-48 bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-16 h-16 text-gray-300" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                    {vehicle.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {vehicle.name}
                </h3>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {locale === 'fr' ? `Jusqu'à ${vehicle.passengers} passagers` : locale === 'ar' ? `حتى ${vehicle.passengers} ركاب` : `Up to ${vehicle.passengers} passengers`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-3 h-3" />
                    {vehicle.luggage} {locale === 'fr' ? 'bagages' : locale === 'ar' ? 'أمتعة' : 'luggage'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {vehicle.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <FeatureIcon className="w-3 h-3 text-gray-400" />
                        <span>{feature.text}</span>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => handleBookVehicle(vehicle.name)}
                  className="w-full py-3 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Réserver ce véhicule' : locale === 'ar' ? 'احجز هذه المركبة' : 'Book this vehicle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
