/**
 * Customer Orders Route
 * GET - Get invoices for the logged-in customer from Zoho Books
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInvoices, isZohoConnected } from '@/lib/services/zoho-books'
import { transformInvoiceToOrder } from '@/lib/types/zoho'
import type { InvoiceFilter } from '@/lib/types/zoho'

export const dynamic = 'force-dynamic'

/**
 * GET /api/customer/orders?filter=recent|completed&page=1
 * Get logged-in customer's invoices from Zoho Books
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - please log in' },
      { status: 401 }
    )
  }

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    return NextResponse.json(
      { error: 'Order tracking is temporarily unavailable' },
      { status: 503 }
    )
  }

  // Get the customer record for this user
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, zoho_contact_id')
    .eq('user_id', user.id)
    .single()

  if (customerError || !customer) {
    return NextResponse.json(
      { error: 'Customer profile not found' },
      { status: 404 }
    )
  }

  if (!customer.zoho_contact_id) {
    return NextResponse.json({
      orders: [],
      hasMore: false,
      total: 0,
      cachedAt: null,
      linked: false,
      message: 'Your account is not yet linked to order tracking. Please contact support.',
    })
  }

  // Get filter and page from query params
  const searchParams = request.nextUrl.searchParams
  const filter = (searchParams.get('filter') || 'recent') as InvoiceFilter
  const page = parseInt(searchParams.get('page') || '1', 10)

  // Validate filter
  if (!['recent', 'completed'].includes(filter)) {
    return NextResponse.json(
      { error: 'Invalid filter. Use "recent" or "completed"' },
      { status: 400 }
    )
  }

  try {
    const result = await getInvoices(customer.zoho_contact_id, filter, page)

    // Transform invoices to display format (with defensive check)
    const invoices = result.invoices || []
    const orders = invoices.map(transformInvoiceToOrder)

    return NextResponse.json({
      orders,
      hasMore: result.hasMore || false,
      total: result.total || 0,
      cachedAt: result.cachedAt,
      linked: true,
      filter,
      page,
    })
  } catch (err) {
    console.error('Failed to fetch customer orders:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json(
      { error: `Failed to fetch orders: ${message}` },
      { status: 500 }
    )
  }
}
