import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST - Set an address as the default
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: addressId } = await context.params
    const supabase = await createClient()

    // Get the address to find customer_id
    const { data: address, error: fetchError } = await supabase
      .from('addresses')
      .select('id, customer_id')
      .eq('id', addressId)
      .single()

    if (fetchError || !address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    // Unset all other defaults for this customer
    const { error: unsetError } = await supabase
      .from('addresses')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('customer_id', address.customer_id)

    if (unsetError) {
      console.error('Error unsetting defaults:', unsetError)
      return NextResponse.json(
        { message: 'Failed to update addresses' },
        { status: 500 }
      )
    }

    // Set this address as default
    const { data: updatedAddress, error: setError } = await supabase
      .from('addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .select()
      .single()

    if (setError) {
      console.error('Error setting default:', setError)
      return NextResponse.json(
        { message: 'Failed to set default address' },
        { status: 500 }
      )
    }

    // Update the customer's updated_at timestamp
    await supabase
      .from('customers')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', address.customer_id)

    return NextResponse.json({
      message: 'Default address updated successfully',
      address: updatedAddress,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
