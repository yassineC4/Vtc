'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { defaultLocale, type Locale } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Récupérer la langue depuis localStorage côté client
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale)
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    
    // Mettre à jour l'attribut dir du HTML pour le RTL
    const html = document.documentElement
    if (newLocale === 'ar') {
      html.setAttribute('dir', 'rtl')
      html.setAttribute('lang', 'ar')
    } else {
      html.setAttribute('dir', 'ltr')
      html.setAttribute('lang', newLocale)
    }
  }

  // Mettre à jour l'attribut dir et lang du HTML quand le locale change
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const html = document.documentElement
      if (locale === 'ar') {
        html.setAttribute('dir', 'rtl')
        html.setAttribute('lang', 'ar')
      } else {
        html.setAttribute('dir', 'ltr')
        html.setAttribute('lang', locale)
      }
    }
  }, [locale, mounted])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

