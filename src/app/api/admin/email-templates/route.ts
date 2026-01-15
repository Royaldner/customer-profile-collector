import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { emailTemplateSchema } from '@/lib/validations/email'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Fetch all email templates (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('display_name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Email templates fetch error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch email templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new email template (admin only)
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
    const validationResult = emailTemplateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, display_name, subject, body: templateBody, variables, is_active } = validationResult.data
    const supabase = await createClient()

    // Insert new template
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        display_name,
        subject,
        body: templateBody,
        variables: JSON.stringify(variables),
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate name
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'A template with this name already exists' },
          { status: 409 }
        )
      }
      console.error('Email template insert error:', error)
      return NextResponse.json(
        { message: 'Failed to create email template' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email template created successfully', template },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
