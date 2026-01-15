import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { emailLogFilterSchema } from '@/lib/validations/email'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Fetch email logs with filtering and pagination (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse and validate filter parameters
    const filterData = {
      status: searchParams.get('status') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      template_id: searchParams.get('template_id') || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      page: searchParams.get('page') || '1',
      per_page: searchParams.get('per_page') || '20',
    }

    const validationResult = emailLogFilterSchema.safeParse(filterData)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid filter parameters',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { status, customer_id, template_id, from_date, to_date, page, per_page } = validationResult.data
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('email_logs')
      .select(`
        *,
        template:email_templates(id, name, display_name),
        customer:customers(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (customer_id) {
      query = query.eq('customer_id', customer_id)
    }
    if (template_id) {
      query = query.eq('template_id', template_id)
    }
    if (from_date) {
      query = query.gte('created_at', from_date)
    }
    if (to_date) {
      query = query.lte('created_at', to_date)
    }

    // Apply pagination
    const offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

    const { data: logs, count, error } = await query

    if (error) {
      console.error('Email logs fetch error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch email logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
