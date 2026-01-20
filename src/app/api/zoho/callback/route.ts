/**
 * Zoho OAuth Callback Route
 * Handles the redirect from Zoho after admin authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, isZohoConfigured } from '@/lib/services/zoho-books'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check if Zoho is configured
  if (!isZohoConfigured()) {
    return NextResponse.redirect(
      new URL('/admin?error=zoho_not_configured', request.url)
    )
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle Zoho errors
  if (error) {
    console.error('Zoho OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/admin?error=zoho_auth_error&message=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Validate authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/admin?error=zoho_missing_code', request.url)
    )
  }

  try {
    // Exchange code for tokens
    await exchangeCodeForTokens(code)

    // Redirect to admin with success message
    return NextResponse.redirect(
      new URL('/admin?zoho=connected', request.url)
    )
  } catch (err) {
    console.error('Failed to exchange Zoho code for tokens:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.redirect(
      new URL(`/admin?error=zoho_token_error&message=${encodeURIComponent(message)}`, request.url)
    )
  }
}
