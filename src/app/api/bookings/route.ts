import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'
import { 
  validateEmail, 
  validatePhone, 
  sanitizeString, 
  validatePrice,
  validateRideType,
  validateVehicleCategory,
  validatePaymentMethod 
} from '@/lib/validation'
import { validatePrice as validatePriceServerSide } from '@/lib/price-calculation'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting (5 requêtes par minute par IP)
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`booking:${clientIP}`, 5, 60000) // 5 req/min
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment before trying again.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      )
    }

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
    const requiredFields = {
      first_name: body.first_name,
      last_name: body.last_name,
      departure_address: body.departure_address,
      arrival_address: body.arrival_address,
      ride_type: body.ride_type,
      vehicle_category: body.vehicle_category,
      payment_method: body.payment_method,
      estimated_price: body.estimated_price,
    }
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value && value !== 0)
      .map(([key]) => key)
    
    if (missingFields.length > 0) {
      console.error('❌ Champs requis manquants:', missingFields)
      console.error('❌ Données reçues:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missing_fields: missingFields,
          received_data: body
        },
        { status: 400 }
      )
    }
    
    // ✅ Vérifier les contraintes CHECK avec fonctions de validation
    if (!validateRideType(body.ride_type)) {
      return NextResponse.json(
        { error: `Invalid ride_type: ${body.ride_type}. Must be 'immediate' or 'reservation'` },
        { status: 400 }
      )
    }
    
    if (!validateVehicleCategory(body.vehicle_category)) {
      return NextResponse.json(
        { error: `Invalid vehicle_category: ${body.vehicle_category}. Must be 'standard', 'berline', or 'van'` },
        { status: 400 }
      )
    }
    
    if (!validatePaymentMethod(body.payment_method)) {
      return NextResponse.json(
        { error: `Invalid payment_method: ${body.payment_method}. Must be 'cash' or 'card'` },
        { status: 400 }
      )
    }
    
    // ✅ Vérifier que estimated_price est un nombre valide
    if (!validatePrice(body.estimated_price)) {
      return NextResponse.json(
        { error: `Invalid estimated_price: ${body.estimated_price}. Must be a positive number` },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // ✅ VALIDATION PRIX CÔTÉ SERVEUR (sécurité contre manipulation client)
    // Récupérer le prix au km depuis la base de données
    const { data: settingsData } = await (supabase
      .from('settings')
      .select('value')
      .eq('key', 'price_per_km')
      .single() as any)
    
    const pricePerKm = (settingsData?.value as number) || 1.5

    const priceValidation = await validatePriceServerSide(
      Number(body.estimated_price),
      {
        departure_address: body.departure_address,
        arrival_address: body.arrival_address,
        vehicle_category: body.vehicle_category,
        is_round_trip: Boolean(body.is_round_trip),
        price_per_km: pricePerKm,
      }
    )

    if (!priceValidation.valid) {
      console.error('❌ Prix invalide:', {
        received: body.estimated_price,
        calculated: priceValidation.calculatedPrice,
        error: priceValidation.error,
      })
      return NextResponse.json(
        { 
          error: 'Price validation failed. Please recalculate the ride.',
          details: process.env.NODE_ENV === 'development' ? priceValidation.error : undefined,
        },
        { status: 400 }
      )
    }
    
    // ✅ Validation email si fourni
    if (body.email && !validateEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // ✅ Validation téléphone si fourni
    if (body.phone && !validatePhone(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // ✅ Sanitization et préparation des données pour l'insertion
    const insertData = {
      first_name: sanitizeString(String(body.first_name), 100),
      last_name: sanitizeString(String(body.last_name), 100),
      email: body.email ? sanitizeString(String(body.email), 255) : null,
      phone: body.phone ? sanitizeString(String(body.phone), 20) : null,
      departure_address: sanitizeString(String(body.departure_address), 500),
      arrival_address: sanitizeString(String(body.arrival_address), 500),
      scheduled_date: body.scheduled_date || null,
      ride_type: body.ride_type,
      vehicle_category: body.vehicle_category,
      is_round_trip: Boolean(body.is_round_trip),
      number_of_passengers: Number(body.number_of_passengers) || 1,
      baby_seat: Boolean(body.baby_seat),
      payment_method: body.payment_method,
      estimated_price: Number(body.estimated_price),
      estimated_distance: body.estimated_distance ? Number(body.estimated_distance) : null,
      estimated_duration: body.estimated_duration ? Number(body.estimated_duration) : null,
      status: body.status || 'pending',
    }

    // ✅ Validation estimated_distance (positif, max 10000 km = 10 000 000 m)
    if (insertData.estimated_distance !== null) {
      const distance = insertData.estimated_distance
      if (isNaN(distance) || distance < 0 || distance > 10000000) {
        return NextResponse.json(
          { error: 'Invalid estimated_distance. Must be between 0 and 10000 km (10,000,000 meters)' },
          { status: 400 }
        )
      }
    }

    // ✅ Validation estimated_duration (positif, max 24h = 1440 min)
    if (insertData.estimated_duration !== null) {
      const duration = insertData.estimated_duration
      if (isNaN(duration) || duration < 0 || duration > 1440) {
        return NextResponse.json(
          { error: 'Invalid estimated_duration. Must be between 0 and 1440 minutes (24 hours)' },
          { status: 400 }
        )
      }
    }
    
    console.log('📤 Insertion dans Supabase avec données:', JSON.stringify(insertData, null, 2))
    const { data, error } = await (supabase
      .from('bookings') as any)
      .insert([insertData])
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
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error instanceof Error ? error.message : 'Internal server error'),
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

    // ✅ Sélectionner uniquement les champs nécessaires (sécurité - éviter fuite de données)
    let query = supabase
      .from('bookings')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        departure_address,
        arrival_address,
        scheduled_date,
        ride_type,
        vehicle_category,
        is_round_trip,
        number_of_passengers,
        baby_seat,
        payment_method,
        estimated_price,
        estimated_distance,
        estimated_duration,
        status,
        driver_id,
        driver_assigned_at,
        notes,
        created_at,
        updated_at,
        driver:drivers(id, first_name, last_name, is_online)
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
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error instanceof Error ? error.message : 'Internal server error')
      },
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

    // ✅ CRITIQUE: Récupérer l'état actuel AVANT la mise à jour (pour optimistic locking)
    const { data: currentBooking, error: fetchError } = await (supabase
      .from('bookings') as any)
      .select('status, driver_id')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // ✅ CRITIQUE: Valider les transitions d'état
    const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Aucune transition depuis "completed"
      'cancelled': [], // Aucune transition depuis "cancelled"
    }

    if (updates.status) {
      const allowedTransitions = VALID_STATUS_TRANSITIONS[currentBooking.status] || []
      if (!allowedTransitions.includes(updates.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition. Cannot go from '${currentBooking.status}' to '${updates.status}'. Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none'}`,
            current_status: currentBooking.status,
            attempted_status: updates.status,
            allowed_transitions: allowedTransitions,
          },
          { status: 400 }
        )
      }
    }

    // ✅ CRITIQUE: Vérifier les conflits de chauffeur (si on assigne un chauffeur)
    if (updates.driver_id) {
      // Si un chauffeur est déjà assigné et qu'on essaie d'en assigner un autre
      if (currentBooking.driver_id && 
          currentBooking.driver_id !== updates.driver_id &&
          currentBooking.status !== 'pending') {
        return NextResponse.json(
          {
            error: 'Booking already has a driver assigned. Cannot reassign unless booking is pending.',
            current_driver_id: currentBooking.driver_id,
            attempted_driver_id: updates.driver_id,
          },
          { status: 409 }
        )
      }
    }

    // ✅ Whitelist des champs modifiables (sécurité)
    const allowedUpdates = ['status', 'driver_id', 'driver_assigned_at', 'notes']
    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        // Sanitize les valeurs si nécessaire
        if (key === 'notes' && updates[key]) {
          obj[key] = sanitizeString(String(updates[key]), 1000)
        } else {
          obj[key] = updates[key]
        }
        return obj
      }, {} as Record<string, any>)

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // ✅ CRITIQUE: Optimistic locking - UPDATE avec vérification conditionnelle
    // Si on change le status, vérifier que driver_id n'a pas changé
    // Si on change driver_id, vérifier que status n'a pas changé
    // Si on change les deux, vérifier que les deux n'ont pas changé depuis la lecture
    let query = (supabase
      .from('bookings') as any)
      .update(sanitizedUpdates)
      .eq('id', id)

    // Optimistic locking : vérifier les champs qu'on ne modifie PAS
    if (!sanitizedUpdates.status) {
      // Si on ne change pas le status, vérifier qu'il n'a pas changé
      query = query.eq('status', currentBooking.status)
    }
    if (!sanitizedUpdates.driver_id) {
      // Si on ne change pas le driver_id, vérifier qu'il n'a pas changé
      query = query.eq('driver_id', currentBooking.driver_id || null)
    }

    const { data, error } = await query
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      // Si aucune ligne n'a été mise à jour, c'est probablement un conflit (optimistic locking)
      if (error.code === 'PGRST116' || !data) {
        return NextResponse.json(
          {
            error: 'Booking was modified by another user. Please refresh and try again.',
            conflict: true,
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Vérifier que la mise à jour a bien eu lieu
    if (!data) {
      return NextResponse.json(
        {
          error: 'Booking was modified by another user. Please refresh and try again.',
          conflict: true,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/bookings:', error)
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error instanceof Error ? error.message : 'Internal server error')
      },
      { status: 500 }
    )
  }
}

