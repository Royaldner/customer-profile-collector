/**
 * OAuth Callback Handler
 * Handles redirects from OAuth providers (Google) and email confirmation links
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/customer/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      // Prevent caching of auth callback
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      return response
    }
  }

  // Return to login page with error
  const errorResponse = NextResponse.redirect(`${origin}/customer/login?error=auth_callback_error`)
  errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return errorResponse
}
