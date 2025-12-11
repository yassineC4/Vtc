import { NextRequest, NextResponse } from 'next/server'
import { createClient } from './server'

/**
 * Vérifie si l'utilisateur est authentifié
 * À utiliser dans les routes API pour protéger les endpoints admin
 */
export async function requireAuth(request: NextRequest) {
  try {
    const supabase = await createClient()
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

