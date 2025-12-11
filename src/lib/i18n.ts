import fr from '@/locales/fr.json'
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'

export type Locale = 'fr' | 'en' | 'ar'

export const locales: Locale[] = ['fr', 'en', 'ar']
export const defaultLocale: Locale = 'fr'

export const translations = {
  fr,
  en,
  ar,
} as const

export function getTranslations(locale: Locale) {
  return translations[locale]
}

export type TranslationKey = keyof typeof fr

