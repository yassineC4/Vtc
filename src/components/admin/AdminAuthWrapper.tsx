'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminNav } from '@/components/admin/AdminNav'
import { defaultLocale } from '@/lib/i18n'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // Si on est déjà sur la page de login, on arrête de vérifier et on affiche le contenu
    if (pathname === '/admin/login') {
      setIsChecking(false)
      return
    }

    let isMounted = true

    const checkAuth = async () => {
      try {
        // 1. Vérification "Fail-Fast" des variables d'environnement
        // Cela évite de lancer Supabase si les clés n'existent pas
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Les variables d'environnement Supabase sont manquantes dans Vercel.")
        }

        const supabase = createClient()
        
        // 2. Timeout de sécurité (5 secondes)
        // Si Supabase ne répond pas, on rejette la promesse
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 5000)
        )

        // 3. On utilise getUser() au lieu de getSession() pour la sécurité Admin
        // Promise.race = le premier qui finit (Supabase ou le Timeout) gagne
        const authResult = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as { data: { user: any }, error: any }

        if (!isMounted) return

        if (authResult.error || !authResult.data?.user) {
          console.warn('Non authentifié ou session invalide, redirection...')
          setIsAuthenticated(false)
          setIsChecking(false)
          router.replace('/admin/login') // .replace est mieux que .push ici
          return
        }

        // Tout est bon
        setIsAuthenticated(true)
        setIsChecking(false)
      
      } catch (err: any) {
        if (!isMounted) return
        
        console.error('Erreur critique Auth:', err)
        
        // Si c'est une erreur de config, on l'affiche au lieu de tourner en rond
        if (err.message && err.message.includes('Vercel')) {
          setConfigError(err.message)
        } else if (err.message === 'TIMEOUT') {
          console.error('Timeout de connexion au serveur Supabase')
          setConfigError('La connexion au serveur prend trop de temps. Vérifiez votre réseau.')
        } else {
          // Pour les autres erreurs (réseau, etc.), rediriger vers login
          console.error('Erreur d\'authentification:', err)
          setConfigError('Erreur de connexion. Veuillez réessayer.')
        }
        
        setIsAuthenticated(false)
        setIsChecking(false)
        router.replace('/admin/login')
      }
    }

    checkAuth()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [pathname, router])

  // Si on vérifie encore, afficher un loader
  if (isChecking && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
          {configError && (
            <p className="mt-4 text-sm text-destructive">{configError}</p>
          )}
        </div>
      </div>
    )
  }

  // Si sur login, afficher sans AdminNav
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Si authentifié, afficher avec AdminNav
  if (isAuthenticated) {
    return (
      <div className="min-h-screen">
        <AdminNav locale={defaultLocale} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    )
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null
}

