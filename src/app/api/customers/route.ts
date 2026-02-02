import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { customerWithAddressesSchema } from '@/lib/validations/customer'
import { syncCustomerToZoho } from '@/lib/services/zoho-sync'
import { isZohoConnected } from '@/lib/services/zoho-books'

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

    // Insert customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
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
        // Zoho sync fields (EPIC-14)
        is_returning_customer: customer.is_returning_customer || false,
        zoho_sync_status: 'pending',
      })
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

    // Sync customer to Zoho inline (EPIC-14)
    // Failures don't block registration
    try {
      const zohoConnected = await isZohoConnected()
      if (zohoConnected) {
        await syncCustomerToZoho(
          customerData.id,
          customer.is_returning_customer || false
        )
      }
    } catch (syncError) {
      console.error('Zoho sync failed (non-blocking):', syncError)
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
