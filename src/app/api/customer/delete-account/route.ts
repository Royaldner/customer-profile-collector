import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE - Customer self-delete account
export async function DELETE() {
  try {
    const supabase = await createClient()

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Find customer by user_id
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Delete auth user via admin client
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()

      const { error: authDeleteError } =
        await adminClient.auth.admin.deleteUser(user.id)

      if (authDeleteError) {
        console.error('Auth user delete error:', authDeleteError)
        // Continue to delete customer anyway
      }
    } catch (adminError) {
      console.error('Admin client error:', adminError)
      // Continue to delete customer anyway
    }

    // Delete customer (addresses will cascade delete)
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id)

    if (deleteError) {
      console.error('Customer delete error:', deleteError)
      return NextResponse.json(
        { message: 'Failed to delete account' },
        { status: 500 }
      )
    }

    // Sign out the user (clear session)
    await supabase.auth.signOut()

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
