'use client'

import { ShieldCheck, UserCheck, Clock } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export function ValueProposition() {
  const { locale } = useLocale()

  const features = [
    {
      icon: ShieldCheck,
      title: locale === 'fr' 
        ? 'Sécurité & Sérénité' 
        : locale === 'ar'
        ? 'الأمان والطمأنينة'
        : 'Security & serenity',
      description: locale === 'fr'
        ? 'Chauffeurs vérifiés • Suivi de trajet en direct • Assurance complète'
        : locale === 'ar'
        ? 'سائقون موثقون • تتبع الرحلة مباشرة • تأمين كامل'
        : 'Vetted chauffeurs • Live trip tracking • Full insurance coverage',
    },
    {
      icon: UserCheck,
      title: locale === 'fr'
        ? 'Service Professionnel'
        : locale === 'ar'
        ? 'خدمة احترافية'
        : 'Professional service',
      description: locale === 'fr'
        ? 'Assistance niveau concierge • Service premium discret • Soin personnalisé du passager'
        : locale === 'ar'
        ? 'مساعدة على مستوى الكونسيرج • خدمة مميزة منضبطة • رعاية شخصية للراكب'
        : 'Concierge-level assistance • Discreet premium service • Personalized rider care',
    },
    {
      icon: Clock,
      title: locale === 'fr'
        ? 'Ponctualité Garantie'
        : locale === 'ar'
        ? 'الدقة مضمونة'
        : 'Guaranteed punctuality',
      description: locale === 'fr'
        ? 'Garantie à l\'heure • Suivi des vols et trafic • Temps tampon intégré'
        : locale === 'ar'
        ? 'ضمان في الوقت • تتبع الرحلات والمرور • وقت عازل مدمج'
        : 'On-time guarantee • Flight & traffic monitoring • Built-in buffer time',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête avec beaucoup d'espace */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr'
              ? "Plus qu'un trajet, une expérience premium"
              : locale === 'ar'
              ? 'أكثر من رحلة، تجربة مميزة'
              : 'More than a trip, a premium experience'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Aéroports, événements, longues distances — nous gérons tout.'
              : locale === 'ar'
              ? 'المطارات، الفعاليات، المسافات الطويلة — نتعامل مع كل شيء.'
              : 'Airports, events, long distances — we handle it all.'}
          </p>
        </div>

        {/* Grille de features - Style premium épuré */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 p-8"
              >
                {/* Icône discrète */}
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 text-gray-700" />
                  </div>
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
