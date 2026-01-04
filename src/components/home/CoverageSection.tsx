'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { Plane, Building2, Calendar } from 'lucide-react'

export function CoverageSection() {
  const { locale } = useLocale()

  const coverageTypes = [
    {
      icon: Plane,
      title: locale === 'fr' ? 'Aéroport / Gare' : locale === 'ar' ? 'مطار / محطة' : 'Airport / Station',
    },
    {
      icon: Building2,
      title: locale === 'fr' ? 'Entreprises' : locale === 'ar' ? 'الشركات' : 'Business',
    },
    {
      icon: Calendar,
      title: locale === 'fr' ? 'Événements' : locale === 'ar' ? 'فعاليات' : 'Events',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr' ? 'Départs & arrivées, 24/7' : locale === 'ar' ? 'المغادرة والوصول، 24/7' : 'Departures & arrivals, 24/7'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Aéroports, gares, hôtels, événements — disponible 24/7.'
              : locale === 'ar'
              ? 'المطارات، المحطات، الفنادق، الفعاليات — متاح 24/7.'
              : 'Airports, stations, hotels, events — available 24/7.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {coverageTypes.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-gray-50 mb-4">
                  <IconComponent className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
