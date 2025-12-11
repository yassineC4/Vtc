import { Metadata } from 'next'
import { HomePageClient } from './HomePageClient'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'

export const metadata: Metadata = {
  title: 'Chauffeur VTC Professionnel - Réservation en Ligne',
  description: 'Service de transport VTC de qualité avec véhicules haut de gamme. Réservez votre course en ligne avec calcul de prix instantané. Disponible 24/7. Prix transparents.',
  keywords: [
    'VTC',
    'chauffeur privé',
    'transport de luxe',
    'course VTC',
    'taxi premium',
    'réservation VTC',
    'transport aéroport',
    'chauffeur professionnel',
  ],
  openGraph: {
    title: 'Chauffeur VTC Professionnel - Réservation en Ligne',
    description: 'Service de transport VTC de qualité avec véhicules haut de gamme. Réservez votre course en ligne.',
    url: siteUrl,
    siteName: 'Chauffeur VTC Professionnel',
    images: [
      {
        url: `${siteUrl}/images/hero-car.jpg`,
        width: 1200,
        height: 630,
        alt: 'Chauffeur VTC Professionnel',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chauffeur VTC Professionnel',
    description: 'Service de transport VTC de qualité avec véhicules haut de gamme',
    images: [`${siteUrl}/images/hero-car.jpg`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function HomePage() {
  return <HomePageClient />
}
