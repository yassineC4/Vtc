import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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
    const body = await request.json()
    const { name_fr, name_en, address, icon, fixed_price, display_order, is_active } = body

    if (!name_fr || !name_en || !address || fixed_price === undefined) {
      return NextResponse.json(
        { error: 'name_fr, name_en, address, and fixed_price are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const insertData = {
        name_fr,
        name_en,
        address,
        icon: icon || null,
        fixed_price: parseFloat(fixed_price),
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
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
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Préparer les données de mise à jour
    const updateData: any = {}
    if (updates.name_fr !== undefined) updateData.name_fr = updates.name_fr
    if (updates.name_en !== undefined) updateData.name_en = updates.name_en
    if (updates.address !== undefined) updateData.address = updates.address
    if (updates.icon !== undefined) updateData.icon = updates.icon || null
    if (updates.fixed_price !== undefined) updateData.fixed_price = parseFloat(updates.fixed_price)
    if (updates.display_order !== undefined) updateData.display_order = parseInt(updates.display_order)
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active

    const { error } = await supabase
      .from('popular_destinations')
      // @ts-ignore - Typage Supabase
      .update(updateData)
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

