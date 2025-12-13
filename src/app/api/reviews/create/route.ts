import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting (10 requêtes par minute par IP pour les avis)
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`review:${clientIP}`, 10, 60000) // 10 req/min
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment before submitting another review.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      )
    }

    const body = await request.json()
    const { author_name, rating, content } = body

    // ✅ Validation complète des champs requis
    if (!author_name || !rating || !content) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // ✅ Validation rating (1-5)
    const ratingNum = parseInt(String(rating))
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // ✅ Validation longueur des champs
    if (String(author_name).trim().length === 0 || String(author_name).trim().length > 100) {
      return NextResponse.json(
        { error: 'Author name must be between 1 and 100 characters' },
        { status: 400 }
      )
    }

    if (String(content).trim().length === 0 || String(content).trim().length > 1000) {
      return NextResponse.json(
        { error: 'Content must be between 1 and 1000 characters' },
        { status: 400 }
      )
    }

    // Utiliser service_role (bypass RLS)
    const supabase = await createAdminClient()

    // ✅ Sanitization avant insertion
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        author_name: sanitizeString(String(author_name), 100),
        rating: ratingNum,
        content: sanitizeString(String(content), 1000),
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



