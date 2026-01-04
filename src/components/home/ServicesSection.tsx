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
      features: [
        locale === 'fr' ? 'Accueil personnalisé' : locale === 'ar' ? 'استقبال شخصي' : 'Meet & greet',
        locale === 'fr' ? 'Suivi des vols' : locale === 'ar' ? 'تتبع الرحلات' : 'Flight tracking',
        locale === 'fr' ? 'Prix fixe' : locale === 'ar' ? 'سعر ثابت' : 'Fixed price',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Train,
      title: locale === 'fr' ? 'Transfert Gare' : locale === 'ar' ? 'نقل المحطة' : 'Station transfer',
      features: [
        locale === 'fr' ? 'Prise en charge à l\'heure' : locale === 'ar' ? 'استلام في الوقت المحدد' : 'On-time pickup',
        locale === 'fr' ? 'Assistance sur le quai' : locale === 'ar' ? 'مساعدة على المنصة' : 'Platform assistance',
        locale === 'fr' ? 'Prix fixe' : locale === 'ar' ? 'سعر ثابت' : 'Fixed price',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: locale === 'fr' ? 'Chauffeur à disposition' : locale === 'ar' ? 'سائق تحت الطلب' : 'Driver at disposal',
      features: [
        locale === 'fr' ? 'Réservation à l\'heure' : locale === 'ar' ? 'حجز بالساعة' : 'Hourly booking',
        locale === 'fr' ? 'Flexibilité multi-étapes' : locale === 'ar' ? 'مرونة متعددة المحطات' : 'Multi-stop flexibility',
        locale === 'fr' ? 'Discret' : locale === 'ar' ? 'منضبط' : 'Discreet',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Briefcase,
      title: locale === 'fr' ? 'Voyage d\'affaires' : locale === 'ar' ? 'السفر التجاري' : 'Business travel',
      features: [
        locale === 'fr' ? 'Véhicules exécutifs' : locale === 'ar' ? 'مركبات تنفيذية' : 'Executive vehicles',
        locale === 'fr' ? 'Planification prioritaire' : locale === 'ar' ? 'جدولة أولوية' : 'Priority scheduling',
        locale === 'fr' ? 'Facture' : locale === 'ar' ? 'فاتورة' : 'Invoice',
      ],
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Heart,
      title: locale === 'fr' ? 'Mariages & Réceptions' : locale === 'ar' ? 'الأعراس والاستقبالات' : 'Weddings & receptions',
      features: [
        locale === 'fr' ? 'Arrivées des invités' : locale === 'ar' ? 'وصول الضيوف' : 'Guest arrivals',
        locale === 'fr' ? 'Coordination horaire' : locale === 'ar' ? 'تنسيق التوقيت' : 'Timed coordination',
        locale === 'fr' ? 'Premium' : locale === 'ar' ? 'مميز' : 'Premium',
      ],
      color: 'from-rose-500 to-red-500',
    },
    {
      icon: MapPin,
      title: locale === 'fr' ? 'Longue distance' : locale === 'ar' ? 'مسافات طويلة' : 'Long distance',
      features: [
        locale === 'fr' ? 'Arrêts confort' : locale === 'ar' ? 'محطات راحة' : 'Comfort stops',
        locale === 'fr' ? 'Tarification prévisible' : locale === 'ar' ? 'تسعير متوقع' : 'Predictable pricing',
        locale === 'fr' ? 'Jour et nuit' : locale === 'ar' ? 'نهاراً وليلاً' : 'Day or night',
      ],
      color: 'from-indigo-500 to-blue-500',
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
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' 
              ? 'Services VTC Premium' 
              : locale === 'ar' 
              ? 'خدمات VTC المميزة' 
              : 'Premium VTC services'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Services de chauffeur sur mesure, à la demande. Des aéroports aux galas, réservez un chauffeur privé en moins d\'une minute.'
              : locale === 'ar'
              ? 'خدمات سائق مخصصة، عند الطلب. من المطارات إلى الحفلات، احجز سائقاً خاصاً في أقل من دقيقة.'
              : 'Tailored chauffeur services, on demand. From airports to gala nights, book a private driver in under a minute.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={index}
                onClick={() => handleServiceClick(service.title)}
                className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-semibold text-primary group-hover:underline">
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
