'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { getTranslations, type Locale } from '@/lib/i18n'

interface ReviewFormProps {
  locale: Locale
  onSubmitted: () => void
  onCancel: () => void
}

export function ReviewForm({ locale, onSubmitted, onCancel }: ReviewFormProps) {
  const t = getTranslations(locale)
  const [name, setName] = useState('')
  const [rating, setRating] = useState<string>('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !rating || !comment) {
      setError(locale === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // Insertion directe côté client (RLS fonctionne maintenant)
      const supabase = createClient()

      // Insertion sans .select() car anon ne peut pas voir les avis 'pending'
      // Si pas d'erreur, l'insertion a réussi
      const { error: insertError } = await (supabase as any)
        .from('reviews')
        .insert({
          author_name: name.trim(),
          rating: parseInt(rating),
          content: comment.trim(),
          status: 'pending',
        })

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        
        // Messages d'erreur spécifiques
        let errorMessage = insertError.message
        
        if (insertError.code === 'PGRST116') {
          errorMessage = locale === 'fr'
            ? 'Erreur : La table reviews n\'existe pas. Vérifiez que vous avez exécuté le script SQL supabase-schema.sql'
            : 'Error: reviews table does not exist. Check that you ran the supabase-schema.sql script'
        } else if (insertError.code === '42501' || insertError.message.includes('permission') || insertError.message.includes('row-level security')) {
          errorMessage = locale === 'fr'
            ? 'Erreur RLS : Les politiques de sécurité ne sont pas correctement configurées. Vérifiez Supabase.'
            : 'RLS Error: Security policies are not correctly configured. Check Supabase.'
        } else if (insertError.message.includes('network') || insertError.message.includes('fetch')) {
          errorMessage = locale === 'fr'
            ? 'Erreur de connexion réseau. Vérifiez votre connexion internet.'
            : 'Network connection error. Check your internet connection.'
        } else if (insertError.message.includes('JWT')) {
          errorMessage = locale === 'fr'
            ? 'Erreur d\'authentification Supabase. Vérifiez la clé API.'
            : 'Supabase authentication error. Check API key.'
        }
        
        throw new Error(errorMessage)
      }

      // Si pas d'erreur, l'insertion a réussi
      // (On ne peut pas utiliser .select() car anon ne peut pas voir les 'pending')

      setSuccess(true)
      setTimeout(() => {
        onSubmitted()
      }, 2000)
    } catch (error) {
      console.error('Error submitting review:', error)
      
      let errorMessage: string
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        errorMessage = locale === 'fr' 
          ? 'Erreur lors de l\'envoi. Vérifiez votre connexion et réessayez.'
          : 'Error submitting. Check your connection and try again.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="p-8">
        <CardContent className="p-0">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-600">{t.home.reviewSubmitted}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-8 md:p-12">
      <CardHeader className="p-0 mb-8">
        <CardTitle className="text-3xl font-extrabold">{t.home.leaveReview}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="review-name" className="text-base">
              {t.home.name}
            </Label>
            <Input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.home.yourName}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="review-rating" className="text-base">
              {t.home.rating}
            </Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger id="review-rating" className="h-14 rounded-xl">
                <SelectValue placeholder={t.home.selectRating} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {locale === 'fr' ? (num === 1 ? 'étoile' : 'étoiles') : (num === 1 ? 'star' : 'stars')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="review-comment" className="text-base">
              {t.home.comment}
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.home.yourComment}
              rows={6}
              className="rounded-xl border-2 border-gray-200 text-base min-h-[140px]"
            />
          </div>

          {error && (
            <div className="p-4 text-sm text-destructive bg-red-50 border-2 border-red-100 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              size="lg"
              className="flex-1"
            >
              {loading ? t.common.loading : t.common.submit}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              size="lg"
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

