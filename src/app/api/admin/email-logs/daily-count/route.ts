import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDailyEmailCount, checkRateLimit } from '@/lib/services/resend'

// Helper to check admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return !!adminSession?.value
}

// GET - Get today's email count and rate limit status (admin only)
export async function GET() {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const count = await getDailyEmailCount()
    const rateLimit = await checkRateLimit(0)

    return NextResponse.json({
      today_count: count,
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
