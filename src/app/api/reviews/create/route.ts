import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { author_name, rating, content } = body

    // Validation
    if (!author_name || !rating || !content) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Utiliser service_role (bypass RLS)
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        author_name: author_name.trim(),
        rating: parseInt(rating),
        content: content.trim(),
        status: 'pending',
      } as any)
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée retournée' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data[0] }, { status: 200 })
  } catch (error) {
    console.error('Error in reviews/create API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}



