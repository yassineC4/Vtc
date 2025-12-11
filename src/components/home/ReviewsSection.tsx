'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      // En cas d'erreur, garder un tableau vide plutôt que de planter
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmitted = () => {
    setShowForm(false)
    // Optionnel: recharger les avis après soumission
  }

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {t.home.reviews}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {locale === 'fr' 
              ? 'Découvrez ce que nos clients pensent de notre service'
              : 'Discover what our customers think about our service'}
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            size="lg"
            className="rounded-full"
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
              <Card key={review.id} className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {review.author_name}
                    </CardTitle>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <p className="text-gray-600 leading-relaxed">
                    "{review.content}"
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(review.created_at).toLocaleDateString(
                      locale === 'fr' ? 'fr-FR' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

