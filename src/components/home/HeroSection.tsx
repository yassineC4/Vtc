'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLocale } from '@/contexts/LocaleContext'
import { getTranslations } from '@/lib/i18n'

export function HeroSection() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [imageError, setImageError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // Parallax effect on scroll
    const handleScroll = () => {
      if (sectionRef.current) {
        const scrolled = window.pageYOffset
        const parallax = sectionRef.current.querySelector('.parallax-image') as HTMLElement
        if (parallax) {
          parallax.style.transform = `translateY(${scrolled * 0.5}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden min-h-[80vh] sm:min-h-[90vh] flex items-center pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6"
    >
      {/* Image en background avec effet parallax */}
      {!imageError && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-car.jpg"
            alt="Chauffeur VTC professionnel"
            fill
            className="object-cover parallax-image transition-transform duration-300 ease-out"
            priority
            sizes="100vw"
            unoptimized={false}
            onError={() => {
              console.error('Image hero-car.jpg failed to load')
              setImageError(true)
            }}
            onLoad={() => setIsVisible(true)}
          />
          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        </div>
      )}

      {/* Fallback si l'image n'existe pas */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-900 z-0"></div>
      )}

      {/* Contenu principal */}
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className={`flex justify-end mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <LanguageSwitcher />
        </div>
        
        <div className={`text-center space-y-6 md:space-y-8 max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl animate-fade-in-up">
            {locale === 'fr' 
              ? 'VTC Chauffeur Professionnel' 
              : locale === 'ar' 
              ? 'VTC سائق محترف' 
              : 'VTC Professional Chauffeur Service'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-4 drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {locale === 'fr'
              ? 'Votre trajet premium, simple et à l\'heure.'
              : locale === 'ar'
              ? 'رحلتك المميزة، بسيطة وفي الوقت المحدد.'
              : 'Your premium ride, simple and on time.'}
          </p>
          
          {/* Badges */}
          {/* Bouton CTA */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => {
                const calculator = document.getElementById('ride-calculator')
                if (calculator) {
                  calculator.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              {locale === 'fr' ? 'Estimez le prix' : locale === 'ar' ? 'قدر السعر' : 'Estimate the price'}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-semibold text-white">
                {locale === 'fr' ? 'Prix fixe à l\'avance' : locale === 'ar' ? 'سعر ثابت مسبقاً' : 'Fixed price upfront'}
              </span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-semibold text-white">
                {locale === 'fr' ? 'Chauffeurs professionnels' : locale === 'ar' ? 'سائقون محترفون' : 'Professional chauffeurs'}
              </span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-semibold text-white">
                {locale === 'fr' ? 'Disponible 24/7' : locale === 'ar' ? 'متاح 24/7' : 'Available 24/7'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

