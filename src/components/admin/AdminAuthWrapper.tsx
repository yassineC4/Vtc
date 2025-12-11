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

  useEffect(() => {
    const checkAuth = async () => {
      // Si on est sur la page de login, ne pas vérifier l'authentification
      if (pathname === '/admin/login') {
        setIsChecking(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          // Pas de session, rediriger vers login
          router.push('/admin/login')
          return
        }

        // Session valide
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Error checking auth:', err)
        // En cas d'erreur, rediriger vers login
        router.push('/admin/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Si on vérifie encore, afficher un loader
  if (isChecking && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
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

