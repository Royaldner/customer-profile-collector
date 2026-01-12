import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  phone: z.string().min(10).max(50).optional(),
  contact_preference: z.enum(['email', 'sms']).optional(),
  delivery_method: z.enum(['pickup', 'delivered', 'cod']).optional(),
  courier: z.string().max(50).nullable().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*, addresses(*)')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'No customer profile found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = updateProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get customer to verify ownership
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Update customer
    const { data: customer, error: updateError } = await supabase
      .from('customers')
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingCustomer.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      customer
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
