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
      className="relative overflow-hidden min-h-[80vh] sm:min-h-[90vh] flex items-center pt-24 sm:pt-32 pb-16 sm:pb-24 px-4"
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
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl animate-fade-in-up">
            {t.home.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto font-medium leading-relaxed px-4 drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t.home.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}

