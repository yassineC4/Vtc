'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Review } from '@/types'
import { getTranslations, type Locale } from '@/lib/i18n'
import { Star, Check, X } from 'lucide-react'

interface ReviewsListProps {
  locale: Locale
}

export function ReviewsList({ locale }: ReviewsListProps) {
  const t = getTranslations(locale)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

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
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

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

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await loadReviews()
    } catch (error) {
      console.error('Error approving review:', error)
      alert(locale === 'fr' 
        ? 'Erreur lors de l\'approbation. Vérifiez votre connexion et réessayez.'
        : 'Error approving review. Check your connection and try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet avis ?' : 'Are you sure you want to delete this review?')) {
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await loadReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert(locale === 'fr' 
        ? 'Erreur lors de la suppression. Vérifiez votre connexion et réessayez.'
        : 'Error deleting review. Check your connection and try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t.common.loading}</div>
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{t.admin.noPendingReviews}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t.admin.pendingReviews}</h2>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{review.author_name}</CardTitle>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{review.content}</p>
            <p className="text-xs text-muted-foreground mb-4">
              {new Date(review.created_at).toLocaleDateString(
                locale === 'fr' ? 'fr-FR' : 'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(review.id)}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {t.admin.approve}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(review.id)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t.admin.reject}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

