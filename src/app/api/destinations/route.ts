import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'
import { sanitizeString, validatePrice } from '@/lib/validation'

export async function GET() {
  try {
    // GET est public (lecture seule pour l'affichage des destinations)
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('popular_destinations')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification pour les opérations admin
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { name_fr, name_en, address, icon, fixed_price, display_order, is_active } = body

    if (!name_fr || !name_en || !address || fixed_price === undefined) {
      return NextResponse.json(
        { error: 'name_fr, name_en, address, and fixed_price are required' },
        { status: 400 }
      )
    }

    // ✅ Validation du prix
    if (!validatePrice(fixed_price)) {
      return NextResponse.json(
        { error: 'Invalid price. Must be a positive number' },
        { status: 400 }
      )
    }

    // ✅ Validation de la longueur des champs
    if (String(name_fr).trim().length === 0 || String(name_fr).trim().length > 200) {
      return NextResponse.json(
        { error: 'name_fr must be between 1 and 200 characters' },
        { status: 400 }
      )
    }

    if (String(name_en).trim().length === 0 || String(name_en).trim().length > 200) {
      return NextResponse.json(
        { error: 'name_en must be between 1 and 200 characters' },
        { status: 400 }
      )
    }

    if (String(address).trim().length === 0 || String(address).trim().length > 500) {
      return NextResponse.json(
        { error: 'address must be between 1 and 500 characters' },
        { status: 400 }
      )
    }

    // ✅ Validation de l'icône (whitelist)
    const validIcons = ['airplane', 'train', 'mapPin', 'navigation', null]
    const iconValue = icon || null
    if (!validIcons.includes(iconValue)) {
      return NextResponse.json(
        { error: 'Invalid icon. Must be one of: airplane, train, mapPin, navigation' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // ✅ Sanitization avant insertion
    const insertData = {
        name_fr: sanitizeString(String(name_fr), 200),
        name_en: sanitizeString(String(name_en), 200),
        address: sanitizeString(String(address), 500),
        icon: iconValue,
        fixed_price: Number(fixed_price),
        display_order: Number(display_order) || 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      }

    const { data, error } = await supabase
      .from('popular_destinations')
      // @ts-ignore - Typage Supabase
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification pour les opérations admin
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // ✅ Whitelist des champs modifiables
    const ALLOWED_DESTINATION_FIELDS = ['name_fr', 'name_en', 'address', 'icon', 'fixed_price', 'display_order', 'is_active']
    const sanitizedUpdates: any = {}
    
    if (updates.name_fr !== undefined) {
      if (String(updates.name_fr).trim().length === 0 || String(updates.name_fr).trim().length > 200) {
        return NextResponse.json(
          { error: 'name_fr must be between 1 and 200 characters' },
          { status: 400 }
        )
      }
      sanitizedUpdates.name_fr = sanitizeString(String(updates.name_fr), 200)
    }
    
    if (updates.name_en !== undefined) {
      if (String(updates.name_en).trim().length === 0 || String(updates.name_en).trim().length > 200) {
        return NextResponse.json(
          { error: 'name_en must be between 1 and 200 characters' },
          { status: 400 }
        )
      }
      sanitizedUpdates.name_en = sanitizeString(String(updates.name_en), 200)
    }
    
    if (updates.address !== undefined) {
      if (String(updates.address).trim().length === 0 || String(updates.address).trim().length > 500) {
        return NextResponse.json(
          { error: 'address must be between 1 and 500 characters' },
          { status: 400 }
        )
      }
      sanitizedUpdates.address = sanitizeString(String(updates.address), 500)
    }
    
    if (updates.icon !== undefined) {
      const validIcons = ['airplane', 'train', 'mapPin', 'navigation', null]
      const iconValue = updates.icon || null
      if (!validIcons.includes(iconValue)) {
        return NextResponse.json(
          { error: 'Invalid icon. Must be one of: airplane, train, mapPin, navigation' },
          { status: 400 }
        )
      }
      sanitizedUpdates.icon = iconValue
    }
    
    if (updates.fixed_price !== undefined) {
      if (!validatePrice(updates.fixed_price)) {
        return NextResponse.json(
          { error: 'Invalid price. Must be a positive number' },
          { status: 400 }
        )
      }
      sanitizedUpdates.fixed_price = Number(updates.fixed_price)
    }
    
    if (updates.display_order !== undefined) {
      const order = parseInt(String(updates.display_order))
      if (isNaN(order) || order < 0) {
        return NextResponse.json(
          { error: 'display_order must be a non-negative integer' },
          { status: 400 }
        )
      }
      sanitizedUpdates.display_order = order
    }
    
    if (updates.is_active !== undefined) {
      sanitizedUpdates.is_active = Boolean(updates.is_active)
    }

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('popular_destinations')
      // @ts-ignore - Typage Supabase
      .update(sanitizedUpdates)
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification pour les opérations admin
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('popular_destinations')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

