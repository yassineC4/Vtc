'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { Plane, Train, Clock, Briefcase, Heart, MapPin } from 'lucide-react'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'

export function ServicesSection() {
  const { locale } = useLocale()

  const services = [
    {
      icon: Plane,
      title: locale === 'fr' ? 'Transfert Aéroport' : locale === 'ar' ? 'نقل المطار' : 'Airport transfer',
      description: locale === 'fr'
        ? 'Accueil personnalisé • Suivi des vols • Prix fixe'
        : locale === 'ar'
        ? 'استقبال شخصي • تتبع الرحلات • سعر ثابت'
        : 'Meet & greet • Flight tracking • Fixed price',
    },
    {
      icon: Train,
      title: locale === 'fr' ? 'Transfert Gare' : locale === 'ar' ? 'نقل المحطة' : 'Station transfer',
      description: locale === 'fr'
        ? 'Prise en charge à l\'heure • Assistance sur le quai • Prix fixe'
        : locale === 'ar'
        ? 'استلام في الوقت المحدد • مساعدة على المنصة • سعر ثابت'
        : 'On-time pickup • Platform assistance • Fixed price',
    },
    {
      icon: Clock,
      title: locale === 'fr' ? 'Chauffeur à disposition' : locale === 'ar' ? 'سائق تحت الطلب' : 'Driver at disposal',
      description: locale === 'fr'
        ? 'Réservation à l\'heure • Flexibilité multi-étapes • Discret'
        : locale === 'ar'
        ? 'حجز بالساعة • مرونة متعددة المحطات • منضبط'
        : 'Hourly booking • Multi-stop flexibility • Discreet',
    },
    {
      icon: Briefcase,
      title: locale === 'fr' ? 'Voyage d\'affaires' : locale === 'ar' ? 'السفر التجاري' : 'Business travel',
      description: locale === 'fr'
        ? 'Véhicules exécutifs • Planification prioritaire • Facture'
        : locale === 'ar'
        ? 'مركبات تنفيذية • جدولة أولوية • فاتورة'
        : 'Executive vehicles • Priority scheduling • Invoice',
    },
    {
      icon: Heart,
      title: locale === 'fr' ? 'Mariages & Réceptions' : locale === 'ar' ? 'الأعراس والاستقبالات' : 'Weddings & receptions',
      description: locale === 'fr'
        ? 'Arrivées des invités • Coordination horaire • Premium'
        : locale === 'ar'
        ? 'وصول الضيوف • تنسيق التوقيت • مميز'
        : 'Guest arrivals • Timed coordination • Premium',
    },
    {
      icon: MapPin,
      title: locale === 'fr' ? 'Longue distance' : locale === 'ar' ? 'مسافات طويلة' : 'Long distance',
      description: locale === 'fr'
        ? 'Arrêts confort • Tarification prévisible • Jour et nuit'
        : locale === 'ar'
        ? 'محطات راحة • تسعير متوقع • نهاراً وليلاً'
        : 'Comfort stops • Predictable pricing • Day or night',
    },
  ]

  const handleServiceClick = (serviceTitle: string) => {
    const message = locale === 'fr'
      ? `Bonjour, je souhaite réserver un service : ${serviceTitle}`
      : locale === 'ar'
      ? `مرحباً، أرغب بحجز خدمة: ${serviceTitle}`
      : `Hello, I would like to book a service: ${serviceTitle}`
    
    const whatsappUrl = createWhatsAppUrl(DEFAULT_PHONE_NUMBER, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête avec beaucoup d'espace */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr' 
              ? 'Services VTC Premium' 
              : locale === 'ar' 
              ? 'خدمات VTC المميزة' 
              : 'Premium VTC services'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Services de chauffeur sur mesure, à la demande. Des aéroports aux galas, réservez un chauffeur privé en moins d\'une minute.'
              : locale === 'ar'
              ? 'خدمات سائق مخصصة، عند الطلب. من المطارات إلى الحفلات، احجز سائقاً خاصاً في أقل من دقيقة.'
              : 'Tailored chauffeur services, on demand. From airports to gala nights, book a private driver in under a minute.'}
          </p>
        </div>

        {/* Grille de services - Style premium épuré */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={index}
                onClick={() => handleServiceClick(service.title)}
                className="group relative bg-white rounded-lg p-8 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Icône discrète */}
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                
                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-950 transition-colors">
                  {service.title}
                </h3>
                
                {/* Description avec puces */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Lien discret en bas */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-gray-950 transition-colors">
                    {locale === 'fr' ? 'Réserver →' : locale === 'ar' ? 'احجز →' : 'Book →'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
