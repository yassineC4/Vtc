import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'
import { validatePrice } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // ✅ Whitelist des clés autorisées
    const ALLOWED_SETTINGS_KEYS = ['price_per_km']
    if (!ALLOWED_SETTINGS_KEYS.includes(key)) {
      return NextResponse.json(
        { error: `Invalid setting key. Allowed keys: ${ALLOWED_SETTINGS_KEYS.join(', ')}` },
        { status: 400 }
      )
    }

    // ✅ Validation de la valeur (prix au km: positif, max 1000€/km)
    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 1000) {
      return NextResponse.json(
        { error: 'Value must be a number between 0 and 1000' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Mettre à jour ou insérer le paramètre
    const { error } = await (supabase as any)
      .from('settings')
      .upsert({ key, value: numValue }, { onConflict: 'key' })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/settings:', error)
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

