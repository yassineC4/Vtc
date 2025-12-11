'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminNav } from '@/components/admin/AdminNav'
import { defaultLocale } from '@/lib/i18n'

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Sécurité Timer : Si dans 3s Supabase ne répond pas, on débloque/redirige
        const timeout = setTimeout(() => {
            console.warn("Timeout Auth - Redirection de sécurité")
            router.replace('/login')
        }, 3000)

        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        clearTimeout(timeout) // On annule le timer si Supabase répond vite

        if (error || !user) {
          console.log("Non connecté -> Redirection Login")
          router.replace('/login') // On renvoie vers le nouveau chemin public
          return
        }

        setIsAuthorized(true)
      } catch (e) {
        console.error("Erreur Auth:", e)
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
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
