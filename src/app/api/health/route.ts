/**
 * Health Check API Endpoint
 * Used by Vercel Cron to keep Supabase free tier active (prevents 7-day auto-pause)
 * Vercel sends Authorization: Bearer <CRON_SECRET> automatically with cron requests
 */

import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { status: 'error', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      customers: count,
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
