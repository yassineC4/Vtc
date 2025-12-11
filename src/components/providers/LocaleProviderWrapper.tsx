'use client'

import { LocaleProvider } from '@/contexts/LocaleContext'

export function LocaleProviderWrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

