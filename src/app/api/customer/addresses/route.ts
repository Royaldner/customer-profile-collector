import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addressSchema } from '@/lib/validations/customer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer to verify ownership
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check current address count
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id)

    if (count !== null && count >= 3) {
      return NextResponse.json(
        { message: 'Maximum 3 addresses allowed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validationResult = addressSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const addressData = validationResult.data

    // If this is the first address or is_default is true, handle default logic
    if (addressData.is_default) {
      // Unset any existing default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id)
    } else if (count === 0) {
      // First address must be default
      addressData.is_default = true
    }

    const { data: address, error: insertError } = await supabase
      .from('addresses')
      .insert({
        ...addressData,
        customer_id: customer.id,
        region: addressData.region || null,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      message: 'Address added successfully',
      address
    }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
