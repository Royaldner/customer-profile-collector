import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addressSchema } from '@/lib/validations/customer'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the address belongs to the user's customer profile
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check address exists and belongs to customer
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('id, customer_id')
      .eq('id', addressId)
      .single()

    if (!existingAddress || existingAddress.customer_id !== customer.id) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
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

    // If setting as default, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id)
        .neq('id', addressId)
    }

    const { data: address, error: updateError } = await supabase
      .from('addresses')
      .update({
        ...addressData,
        region: addressData.region || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', addressId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      message: 'Address updated successfully',
      address
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the address belongs to the user's customer profile
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check address exists and belongs to customer
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('id, customer_id, is_default')
      .eq('id', addressId)
      .single()

    if (!existingAddress || existingAddress.customer_id !== customer.id) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    // Get count of addresses
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id)

    // Check if this is a delivery customer with only one address
    const { data: customerData } = await supabase
      .from('customers')
      .select('delivery_method')
      .eq('id', customer.id)
      .single()

    if (customerData?.delivery_method !== 'pickup' && count === 1) {
      return NextResponse.json(
        { message: 'Cannot delete the only address for delivery orders' },
        { status: 400 }
      )
    }

    const wasDefault = existingAddress.is_default

    // Delete the address
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)

    if (deleteError) {
      throw deleteError
    }

    // If we deleted the default address, set another one as default
    if (wasDefault && count && count > 1) {
      const { data: firstAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('customer_id', customer.id)
        .limit(1)
        .single()

      if (firstAddress) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', firstAddress.id)
      }
    }

    return NextResponse.json({
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
