/**
 * Zoho Sync Cron Endpoint (EPIC-14)
 * Processes the sync queue hourly via Vercel Cron
 */

import { NextResponse } from 'next/server'
import { processSyncQueue } from '@/lib/services/zoho-sync'

// Vercel cron jobs send a specific header for authentication
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify cron secret if configured
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const results = await processSyncQueue()

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Zoho sync cron error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
