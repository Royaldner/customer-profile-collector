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

  const supabase = await createClient()

  // Reset delivery_confirmed_at to NULL
  const { data: customer, error } = await supabase
    .from('customers')
    .update({ delivery_confirmed_at: null })
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

  return NextResponse.json({
    message: 'Customer status reset to Pending',
    customer,
  })
}
