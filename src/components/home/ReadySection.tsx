'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'
import { CheckCircle2, Clock, ShieldCheck, Navigation } from 'lucide-react'

export function ReadySection() {
  const { locale } = useLocale()

  const handleEstimateClick = () => {
    const calculatorElement = document.getElementById('ride-calculator')
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCallClick = () => {
    const message = locale === 'fr'
      ? 'Bonjour, je souhaite réserver une course.'
      : locale === 'ar'
      ? 'مرحباً، أرغب بحجز رحلة.'
      : 'Hello, I would like to book a ride.'
    
    const whatsappUrl = createWhatsAppUrl(DEFAULT_PHONE_NUMBER, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const features = [
    {
      icon: CheckCircle2,
      text: locale === 'fr' ? '4.8/5 note moyenne' : locale === 'ar' ? '4.8/5 متوسط التقييم' : '4.8/5 average rating',
    },
    {
      icon: Clock,
      text: locale === 'fr' ? 'Réservations 24/7' : locale === 'ar' ? 'حجوزات 24/7' : '24/7 bookings',
    },
    {
      icon: ShieldCheck,
      text: locale === 'fr' ? 'Chauffeurs vérifiés' : locale === 'ar' ? 'سائقون موثقون' : 'Verified chauffeurs',
    },
    {
      icon: Navigation,
      text: locale === 'fr' ? 'Suivi des vols inclus' : locale === 'ar' ? 'تتبع الرحلات مدرج' : 'Flight tracking included',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr' ? 'Prêt pour votre prochaine course ?' : locale === 'ar' ? 'جاهز لرحلتك القادمة؟' : 'Ready for your next ride?'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            {locale === 'fr'
              ? 'Tarif fixe affiché à l\'avance. Disponibilité 24/7. Confirmation en quelques secondes.'
              : locale === 'ar'
              ? 'سعر ثابت معروض مسبقاً. توفر 24/7. تأكيد في ثوانٍ.'
              : 'Fixed fare shown up front. 24/7 availability. Confirm in seconds.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleEstimateClick}
            className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            {locale === 'fr' ? 'Estimez le prix' : locale === 'ar' ? 'قدر السعر' : 'Estimate the price'}
          </button>
          <button
            onClick={handleCallClick}
            className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            {locale === 'fr' ? 'Appeler / WhatsApp' : locale === 'ar' ? 'اتصل / واتساب' : 'Call / WhatsApp'}
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-gray-600 text-center mb-8">
            {locale === 'fr'
              ? 'Tous les taxes et péages inclus. Attente incluse : 45 min aéroport / 20 min gare-hôtel. Confirmation finale avant réservation.'
              : locale === 'ar'
              ? 'جميع الضرائب والرسوم مدرجة. الانتظار مدرج: 45 دقيقة للمطار / 20 دقيقة للمحطة-الفندق. تأكيد نهائي قبل الحجز.'
              : 'All taxes and tolls included. Waiting included: 45 min airport / 20 min station-hotel. Final confirmation before booking.'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <IconComponent className="w-5 h-5 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-600">{feature.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
