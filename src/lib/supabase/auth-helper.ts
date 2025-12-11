import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Vérifie si l'utilisateur est authentifié
 * À utiliser dans les routes API pour protéger les endpoints admin
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
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }))
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            // Dans les routes API, on ne peut pas modifier les cookies directement
            // Les cookies seront mis à jour par le client Supabase côté navigateur
          },
        },
      }
    )

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
      }
    }

    return {
      authenticated: true,
      session,
      supabase,
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      ),
    }
  }
}

