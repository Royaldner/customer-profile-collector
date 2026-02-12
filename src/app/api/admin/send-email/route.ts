import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmailSchema } from '@/lib/validations/email'
import { checkRateLimit, sendTemplateEmail } from '@/lib/services/resend'
import type { Customer, EmailTemplate } from '@/lib/types'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// POST - Send emails to one or more customers
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validationResult = sendEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { customer_ids, template_id, scheduled_for } = validationResult.data
    const supabase = createAdminClient()

    // Check rate limit
    const rateLimit = await checkRateLimit(customer_ids.length)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: `Rate limit exceeded. You can send ${rateLimit.remaining} more emails today (limit: ${rateLimit.limit})`,
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
        },
        { status: 429 }
      )
    }

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', template_id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { message: 'Email template not found or inactive' },
        { status: 404 }
      )
    }

    // Fetch all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .in('id', customer_ids)

    if (customersError) {
      console.error('Customers fetch error:', customersError)
      return NextResponse.json(
        { message: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { message: 'No valid customers found' },
        { status: 404 }
      )
    }

    // Send emails to each customer
    const results = {
      total: customers.length,
      success: 0,
      failed: 0,
      scheduled: 0,
      errors: [] as string[],
    }

    const scheduledDate = scheduled_for ? new Date(scheduled_for) : undefined

    for (const customer of customers as Customer[]) {
      const result = await sendTemplateEmail({
        customer,
        template: template as EmailTemplate,
        scheduledFor: scheduledDate,
      })

      if (result.success) {
        if (scheduledDate) {
          results.scheduled++
        } else {
          results.success++
        }
      } else {
        results.failed++
        results.errors.push(`${customer.email}: ${result.error}`)
      }
    }

    // Return summary
    const statusMessage = scheduledDate
      ? `${results.scheduled} email(s) scheduled for ${scheduledDate.toISOString()}`
      : `${results.success} email(s) sent successfully, ${results.failed} failed`

    return NextResponse.json({
      message: statusMessage,
      results,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
