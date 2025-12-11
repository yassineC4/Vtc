'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Sparkles, Navigation } from 'lucide-react'
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
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Titre de section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' 
              ? 'Autres Services'
              : locale === 'ar'
              ? 'خدمات أخرى'
              : 'Other Services'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Découvrez nos services premium adaptés à tous vos besoins'
              : locale === 'ar'
              ? 'اكتشف خدماتنا المميزة المتكيفة مع جميع احتياجاتك'
              : 'Discover our premium services tailored to all your needs'}
          </p>
        </div>

        {/* Carte Mise à disposition */}
        <Card className="group relative bg-white border-0 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Côté Gauche - Image */}
            <div className="relative h-[350px] md:h-[400px] lg:h-full min-h-[400px] order-2 lg:order-1 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100">
              <Image
                src="/images/luxury-car-1.jpg"
                alt={locale === 'fr' 
                  ? 'Chauffeur professionnel attendant près d\'une berline de luxe' 
                  : locale === 'ar'
                  ? 'سائق محترف ينتظر بجانب سيارة فاخرة'
                  : 'Professional chauffeur waiting near a luxury sedan'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              {/* Overlay gradient subtil */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Fallback décoratif si l'image ne charge pas */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="text-center text-white p-8">
                  <Navigation className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">
                    {locale === 'fr' ? 'Service Premium' : locale === 'ar' ? 'خدمة مميزة' : 'Premium Service'}
                  </p>
                </div>
              </div>
            </div>

            {/* Côté Droit - Contenu */}
            <CardContent className="p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full w-fit">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {locale === 'fr' ? 'Service Premium' : locale === 'ar' ? 'خدمة مميزة' : 'Premium Service'}
                </span>
              </div>

              {/* Titre */}
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {locale === 'fr' 
                  ? 'Liberté Totale : Votre chauffeur à disposition'
                  : locale === 'ar'
                  ? 'الحرية الكاملة: سائقك تحت الطلب'
                  : 'Total Freedom: Your Chauffeur on Standby'}
              </h3>

              {/* Sous-titre */}
              <p className="text-xl md:text-2xl font-semibold text-gray-700 italic">
                {locale === 'fr'
                  ? 'Ne commandez plus. Il vous attend.'
                  : locale === 'ar'
                  ? 'لا حاجة للطلب. إنه ينتظرك.'
                  : 'No more ordering. He waits for you.'}
              </p>

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
                    className="flex items-start gap-3 group/item"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-base md:text-lg text-gray-700 font-medium flex-1">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  onClick={handleBook}
                  size="lg"
                  className="group/btn relative w-full md:w-auto px-8 py-6 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 group-hover/btn:animate-pulse" />
                    {locale === 'fr'
                      ? 'Réserver une mise à disposition'
                      : locale === 'ar'
                      ? 'احجز سائق تحت الطلب'
                      : 'Book a Chauffeur on Standby'}
                  </span>
                  {/* Effet de brillance au survol */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></span>
                </Button>
              </div>
            </CardContent>
          </div>

          {/* Effet de brillance au survol sur toute la carte */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full pointer-events-none"></div>
        </Card>
      </div>
    </section>
  )
}

