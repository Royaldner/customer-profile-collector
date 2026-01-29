/**
 * Admin Customer Orders Route
 * GET - Get invoices for a specific customer from Zoho Books (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getInvoicesWithDetails, isZohoConnected } from '@/lib/services/zoho-books'
import { transformInvoiceToOrder } from '@/lib/types/zoho'
import type { InvoiceFilter } from '@/lib/types/zoho'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/customers/[id]/orders?filter=recent|completed&page=1
 * Get customer's invoices from Zoho Books (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json(
      { error: 'Unauthorized - admin login required' },
      { status: 401 }
    )
  }

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    return NextResponse.json(
      { error: 'Zoho Books not connected' },
      { status: 400 }
    )
  }

  const { id: customerId } = await params

  // Get the customer to find their Zoho contact ID
  const supabase = await createClient()
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('zoho_contact_id')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    )
  }

  if (!customer.zoho_contact_id) {
    return NextResponse.json(
      { error: 'Customer not linked to Zoho Books' },
      { status: 400 }
    )
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
    const result = await getInvoicesWithDetails(customer.zoho_contact_id, filter, page)

    // Transform invoices to display format (with defensive check)
    const invoices = result.invoices || []
    const orders = invoices.map(transformInvoiceToOrder)

    return NextResponse.json({
      orders,
      hasMore: result.hasMore || false,
      total: result.total || 0,
      cachedAt: result.cachedAt,
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
