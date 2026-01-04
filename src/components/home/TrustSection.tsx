'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { Building2, Hotel, Calendar } from 'lucide-react'

export function TrustSection() {
  const { locale } = useLocale()

  const trustItems = [
    {
      icon: Building2,
      title: locale === 'fr' ? 'Entreprises' : locale === 'ar' ? 'الشركات' : 'Businesses',
      description: locale === 'fr' 
        ? 'Pour les entreprises' 
        : locale === 'ar' 
        ? 'للشركات' 
        : 'For business',
    },
    {
      icon: Hotel,
      title: locale === 'fr' ? 'Hôtels - Événements' : locale === 'ar' ? 'فنادق - فعاليات' : 'Hotels - Events',
      description: locale === 'fr' 
        ? 'Hôtels et événements' 
        : locale === 'ar' 
        ? 'الفنادق والفعاليات' 
        : 'Hotels and events',
    },
    {
      icon: Calendar,
      title: locale === 'fr' ? 'Événements' : locale === 'ar' ? 'فعاليات' : 'Events',
      description: locale === 'fr' 
        ? 'Pour vos événements' 
        : locale === 'ar' 
        ? 'لفعالياتك' 
        : 'For your events',
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {locale === 'fr' ? 'Ils nous font confiance' : locale === 'ar' ? 'يثقون بنا' : 'They trust us'}
          </h2>
          <p className="text-gray-600">
            {locale === 'fr' 
              ? 'Pour les entreprises, hôtels et événements' 
              : locale === 'ar' 
              ? 'للشركات والفنادق والفعاليات' 
              : 'For business, hotels, and events'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {trustItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
