'use client'

import Image from 'next/image'
import { CheckCircle2, Clock } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'

export function OtherServices() {
  const { locale } = useLocale()

  const handleBook = () => {
    const message = locale === 'fr'
      ? 'Bonjour, je souhaite réserver une mise à disposition de chauffeur privé.'
      : locale === 'ar'
      ? 'مرحباً، أرغب بحجز سائق خاص تحت الطلب.'
      : 'Hello, I would like to book a private chauffeur on standby.'
    
    const whatsappUrl = createWhatsAppUrl(DEFAULT_PHONE_NUMBER, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const features = [
    {
      text: locale === 'fr'
        ? 'Shopping & Rendez-vous d\'affaires'
        : locale === 'ar'
        ? 'التسوق والمواعيد التجارية'
        : 'Shopping & Business Appointments',
    },
    {
      text: locale === 'fr'
        ? 'Mariages & Événements'
        : locale === 'ar'
        ? 'الأعراس والفعاليات'
        : 'Weddings & Events',
    },
    {
      text: locale === 'fr'
        ? 'Circuits touristiques sur mesure'
        : locale === 'ar'
        ? 'جولات سياحية مخصصة'
        : 'Custom Tourist Tours',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête avec beaucoup d'espace */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {locale === 'fr' 
              ? 'Chauffeur à disposition' 
              : locale === 'ar'
              ? 'سائق تحت الطلب' 
              : 'Driver at disposal'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Votre chauffeur professionnel reste à votre disposition aussi longtemps que nécessaire.'
              : locale === 'ar'
              ? 'سائقك المحترف يبقى تحت تصرفك طالما احتجت.'
              : 'Your professional chauffeur remains at your disposal for as long as you need.'}
          </p>
        </div>

        {/* Carte Mise à disposition - Style premium épuré */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Côté Gauche - Image */}
            <div className="relative h-[400px] lg:h-auto lg:min-h-[500px] bg-gray-100">
              <Image
                src="/images/luxury-car-1.jpg"
                alt={locale === 'fr' 
                  ? 'Chauffeur professionnel attendant près d\'une berline de luxe' 
                  : locale === 'ar'
                  ? 'سائق محترف ينتظر بجانب سيارة فاخرة'
                  : 'Professional chauffeur waiting near a luxury sedan'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>

            {/* Côté Droit - Contenu */}
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded w-fit">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {locale === 'fr' ? 'Service Premium' : locale === 'ar' ? 'خدمة مميزة' : 'Premium Service'}
                </span>
              </div>

              {/* Titre */}
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {locale === 'fr' 
                  ? 'Liberté Totale : Votre chauffeur à disposition'
                  : locale === 'ar'
                  ? 'الحرية الكاملة: سائقك تحت الطلب'
                  : 'Total Freedom: Your Chauffeur on Standby'}
              </h3>

              {/* Paragraphe */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                {locale === 'fr'
                  ? 'Votre chauffeur professionnel reste à votre disposition aussi longtemps que nécessaire. Enchaînez vos rendez-vous sans stress, profitez de votre shopping en toute sérénité, ou explorez la ville à votre rythme.'
                  : locale === 'ar'
                  ? 'سائقك المحترف يبقى تحت تصرفك طالما احتجت. قم بمواعيدك دون توتر، استمتع بالتسوق بكل راحة، أو استكشف المدينة بوتيرتك.'
                  : 'Your professional chauffeur remains at your disposal for as long as you need. Chain your appointments without stress, enjoy your shopping in complete serenity, or explore the city at your own pace.'}
              </p>

              {/* Checklist */}
              <div className="space-y-3 pt-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={handleBook}
                  className="px-8 py-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  {locale === 'fr'
                    ? 'Réserver une mise à disposition'
                    : locale === 'ar'
                    ? 'احجز سائق تحت الطلب'
                    : 'Book a Chauffeur on Standby'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
