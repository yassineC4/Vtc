'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustSection } from '@/components/home/TrustSection'
import { RideCalculator } from '@/components/home/RideCalculator'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { ValueProposition } from '@/components/home/ValueProposition'
import { ServicesSection } from '@/components/home/ServicesSection'
import { OtherServices } from '@/components/home/OtherServices'
import { FleetSection } from '@/components/home/FleetSection'
import { FAQSection } from '@/components/home/FAQSection'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { Footer } from '@/components/shared/Footer'
import { StructuredData } from '@/components/shared/StructuredData'
import { useLocale } from '@/contexts/LocaleContext'
import { createClient } from '@/lib/supabase/client'
import { Review } from '@/types'

export function HomePageClient() {
  const { locale } = useLocale()
  const [reviews, setReviews] = useState<Review[]>([])
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
  const phoneNumber = '+33 6 95 29 71 92'

  useEffect(() => {
    // Charger les avis pour le Schema.org
    loadReviewsForSchema()
  }, [])

  const loadReviewsForSchema = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setReviews(data as Review[])
      }
    } catch (error) {
      console.error('Error loading reviews for schema:', error)
      // En cas d'erreur, on continue sans les reviews pour le schema
    }
  }

  // Schema.org pour la page d'accueil
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: siteUrl,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment réserver une course VTC ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Utilisez notre calculateur en ligne pour obtenir un prix estimé, puis réservez directement via WhatsApp avec un message pré-rempli.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels sont vos tarifs ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nos tarifs sont calculés en fonction de la distance et du temps de trajet. Le prix au kilomètre peut être consulté sur notre site et est mis à jour régulièrement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Êtes-vous disponible 24/7 ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, notre service est disponible 24 heures sur 24, 7 jours sur 7 pour répondre à tous vos besoins de transport.',
        },
      },
    ],
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Chauffeur VTC Professionnel',
    url: siteUrl,
    logo: `${siteUrl}/images/hero-car.jpg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phoneNumber,
      contactType: 'customer service',
      availableLanguage: ['French', 'English', 'Arabic'],
    },
    sameAs: [
      // Ajoutez vos réseaux sociaux ici
    ],
  }

  // Schema.org pour les avis avec données réelles
  const reviewSchema = reviews.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Chauffeur VTC Professionnel',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author_name,
      },
      datePublished: review.created_at,
      reviewBody: review.content,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    })),
  } : null

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />
      <StructuredData data={faqSchema} id="faq-schema" />
      <StructuredData data={organizationSchema} id="organization-schema" />
      {reviewSchema && (
        <StructuredData data={reviewSchema} id="review-schema" />
      )}

      <main className="min-h-screen bg-white">
        <HeroSection />
        
        {/* Section Trust */}
        <TrustSection />
        
        {/* Section Value Proposition - Pourquoi nous choisir */}
        <ValueProposition />

        {/* Section Services Premium */}
        <ServicesSection />

        {/* Section Calculateur de Prix */}
        <section id="ride-calculator" className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {locale === 'fr' ? 'Estimez votre course' : locale === 'ar' ? 'قدر رحلتك' : 'Estimate your ride'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {locale === 'fr'
                  ? 'Chauffeur privé en quelques minutes. Prix affiché avant confirmation.'
                  : locale === 'ar'
                  ? 'سائق خاص في دقائق. السعر معروض قبل التأكيد.'
                  : 'Private chauffeur in minutes. Price shown before you confirm.'}
              </p>
            </div>
            <RideCalculator locale={locale} />
          </div>
        </section>

        {/* Section Flotte */}
        <FleetSection />

        {/* Section Autres Services - Mise à disposition */}
        <div id="other-services">
          <OtherServices />
        </div>
        
        {/* Section Avis Clients */}
        <ReviewsSection locale={locale} />
        
        {/* Section FAQ */}
        <FAQSection />
        
        {/* Footer */}
        <Footer />
        
        {/* Floating WhatsApp Button */}
        <WhatsAppButton locale={locale} />
      </main>
    </>
  )
}

