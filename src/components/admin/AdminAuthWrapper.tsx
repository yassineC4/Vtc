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
    let timeoutId: NodeJS.Timeout | null = null
    let isMounted = true

    const checkAuth = async () => {
      // Si on est sur la page de login, ne pas vérifier l'authentification
      if (pathname === '/admin/login') {
        if (isMounted) {
          setIsChecking(false)
        }
        return
      }

      try {
        const supabase = createClient()
        
        // Ajouter un timeout pour éviter que ça reste bloqué (5 secondes)
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Auth check timeout, redirecting to login')
            setIsChecking(false)
            setIsAuthenticated(false)
            router.push('/admin/login')
          }
        }, 5000)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (!isMounted) return

        if (error || !session) {
          // Pas de session, rediriger vers login
          console.log('No session found, redirecting to login')
          setIsChecking(false)
          setIsAuthenticated(false)
          router.push('/admin/login')
          return
        }

        // Session valide
        setIsAuthenticated(true)
        setIsChecking(false)
      } catch (err) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (!isMounted) return
        
        console.error('Error checking auth:', err)
        // En cas d'erreur, rediriger vers login
        setIsChecking(false)
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    }

    checkAuth()

    // Cleanup function
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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

