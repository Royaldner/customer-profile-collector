import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { emailTemplateUpdateSchema } from '@/lib/validations/email'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Fetch single email template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Email template not found' },
          { status: 404 }
        )
      }
      console.error('Email template fetch error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch email template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update an email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validationResult = emailTemplateUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const updateData: Record<string, unknown> = {}

    // Only include fields that were provided
    if (validationResult.data.name !== undefined) updateData.name = validationResult.data.name
    if (validationResult.data.display_name !== undefined) updateData.display_name = validationResult.data.display_name
    if (validationResult.data.subject !== undefined) updateData.subject = validationResult.data.subject
    if (validationResult.data.body !== undefined) updateData.body = validationResult.data.body
    if (validationResult.data.variables !== undefined) updateData.variables = JSON.stringify(validationResult.data.variables)
    if (validationResult.data.is_active !== undefined) updateData.is_active = validationResult.data.is_active

    const { data: template, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Email template not found' },
          { status: 404 }
        )
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'A template with this name already exists' },
          { status: 409 }
        )
      }
      console.error('Email template update error:', error)
      return NextResponse.json(
        { message: 'Failed to update email template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Email template updated successfully', template })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft-delete an email template (set is_active to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    // Soft-delete by setting is_active to false
    const { data: template, error } = await supabase
      .from('email_templates')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Email template not found' },
          { status: 404 }
        )
      }
      console.error('Email template delete error:', error)
      return NextResponse.json(
        { message: 'Failed to delete email template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Email template deactivated successfully', template })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
