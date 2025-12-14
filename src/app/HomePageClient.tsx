'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { HeroSection } from '@/components/home/HeroSection'
import { RideCalculator } from '@/components/home/RideCalculator'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { ValueProposition } from '@/components/home/ValueProposition'
import { OtherServices } from '@/components/home/OtherServices'
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

      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <HeroSection />
        
        {/* Section Value Proposition - Pourquoi nous choisir */}
        <ValueProposition />

        <section id="ride-calculator" className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <RideCalculator locale={locale} />
          </div>
        </section>

        {/* Section Autres Services - Mise à disposition */}
        <div id="other-services">
          <OtherServices />
        </div>
        
        {/* Section Images Premium */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {locale === 'fr' ? 'Transport de Luxe' : locale === 'ar' ? 'النقل الفاخر' : 'Luxury Transportation'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {locale === 'fr' 
                  ? 'Voyagez avec style et confort dans nos véhicules haut de gamme'
                  : locale === 'ar'
                  ? 'سافر بأناقة وراحة في مركباتنا الفاخرة'
                  : 'Travel with style and comfort in our premium vehicles'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((num, index) => (
                <div
                  key={num}
                  className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Image
                    src={`/images/luxury-car-${num}.jpg`}
                    alt={`Véhicule premium ${num}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <ReviewsSection locale={locale} />
        
        {/* Footer */}
        <Footer />
        
        {/* Floating WhatsApp Button */}
        <WhatsAppButton locale={locale} />
      </main>
    </>
  )
}

