/**
 * Zoho Auth Route
 * GET - Check connection status
 * POST - Get authorization URL to initiate OAuth flow
 */

import { NextResponse } from 'next/server'
import {
  isZohoConfigured,
  isZohoConnected,
  getAuthorizationUrl,
} from '@/lib/services/zoho-books'

export const dynamic = 'force-dynamic'

/**
 * GET /api/zoho/auth
 * Check if Zoho is configured and connected
 */
export async function GET() {
  const configured = isZohoConfigured()

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: 'Zoho environment variables not set',
    })
  }

  const connected = await isZohoConnected()

  return NextResponse.json({
    configured: true,
    connected,
    message: connected ? 'Zoho Books connected' : 'Zoho Books not connected',
  })
}

/**
 * POST /api/zoho/auth
 * Get the authorization URL for admin to connect Zoho
 */
export async function POST() {
  if (!isZohoConfigured()) {
    return NextResponse.json(
      { error: 'Zoho environment variables not configured' },
      { status: 500 }
    )
  }

  const authUrl = getAuthorizationUrl()

  return NextResponse.json({ authUrl })
}
