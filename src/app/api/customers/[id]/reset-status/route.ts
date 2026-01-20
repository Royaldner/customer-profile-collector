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

  // Reset both delivery_confirmed_at and delivered_at to NULL
  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      delivery_confirmed_at: null,
      delivered_at: null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error resetting customer status:', error)
    return NextResponse.json(
      { message: 'Failed to reset customer status' },
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
      action: 'reset',
      notes,
    })

  if (logError) {
    console.error('Error creating delivery log:', logError)
    // Don't fail the request, just log the error
  }

  return NextResponse.json({
    message: 'Customer status reset to Pending',
    customer,
  })
}
