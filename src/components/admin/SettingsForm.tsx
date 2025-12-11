'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Note: On utilise l'API route pour les opérations admin sécurisées
import { getTranslations, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  locale: Locale
}

export function SettingsForm({ locale }: SettingsFormProps) {
  const t = getTranslations(locale)
  const [pricePerKm, setPricePerKm] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'price_per_km')
        .single()

      if (error) {
        throw error
      }

      if (data) {
        // @ts-ignore - Supabase typing issue
        const value = data.value as number
        if (typeof value === 'number') {
          setPricePerKm(value.toString())
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // En cas d'erreur, garder la valeur par défaut
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const price = parseFloat(pricePerKm)
    if (isNaN(price) || price <= 0) {
      setMessage({ type: 'error', text: locale === 'fr' ? 'Prix invalide' : 'Invalid price' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Utiliser l'API route pour la mise à jour (plus sécurisé côté serveur)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'price_per_km', value: price }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Erreur réseau' }))
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      setMessage({ type: 'success', text: t.admin.priceUpdated })
    } catch (error) {
      console.error('Error saving settings:', error)
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving')
      setMessage({ 
        type: 'error', 
        text: locale === 'fr' 
          ? `Erreur : ${errorMessage}. Vérifiez votre connexion et réessayez.`
          : `Error: ${errorMessage}. Check your connection and try again.`
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t.common.loading}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.admin.settings}</CardTitle>
        <CardDescription>{t.admin.pricePerKm}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price-per-km">{t.admin.pricePerKm}</Label>
          <Input
            id="price-per-km"
            type="number"
            step="0.01"
            min="0"
            value={pricePerKm}
            onChange={(e) => setPricePerKm(e.target.value)}
            placeholder="1.50"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? t.common.loading : t.admin.updatePrice}
        </Button>
      </CardContent>
    </Card>
  )
}

