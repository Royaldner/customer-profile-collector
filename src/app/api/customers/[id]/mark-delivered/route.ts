import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ message: 'Customer ID is required' }, { status: 400 })
  }

  // Parse optional notes from request body
  let notes: string | undefined
  try {
    const body = await request.json()
    notes = body.notes
  } catch {
    // No body or invalid JSON is fine
  }

  const supabase = await createClient()

  // Mark as delivered by setting delivered_at timestamp
  const { data: customer, error } = await supabase
    .from('customers')
    .update({ delivered_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error marking customer as delivered:', error)
    return NextResponse.json(
      { message: 'Failed to mark customer as delivered' },
      { status: 500 }
    )
  }

  if (!customer) {
    return NextResponse.json({ message: 'Customer not found' }, { status: 404 })
  }

  // Create delivery log entry
  const { error: logError } = await supabase
    .from('delivery_logs')
    .insert({
      customer_id: id,
      action: 'delivered',
      notes,
    })

  if (logError) {
    console.error('Error creating delivery log:', logError)
    // Don't fail the request, just log the error
  }

  return NextResponse.json({
    message: 'Customer marked as Delivered',
    customer,
  })
}
