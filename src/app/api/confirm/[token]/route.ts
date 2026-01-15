import { NextRequest, NextResponse } from 'next/server'
import { validateConfirmationToken } from '@/lib/services/resend'

// GET - Validate and use a confirmation token (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length !== 64) {
      return NextResponse.json(
        { message: 'Invalid token format' },
        { status: 400 }
      )
    }

    const result = await validateConfirmationToken(token)

    if (!result.valid) {
      return NextResponse.json(
        { message: result.error || 'Invalid token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Delivery details confirmed successfully',
      customer_id: result.customerId,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
