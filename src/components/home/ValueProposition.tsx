'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, UserCheck, Clock, Sparkles } from 'lucide-react'
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
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
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
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
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
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        {/* Titre de section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
              {locale === 'fr'
                ? "Plus qu'un trajet, une expérience premium"
                : locale === 'ar'
                ? 'أكثر من رحلة، تجربة مميزة'
                : 'More than a trip, a premium experience'}
          </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mt-4 px-2">
            {locale === 'fr'
              ? 'Découvrez pourquoi nos clients nous préfèrent aux applications de VTC classiques'
              : locale === 'ar'
              ? 'اكتشف لماذا يفضل عملاؤنا خدماتنا على تطبيقات VTC التقليدية'
              : 'Discover why our clients prefer us over traditional VTC apps'}
          </p>
        </div>

        {/* Grille Bento avec 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="group relative bg-white border-0 shadow-lg hover:shadow-2xl rounded-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full"></div>
                
                <CardContent className="p-8 relative z-10">
                  {/* Icône avec fond coloré */}
                  <div className={`inline-flex p-4 rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>

                  {/* Titre */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {feature.description}
                  </p>

                  {/* Barre de couleur décorative en bas */}
                  <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-full`}></div>
                </CardContent>

                {/* Effet de gradient subtil au survol */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none rounded-2xl`}></div>
              </Card>
            )
          })}
        </div>

        {/* Call to action subtil */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-sm md:text-base text-gray-500 italic">
            {locale === 'fr'
              ? "Parce que votre confort et votre tranquillité d'esprit méritent mieux qu'une simple application"
              : locale === 'ar'
              ? 'لأن راحتك وطمأنينتك تستحقان أكثر من مجرد تطبيق'
              : 'Because your comfort and peace of mind deserve more than just an app'}
          </p>
        </div>
      </div>
    </section>
  )
}

