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

    const supabase = await createClient()

    // Insert customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        contact_preference: customer.contact_preference,
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
      console.error('Customer insert error:', customerError)
      return NextResponse.json(
        { message: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Insert addresses with customer_id
    const addressesWithCustomerId = addresses.map((address) => ({
      ...address,
      customer_id: customerData.id,
      region: address.region || null,
    }))

    const { data: addressesData, error: addressesError } = await supabase
      .from('addresses')
      .insert(addressesWithCustomerId)
      .select()

    if (addressesError) {
      // Rollback: delete the customer if addresses fail
      await supabase.from('customers').delete().eq('id', customerData.id)
      console.error('Addresses insert error:', addressesError)
      return NextResponse.json(
        { message: 'Failed to create addresses' },
        { status: 500 }
      )
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
