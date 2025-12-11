import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { defaultLocale } from '@/lib/i18n'
import { LocaleProviderWrapper } from '@/components/providers/LocaleProviderWrapper'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
const siteName = 'Chauffeur VTC Professionnel'
const siteDescription = 'Service de transport VTC de qualité avec véhicules haut de gamme. Réservez votre course en ligne avec calcul de prix instantané. Disponible 24/7.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'VTC',
    'chauffeur privé',
    'transport de luxe',
    'course VTC',
    'taxi premium',
    'chauffeur professionnel',
    'réservation VTC',
    'transport aéroport',
    'véhicule haut de gamme',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'ar_SA'],
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/images/hero-car.jpg`,
        width: 1200,
        height: 630,
        alt: 'Chauffeur VTC Professionnel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/images/hero-car.jpg`],
    creator: '@vtc_professionnel', // Remplacez par votre handle Twitter
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code', // À ajouter depuis Google Search Console
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'fr-FR': `${siteUrl}?lang=fr`,
      'en-US': `${siteUrl}?lang=en`,
      'ar-SA': `${siteUrl}?lang=ar`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
  const phoneNumber = '+33695297192'

  // Schema.org JSON-LD pour LocalBusiness (Chauffeur VTC)
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#business`,
    name: siteName,
    description: siteDescription,
    image: `${siteUrl}/images/hero-car.jpg`,
    telephone: phoneNumber,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressLocality: 'Paris', // À adapter selon votre localisation
      addressRegion: 'Île-de-France',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8566, // À adapter
      longitude: 2.3522, // À adapter
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 48.8566,
        longitude: 2.3522,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '50',
    },
    sameAs: [
      // Ajoutez vos liens réseaux sociaux
      // 'https://www.facebook.com/yourpage',
      // 'https://www.instagram.com/yourpage',
    ],
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Transportation Service',
    provider: {
      '@type': 'LocalBusiness',
      name: siteName,
    },
    areaServed: {
      '@type': 'City',
      name: 'Paris',
    },
    description: 'Service de transport VTC professionnel avec véhicules haut de gamme',
  }

  return (
    <html lang={defaultLocale}>
      <head>
        {/* Schema.org JSON-LD */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <Script
          id="service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
      </head>
      <body className={inter.className}>
        <LocaleProviderWrapper>
          {children}
        </LocaleProviderWrapper>
      </body>
    </html>
  )
}

