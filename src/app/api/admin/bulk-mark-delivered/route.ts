import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: { customerIds?: string[]; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { customerIds, notes } = body

  if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
    return NextResponse.json(
      { message: 'customerIds array is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Bulk set delivered_at timestamp
  const { data, error } = await supabase
    .from('customers')
    .update({ delivered_at: new Date().toISOString() })
    .in('id', customerIds)
    .select('id')

  if (error) {
    console.error('Error bulk marking customers as delivered:', error)
    return NextResponse.json(
      { message: 'Failed to mark customers as delivered' },
      { status: 500 }
    )
  }

  const updatedCount = data?.length || 0

  // Create delivery log entries for each customer
  if (updatedCount > 0) {
    const logEntries = customerIds.map(customerId => ({
      customer_id: customerId,
      action: 'delivered' as const,
      notes,
    }))

    const { error: logError } = await supabase
      .from('delivery_logs')
      .insert(logEntries)

    if (logError) {
      console.error('Error creating delivery logs:', logError)
      // Don't fail the request, just log the error
    }
  }

  return NextResponse.json({
    message: `${updatedCount} customer${updatedCount !== 1 ? 's' : ''} marked as Delivered`,
    updatedCount,
  })
}
