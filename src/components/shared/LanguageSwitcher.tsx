'use client'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { type Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { locale: currentLocale, setLocale } = useLocale()

  const switchLanguage = (locale: Locale) => {
    setLocale(locale)
  }

  return (
    <div className="flex gap-2 bg-white/80 backdrop-blur-md rounded-full p-1 shadow-lg border border-gray-200">
      <Button
        variant={currentLocale === 'fr' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('fr')}
        className={currentLocale === 'fr' ? 'rounded-full' : 'rounded-full text-gray-600 hover:text-gray-900'}
      >
        FR
      </Button>
      <Button
        variant={currentLocale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
        className={currentLocale === 'en' ? 'rounded-full' : 'rounded-full text-gray-600 hover:text-gray-900'}
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'ar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('ar')}
        className={currentLocale === 'ar' ? 'rounded-full' : 'rounded-full text-gray-600 hover:text-gray-900'}
      >
        AR
      </Button>
    </div>
  )
}

