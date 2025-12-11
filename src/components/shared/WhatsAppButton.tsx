'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getTranslations, type Locale } from '@/lib/i18n'
import { createWhatsAppUrl, DEFAULT_PHONE_NUMBER } from '@/lib/whatsapp'

interface WhatsAppButtonProps {
  locale: Locale
  phoneNumber?: string
}

export function WhatsAppButton({ locale, phoneNumber = DEFAULT_PHONE_NUMBER }: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const t = getTranslations(locale)

  const handleClick = () => {
    const message = locale === 'fr'
      ? 'Bonjour, je souhaite obtenir plus d\'informations sur vos services VTC.'
      : 'Hello, I would like to get more information about your VTC services.'
    
    try {
      const whatsappUrl = createWhatsAppUrl(phoneNumber, message)
      console.log('Opening WhatsApp with URL:', whatsappUrl)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error creating WhatsApp URL:', error)
      // Fallback avec le numéro par défaut
      const fallbackUrl = createWhatsAppUrl(DEFAULT_PHONE_NUMBER, message)
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <div className="relative">
        {/* Animation de pulsation en arrière-plan */}
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30"></div>
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-pulse opacity-20"></div>
        
        {/* Bouton principal - Optimisé pour mobile : min 44px de hauteur */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group flex items-center gap-2 sm:gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full px-4 sm:px-6 py-3 sm:py-4 shadow-2xl hover:shadow-[#25D366]/50 transition-all duration-300 hover:scale-110 active:scale-95 min-h-[44px] touch-manipulation"
          aria-label={locale === 'fr' ? 'Contacter via WhatsApp' : 'Contact via WhatsApp'}
        >
          {/* Icon WhatsApp */}
          <svg 
            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          
          {/* Text qui apparaît au hover */}
          <span
            className={`hidden sm:block font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0 sm:w-auto'
            }`}
          >
            {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
          </span>

          {/* Badge de notification */}
          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      </div>
    </div>
  )
}

