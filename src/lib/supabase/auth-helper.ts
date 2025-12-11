import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Vérifie si l'utilisateur est authentifié
 * À utiliser dans les routes API pour protéger les endpoints admin
 * Utilise getUser() au lieu de getSession() pour une meilleure sécurité (vérifie le JWT directement)
 * Gère correctement les cookies comme le middleware
 */
export async function requireAuth(request: NextRequest) {
  try {
    // Vérifier que les variables d'environnement sont définies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Server configuration error' },
          { 
            status: 500,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          }
        ),
      }
    }

    // Créer une réponse pour pouvoir modifier les cookies
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Créer un client Supabase qui gère les cookies correctement (comme le middleware)
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Mettre à jour les cookies dans la requête et la réponse
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            // Supprimer les cookies dans la requête et la réponse
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
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

    // getUser() réussit, l'utilisateur est authentifié
    // On essaie de récupérer la session pour compatibilité (optionnel)
    let session = null
    try {
      const {
        data: { session: retrievedSession },
      } = await supabase.auth.getSession()
      session = retrievedSession || null
    } catch (sessionError) {
      // Si getSession() échoue, ce n'est pas grave, on a déjà l'utilisateur
      console.warn('Could not retrieve session, but user is authenticated:', sessionError)
    }

    return {
      authenticated: true,
      user,
      session,
      supabase,
      response, // Retourner la réponse avec les cookies mis à jour
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

