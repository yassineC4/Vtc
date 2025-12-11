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
    let isMounted = true

    const checkSession = async () => {
      try {
        // 1. Vérification Préliminaire (Fail Fast)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Configuration Supabase manquante')
          if (isMounted) {
            setCheckingSession(false)
            setError('Configuration Supabase manquante. Veuillez contacter l\'administrateur.')
          }
          return
        }

        const supabase = createClient()

        // 2. Implémentation du Timeout avec Promise.race (5000ms)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('TIMEOUT'))
          }, 5000)
        })

        const sessionPromise = supabase.auth.getSession()

        const sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ])

        if (!isMounted) return

        const { data: { session }, error: sessionError } = sessionResult as { 
          data: { session: any }, 
          error: any 
        }

        if (session && !sessionError) {
          router.push('/admin')
          router.refresh()
        } else {
          setCheckingSession(false)
        }
      } catch (err) {
        // 3. Gestion des Erreurs
        if (!isMounted) return

        if (err instanceof Error && err.message === 'TIMEOUT') {
          console.error('Session check timeout')
          setError('La connexion au serveur prend trop de temps. Vérifiez votre réseau.')
        } else {
          console.error('Error checking session:', err)
          setError('Erreur lors de la vérification de session. Veuillez réessayer.')
        }
        
        // Force setIsLoading(false) pour débloquer l'interface
        setCheckingSession(false)
      }
    }

    checkSession()

    // Cleanup
    return () => {
      isMounted = false
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

