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

  let body: { customerIds?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { customerIds } = body

  if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
    return NextResponse.json(
      { message: 'customerIds array is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Bulk reset delivery_confirmed_at to NULL
  const { data, error } = await supabase
    .from('customers')
    .update({ delivery_confirmed_at: null })
    .in('id', customerIds)
    .select('id')

  if (error) {
    console.error('Error bulk resetting customer status:', error)
    return NextResponse.json(
      { message: 'Failed to reset customer status' },
      { status: 500 }
    )
  }

  const updatedCount = data?.length || 0

  return NextResponse.json({
    message: `${updatedCount} customer${updatedCount !== 1 ? 's' : ''} reset to Pending`,
    updatedCount,
  })
}
