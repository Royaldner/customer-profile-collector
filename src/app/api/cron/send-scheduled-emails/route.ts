import { NextRequest, NextResponse } from 'next/server'
import { processScheduledEmails } from '@/lib/services/resend'

// Vercel Cron job to process scheduled emails
// Runs hourly: "0 * * * *"
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security)
    const authHeader = request.headers.get('authorization')
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await processScheduledEmails()

    return NextResponse.json({
      message: 'Scheduled emails processed',
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
