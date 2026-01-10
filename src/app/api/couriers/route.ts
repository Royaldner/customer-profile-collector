import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { courierSchema } from '@/lib/validations/courier'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Fetch all active couriers (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('all') === 'true'

    // If requesting all (admin view), check admin session
    if (includeInactive) {
      if (!(await isAdmin())) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    let query = supabase
      .from('couriers')
      .select('*')
      .order('name', { ascending: true })

    // Only show active couriers for public requests
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: couriers, error } = await query

    if (error) {
      console.error('Couriers fetch error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch couriers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ couriers })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new courier (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validationResult = courierSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { code, name, is_active } = validationResult.data
    const supabase = await createClient()

    // Insert new courier
    const { data: courier, error } = await supabase
      .from('couriers')
      .insert({
        code,
        name,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate code
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'A courier with this code already exists' },
          { status: 409 }
        )
      }
      console.error('Courier insert error:', error)
      return NextResponse.json(
        { message: 'Failed to create courier' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Courier created successfully', courier },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
