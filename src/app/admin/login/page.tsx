'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getTranslations, defaultLocale } from '@/lib/i18n'

export default function LoginPage() {
  const t = getTranslations(defaultLocale)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Vérifier si l'utilisateur est déjà connecté (côté client uniquement)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isMounted = true

    const checkSession = async () => {
      try {
        // Timeout de 3 secondes pour éviter que ça reste bloqué
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Session check timeout, showing login form')
            setCheckingSession(false)
          }
        }, 3000)

        // Vérifier d'abord si les variables d'environnement sont disponibles
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase environment variables not found, showing login form')
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (isMounted) {
            setCheckingSession(false)
          }
          return
        }

        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (!isMounted) return

        if (session && !error) {
          router.push('/admin')
          router.refresh()
        } else {
          setCheckingSession(false)
        }
      } catch (err) {
        // Si erreur (ex: variables d'environnement manquantes), on laisse l'utilisateur voir la page de login
        console.error('Error checking session:', err)
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    checkSession()

    // Cleanup
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.login}</CardTitle>
          <CardDescription>{t.auth.pleaseLogin}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.common.loading : t.auth.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

