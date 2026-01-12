import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { courierUpdateSchema } from '@/lib/validations/courier'

interface RouteContext {
  params: Promise<{ id: string }>
}

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Fetch a single courier
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: courier, error } = await supabase
      .from('couriers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !courier) {
      return NextResponse.json(
        { message: 'Courier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ courier })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a courier (admin only)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate request body
    const validationResult = courierUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, is_active } = validationResult.data
    const supabase = await createClient()

    // Check if courier exists
    const { data: existingCourier, error: fetchError } = await supabase
      .from('couriers')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCourier) {
      return NextResponse.json(
        { message: 'Courier not found' },
        { status: 404 }
      )
    }

    // Update courier
    const { data: courier, error } = await supabase
      .from('couriers')
      .update({
        name,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Courier update error:', error)
      return NextResponse.json(
        { message: 'Failed to update courier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Courier updated successfully',
      courier,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a courier (set is_active = false)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const supabase = await createClient()

    // Check if courier exists
    const { data: existingCourier, error: fetchError } = await supabase
      .from('couriers')
      .select('id, code, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingCourier) {
      return NextResponse.json(
        { message: 'Courier not found' },
        { status: 404 }
      )
    }

    // Soft delete: set is_active to false
    const { data: courier, error } = await supabase
      .from('couriers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Courier delete error:', error)
      return NextResponse.json(
        { message: 'Failed to deactivate courier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Courier deactivated successfully',
      courier,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
