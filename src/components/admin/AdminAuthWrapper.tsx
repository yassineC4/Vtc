'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminNav } from '@/components/admin/AdminNav'
import { defaultLocale } from '@/lib/i18n'

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // ✅ Blocage de la boucle infinie : Si on est déjà sur /login, on ne fait rien
    if (pathname === '/login') {
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        // ✅ Vérification fail-fast des variables d'environnement
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Variables d'environnement Supabase manquantes dans Vercel.")
        }

        // 1. Sécurité Timer : Si dans 5s Supabase ne répond pas, on débloque/redirige
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 5000)
        )

        const supabase = createClient()
        const authResult = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as any

        if (authResult.error || !authResult.data?.user) {
          console.log("Non connecté -> Redirection Login")
          router.replace('/login')
          return
        }

        setIsAuthorized(true)
      } catch (err: any) {
        console.error("Erreur Auth:", err)
        
        // ✅ Gestion spécifique des erreurs de configuration
        if (err.message && err.message.includes('Vercel')) {
          setConfigError(err.message)
        } else if (err.message === 'TIMEOUT') {
          setConfigError('La connexion au serveur prend trop de temps. Vérifiez votre réseau.')
        } else {
          router.replace('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // ✅ Affichage de l'erreur de configuration si présente
  if (configError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-800">
        <h1 className="text-xl font-bold mb-2">Erreur de Configuration</h1>
        <p>{configError}</p>
      </div>
    )
  }

  // ✅ Si on est sur /login, on affiche directement les enfants (pas de vérification auth)
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-500">Connexion au serveur...</p>
      </div>
    )
  }

  // Si autorisé, on affiche l'Admin
  if (isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav locale={defaultLocale} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    )
  }

  // Sinon rien (en train de rediriger)
  return null
}
