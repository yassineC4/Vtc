'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Review } from '@/types'
import { getTranslations, type Locale } from '@/lib/i18n'
import { ReviewForm } from './ReviewForm'
import { Star } from 'lucide-react'

interface ReviewsSectionProps {
  locale: Locale
}

export function ReviewsSection({ locale }: ReviewsSectionProps) {
  const t = getTranslations(locale)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      if (data) {
        setReviews(data as Review[])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmitted = () => {
    setShowForm(false)
    loadReviews()
  }

  // Calculer la note moyenne
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <section className="py-20 md:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête avec beaucoup d'espace */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {t.home.reviews}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            {locale === 'fr' 
              ? 'Fait confiance pour les transferts aéroport, voyages d\'affaires et événements.'
              : locale === 'ar'
              ? 'موثوق به لنقل المطار والسفر التجاري والفعاليات.'
              : 'Trusted for airport transfers, business travel, and events.'}
          </p>
          
          {/* Note moyenne */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">/5</span>
              <span className="text-sm text-gray-500">
                {locale === 'fr' ? 'Basé sur les trajets récents' : locale === 'ar' ? 'بناءً على الرحلات الأخيرة' : 'Based on recent rides'}
              </span>
            </div>
          )}
          
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 py-3"
          >
            {t.home.leaveReview}
          </Button>
        </div>

        {showForm && (
          <div className="max-w-2xl mx-auto mb-16">
            <ReviewForm
              locale={locale}
              onSubmitted={handleReviewSubmitted}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">{t.common.loading}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">{t.home.noReviews}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {review.author_name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  "{review.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
