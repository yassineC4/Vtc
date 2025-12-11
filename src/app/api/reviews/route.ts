import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helper'

// Cette route est pour les opérations admin (PATCH, DELETE)
// La route POST publique est dans /api/reviews/create

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (!authResult.authenticated) {
      return authResult.response
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { error } = await (supabase as any)
      .from('reviews')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { error } = await (supabase as any)
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Ancienne route POST - redirige vers /api/reviews/create
// Cette route est gardée pour compatibilité mais devrait utiliser /api/reviews/create
export async function POST(request: NextRequest) {
  // POST est public (création d'avis par les clients)
  // Redirige vers /api/reviews/create qui est la route publique
  try {
    const body = await request.json()
    const { author_name, rating, content } = body

    const supabase = await createAdminClient()

    const { data, error } = await (supabase as any)
      .from('reviews')
      .insert({
        author_name,
        rating: parseInt(rating),
        content,
        status: 'pending',
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}