import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'

export async function POST(request: NextRequest) {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY non définie')
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      )
    }
    
    // POST peut être public (création de réservation par les clients)
    const body = await request.json()
    
    console.log('📥 POST /api/bookings - Données reçues:', JSON.stringify(body, null, 2))
    
    // Vérifier que les champs requis sont présents
    if (!body.first_name || !body.last_name || !body.departure_address || !body.arrival_address) {
      console.error('❌ Champs requis manquants:', {
        first_name: !!body.first_name,
        last_name: !!body.last_name,
        departure_address: !!body.departure_address,
        arrival_address: !!body.arrival_address,
      })
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name, departure_address, arrival_address' },
        { status: 400 }
      )
    }
    
    const supabase = await createAdminClient()
    
    console.log('📤 Insertion dans Supabase...')
    const { data, error } = await (supabase
      .from('bookings') as any)
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      console.error('❌ Code erreur:', error.code)
      console.error('❌ Message erreur:', error.message)
      console.error('❌ Détails erreur:', error.details)
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      )
    }

    console.log('✅ Réservation créée avec succès:', data?.id)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('❌ Exception dans POST /api/bookings:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification - seulement les admins peuvent voir les réservations
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        driver:drivers(*)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification - seulement les admins peuvent modifier les réservations
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { data, error } = await (supabase
      .from('bookings') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

