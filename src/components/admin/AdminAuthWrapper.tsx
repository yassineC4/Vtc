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
    // ÉVITER LA BOUCLE : Si on est déjà sur login, on arrête tout de suite
    if (pathname === '/admin/login') {
      setIsChecking(false)
      return
    }

    let isMounted = true

    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // VÉRIFICATION RAPIDE (FAIL-FAST)
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Variables d'environnement Vercel manquantes.")
        }

        const supabase = createClient()
        
        // TIMEOUT : 5 secondes max pour répondre
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )

        // COURSE : Supabase vs Timeout
        const { data, error } = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as any

        if (!isMounted) return

        if (error || !data?.user) {
          console.log('Pas de session, redirection...')
          // Redirection forcée
          router.replace('/admin/login')
          return
        }

        // Succès
        setIsAuthenticated(true)
      
      } catch (err: any) {
        if (!isMounted) return
        console.error('Erreur Auth:', err)
        
        if (err.message && err.message.includes('Vercel')) {
            setConfigError(err.message)
        } else {
            // En cas de timeout ou autre, on renvoie au login pour ne pas bloquer
            router.replace('/admin/login')
        }
      } finally {
        if (isMounted) setIsChecking(false)
      }
    }

    checkAuth()

    return () => { isMounted = false }
  }, [pathname, router])

  // CAS 1 : Erreur Config (Affiche l'erreur en rouge)
  if (configError) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-800">
            <h1 className="text-xl font-bold mb-2">Erreur de Configuration</h1>
            <p>{configError}</p>
        </div>
    )
  }

  // CAS 2 : Page de Login (Affiche toujours le contenu)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // CAS 3 : Chargement (Spinner)
  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-500">Connexion au serveur...</p>
      </div>
    )
  }

  // CAS 4 : Authentifié
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav locale={defaultLocale} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    )
  }

  return null
}
