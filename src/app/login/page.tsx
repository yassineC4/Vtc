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
  // Initialisation sécurisée des traductions (valeurs par défaut si échec)
  const t = tryGetTranslations()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Suppression de l'état bloquant "checkingSession" au démarrage
  // On affiche le formulaire DIRECTEMENT.

  // Vérification silencieuse en arrière-plan
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Session active détectée, redirection...')
          router.replace('/admin/planning') // Redirection vers le planning après connexion
        }
      } catch (err) {
        console.warn('Erreur vérification session (non bloquant):', err)
      }
    }
    checkAutoLogin()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Erreur login:', signInError)
        setError("Email ou mot de passe incorrect.") // Message générique plus sûr
        setLoading(false)
      } else {
        // Succès : Force un rechargement complet pour mettre à jour les cookies/middleware
        router.refresh() 
        // Une fois connecté, on va vers l'admin planning
        router.push('/admin/planning')
      }
    } catch (err) {
      console.error('Erreur critique login:', err)
      setError("Erreur de connexion système. Vérifiez les logs.")
      setLoading(false)
    }
  }

  // Fonction utilitaire pour éviter le crash si i18n échoue
  function tryGetTranslations() {
    try {
      return getTranslations(defaultLocale)
    } catch (e) {
      return {
        common: { loading: 'Chargement...' },
        auth: { login: 'Connexion', pleaseLogin: 'Connectez-vous', email: 'Email', password: 'Mot de passe' }
      }
    }
  }

  // Rendu immédiat du formulaire (Plus de "if checkingSession return spinner")
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t.auth.login}</CardTitle>
          <CardDescription className="text-center text-gray-500">
            {t.auth.pleaseLogin}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full"
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
                className="block w-full"
              />
            </div>
            
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Connexion...
                </>
              ) : (
                t.auth.login
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



