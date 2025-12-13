import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'
import { sanitizeString, validateEmail, validatePhone } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification - seulement les admins peuvent voir les chauffeurs
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    // Utiliser createAdminClient() qui utilise SUPABASE_SERVICE_ROLE_KEY
    // Cela bypass la RLS et permet d'accéder à toutes les données
    const supabase = await createAdminClient()

    // ✅ Sélectionner uniquement les champs nécessaires (sécurité)
    const { data, error } = await (supabase as any)
      .from('drivers')
      .select('id, first_name, last_name, phone, is_online, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching drivers:', error)
      return NextResponse.json(
        { error: error.message },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    // Retourner la réponse avec cache: 'no-store' pour éviter les problèmes de cache Vercel
    // Le middleware gère déjà les cookies, pas besoin de les propager ici
    return NextResponse.json(
      { data }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in GET /api/drivers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { first_name, last_name, phone, email, is_online } = body

    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'first_name, last_name, and phone are required' },
        { status: 400 }
      )
    }

    // ✅ Validation des champs
    const firstName = String(first_name).trim()
    const lastName = String(last_name).trim()
    const phoneStr = String(phone).trim()

    if (firstName.length === 0 || firstName.length > 100) {
      return NextResponse.json(
        { error: 'first_name must be between 1 and 100 characters' },
        { status: 400 }
      )
    }

    if (lastName.length === 0 || lastName.length > 100) {
      return NextResponse.json(
        { error: 'last_name must be between 1 and 100 characters' },
        { status: 400 }
      )
    }

    if (!validatePhone(phoneStr)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validation email si fourni
    if (email && email.trim().length > 0) {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    const supabase = await createAdminClient()

    // ✅ Sanitization avant insertion
    const { data, error } = await (supabase as any)
      .from('drivers')
      .insert([{
        first_name: sanitizeString(firstName, 100),
        last_name: sanitizeString(lastName, 100),
        phone: sanitizeString(phoneStr, 20),
        email: email && email.trim().length > 0 ? sanitizeString(String(email), 255) : null,
        is_online: Boolean(is_online) || false,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating driver:', error)
      return NextResponse.json(
        { error: error.message },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    return NextResponse.json(
      { data }, 
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error in POST /api/drivers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    // ✅ Whitelist des champs modifiables
    const ALLOWED_DRIVER_FIELDS = ['first_name', 'last_name', 'phone', 'email', 'is_online']
    const sanitizedUpdates: any = {}
    
    // Valider et sanitizer chaque champ
    if (updates.first_name !== undefined) {
      const firstName = String(updates.first_name).trim()
      if (firstName.length === 0 || firstName.length > 100) {
        return NextResponse.json(
          { error: 'first_name must be between 1 and 100 characters' },
          { status: 400 }
        )
      }
      sanitizedUpdates.first_name = sanitizeString(firstName, 100)
    }
    
    if (updates.last_name !== undefined) {
      const lastName = String(updates.last_name).trim()
      if (lastName.length === 0 || lastName.length > 100) {
        return NextResponse.json(
          { error: 'last_name must be between 1 and 100 characters' },
          { status: 400 }
        )
      }
      sanitizedUpdates.last_name = sanitizeString(lastName, 100)
    }
    
    if (updates.phone !== undefined) {
      const phone = String(updates.phone).trim()
      if (phone.length === 0) {
        return NextResponse.json(
          { error: 'phone is required' },
          { status: 400 }
        )
      }
      if (!validatePhone(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }
      sanitizedUpdates.phone = sanitizeString(phone, 20)
    }
    
    if (updates.email !== undefined && updates.email !== null) {
      const email = String(updates.email).trim()
      if (email.length > 0) {
        if (!validateEmail(email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          )
        }
        sanitizedUpdates.email = sanitizeString(email, 255)
      } else {
        sanitizedUpdates.email = null
      }
    }
    
    if (updates.is_online !== undefined) {
      sanitizedUpdates.is_online = Boolean(updates.is_online)
    }

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { data, error } = await (supabase as any)
      .from('drivers')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating driver:', error)
      return NextResponse.json(
        { error: error.message },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    return NextResponse.json(
      { data }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error in PATCH /api/drivers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    const supabase = await createAdminClient()

    const { error } = await (supabase as any)
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting driver:', error)
      return NextResponse.json(
        { error: error.message },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      )
    }

    return NextResponse.json(
      { success: true }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error in DELETE /api/drivers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}

