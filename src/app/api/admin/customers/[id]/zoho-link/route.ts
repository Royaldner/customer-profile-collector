/**
 * Customer Zoho Link Route
 * POST - Link customer to Zoho contact
 * DELETE - Unlink customer from Zoho contact
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getContact } from '@/lib/services/zoho-books'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/customers/[id]/zoho-link
 * Link customer to a Zoho Books contact
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json(
      { error: 'Unauthorized - admin login required' },
      { status: 401 }
    )
  }

  const { id: customerId } = await params

  // Get request body
  let body: { zoho_contact_id: string; zoho_contact_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { zoho_contact_id } = body

  if (!zoho_contact_id) {
    return NextResponse.json(
      { error: 'zoho_contact_id is required' },
      { status: 400 }
    )
  }

  // Verify the Zoho contact exists
  try {
    const contact = await getContact(zoho_contact_id)
    if (!contact) {
      return NextResponse.json(
        { error: 'Zoho contact not found' },
        { status: 404 }
      )
    }
  } catch (err) {
    console.error('Failed to verify Zoho contact:', err)
    return NextResponse.json(
      { error: 'Failed to verify Zoho contact' },
      { status: 500 }
    )
  }

  // Update customer with Zoho contact ID
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .update({ zoho_contact_id })
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Failed to link customer to Zoho:', error)
    return NextResponse.json(
      { error: 'Failed to link customer to Zoho contact' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    customer: data,
    message: 'Customer linked to Zoho contact',
  })
}

/**
 * DELETE /api/admin/customers/[id]/zoho-link
 * Unlink customer from Zoho Books contact
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json(
      { error: 'Unauthorized - admin login required' },
      { status: 401 }
    )
  }

  const { id: customerId } = await params

  // Update customer to remove Zoho contact ID
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .update({ zoho_contact_id: null })
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Failed to unlink customer from Zoho:', error)
    return NextResponse.json(
      { error: 'Failed to unlink customer from Zoho contact' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    customer: data,
    message: 'Customer unlinked from Zoho contact',
  })
}
