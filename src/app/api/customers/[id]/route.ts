import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { customerWithAddressesSchema } from '@/lib/validations/customer'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Fetch a single customer with addresses
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses (*)
      `)
      .eq('id', id)
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
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

// PUT - Update customer and addresses
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate the request body
    const validationResult = customerWithAddressesSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { customer, addresses } = validationResult.data

    const supabase = await createClient()

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        contact_preference: customer.contact_preference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (customerError) {
      // Check for duplicate email
      if (customerError.code === '23505') {
        return NextResponse.json(
          { message: 'A customer with this email already exists' },
          { status: 409 }
        )
      }
      console.error('Customer update error:', customerError)
      return NextResponse.json(
        { message: 'Failed to update customer' },
        { status: 500 }
      )
    }

    // Delete existing addresses
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('customer_id', id)

    if (deleteError) {
      console.error('Addresses delete error:', deleteError)
      return NextResponse.json(
        { message: 'Failed to update addresses' },
        { status: 500 }
      )
    }

    // Insert new addresses
    const addressesWithCustomerId = addresses.map((address) => ({
      ...address,
      customer_id: id,
      region: address.region || null,
    }))

    const { data: addressesData, error: addressesError } = await supabase
      .from('addresses')
      .insert(addressesWithCustomerId)
      .select()

    if (addressesError) {
      console.error('Addresses insert error:', addressesError)
      return NextResponse.json(
        { message: 'Failed to create addresses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Customer updated successfully',
      customer: {
        ...customerData,
        addresses: addressesData,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a customer and their addresses
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Delete customer (addresses will cascade delete)
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Customer delete error:', deleteError)
      return NextResponse.json(
        { message: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Customer deleted successfully',
      customer: existingCustomer,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
