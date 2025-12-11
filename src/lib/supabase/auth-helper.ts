import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Vérifie si l'utilisateur est authentifié
 * À utiliser dans les routes API pour protéger les endpoints admin
 * Utilise getUser() au lieu de getSession() pour une meilleure sécurité (vérifie le JWT directement)
 */
export async function requireAuth(request: NextRequest) {
  try {
    // Créer un client Supabase qui lit les cookies depuis la requête
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Lire les cookies depuis la requête
            // Compatible avec Vercel et les edge functions
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }))
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            // Dans les routes API, on ne peut pas modifier les cookies directement
            // Les cookies seront mis à jour par le client Supabase côté navigateur
            // Cette méthode est appelée mais on ne fait rien ici
          },
        },
      }
    )

    // Utiliser getUser() au lieu de getSession() pour une meilleure sécurité
    // getUser() vérifie directement le JWT et est plus fiable en production
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('Auth check failed:', error?.message || 'No user found')
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { 
            status: 401,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          }
        ),
      }
    }

    // Récupérer la session pour la compatibilité avec le code existant
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return {
      authenticated: true,
      user,
      session,
      supabase,
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      ),
    }
  }
}

