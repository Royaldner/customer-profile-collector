import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { customerWithAddressesSchema } from '@/lib/validations/customer'

export async function POST(request: NextRequest) {
  try {
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
    // Extract user_id from request body (not part of schema validation)
    const user_id = body.user_id || null

    const supabase = await createClient()

    // Build customer insert data
    const customerInsertData = {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      contact_preference: customer.contact_preference,
      delivery_method: customer.delivery_method,
      courier: customer.courier || null,
      user_id: user_id,
      // Profile address fields (optional)
      profile_street_address: customer.profile_street_address || null,
      profile_barangay: customer.profile_barangay || null,
      profile_city: customer.profile_city || null,
      profile_province: customer.profile_province || null,
      profile_region: customer.profile_region || null,
      profile_postal_code: customer.profile_postal_code || null,
    }

    // Insert customer
    let { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert(customerInsertData)
      .select()
      .single()

    // If user_id FK violation, retry without user_id
    if (customerError?.code === '23503' && customerError.message?.includes('users')) {
      console.warn('user_id not found in auth.users, retrying without user_id:', user_id)
      const retryResult = await supabase
        .from('customers')
        .insert({ ...customerInsertData, user_id: null })
        .select()
        .single()
      customerData = retryResult.data
      customerError = retryResult.error
    }

    if (customerError) {
      // Check for duplicate email
      if (customerError.code === '23505') {
        return NextResponse.json(
          { message: 'A customer with this email already exists' },
          { status: 409 }
        )
      }
      // Check for foreign key violation (e.g., invalid courier code or user_id)
      if (customerError.code === '23503') {
        console.error('Foreign key violation:', customerError)
        return NextResponse.json(
          { message: `Unable to create customer: ${customerError.details || customerError.message}` },
          { status: 400 }
        )
      }
      console.error('Customer insert error:', customerError)
      return NextResponse.json(
        { message: `Unable to create customer: ${customerError.message}` },
        { status: 500 }
      )
    }

    // Insert addresses with customer_id (only if addresses provided)
    let addressesData: typeof addresses = []

    if (addresses.length > 0) {
      const addressesWithCustomerId = addresses.map((address) => ({
        ...address,
        customer_id: customerData.id,
        region: address.region || null,
      }))

      const { data, error: addressesError } = await supabase
        .from('addresses')
        .insert(addressesWithCustomerId)
        .select()

      if (addressesError) {
        // Rollback: delete the customer if addresses fail
        await supabase.from('customers').delete().eq('id', customerData.id)
        console.error('Addresses insert error:', addressesError)
        return NextResponse.json(
          { message: `Unable to create customer: ${addressesError.message}` },
          { status: 500 }
        )
      }

      addressesData = data || []
    }

    return NextResponse.json(
      {
        message: 'Customer registered successfully',
        customer: {
          ...customerData,
          addresses: addressesData,
        },
      },
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
