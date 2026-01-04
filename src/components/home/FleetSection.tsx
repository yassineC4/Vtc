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
      image: '/images/luxury-car-1.jpg',
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
      image: '/images/luxury-car-2.jpg',
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
      image: '/images/luxury-car-3.jpg',
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
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' ? 'Notre Flotte' : locale === 'ar' ? 'أسطولنا' : 'Our Fleet'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Véhicules exécutifs pour chaque moment.'
              : locale === 'ar'
              ? 'مركبات تنفيذية لكل لحظة.'
              : 'Executive vehicles for every moment.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-24 h-24 text-gray-400" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                    {vehicle.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {vehicle.name}
                </h3>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Jusqu'à {vehicle.passengers} passagers
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-4 h-4" />
                    {vehicle.luggage} bagages
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {vehicle.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <FeatureIcon className="w-4 h-4 text-primary" />
                        <span>{feature.text}</span>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => handleBookVehicle(vehicle.name)}
                  className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors duration-300"
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
