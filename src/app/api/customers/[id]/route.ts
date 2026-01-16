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
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        contact_preference: customer.contact_preference,
        delivery_method: customer.delivery_method,
        courier: customer.courier || null,
        // Profile address fields (optional)
        profile_street_address: customer.profile_street_address || null,
        profile_barangay: customer.profile_barangay || null,
        profile_city: customer.profile_city || null,
        profile_province: customer.profile_province || null,
        profile_region: customer.profile_region || null,
        profile_postal_code: customer.profile_postal_code || null,
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

// DELETE - Delete a customer and their addresses (and linked auth user if exists)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Check if customer exists and fetch user_id
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Track auth deletion status for response
    let authDeleteWarning: string | undefined

    // If customer has a linked auth user, attempt to delete it first
    if (existingCustomer.user_id) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()

        const { error: authError } = await adminClient.auth.admin.deleteUser(
          existingCustomer.user_id
        )

        if (authError) {
          console.error('Auth user delete error:', authError)
          authDeleteWarning = `Customer deleted but auth user cleanup failed: ${authError.message}`
        }
      } catch (adminError) {
        console.error('Admin client error:', adminError)
        authDeleteWarning =
          'Customer deleted but auth user cleanup failed: Admin client unavailable'
      }
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

    // Build response
    const response: {
      message: string
      customer: { id: string; first_name: string; last_name: string }
      warning?: string
    } = {
      message: 'Customer deleted successfully',
      customer: {
        id: existingCustomer.id,
        first_name: existingCustomer.first_name,
        last_name: existingCustomer.last_name,
      },
    }

    if (authDeleteWarning) {
      response.warning = authDeleteWarning
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
