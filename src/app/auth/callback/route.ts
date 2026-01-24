/**
 * OAuth Callback Handler
 * Handles redirects from OAuth providers (Google)
 *
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. Google authenticates user
 * 3. Supabase redirects here with a 'code' parameter
 * 4. We exchange the code for a session
 * 5. Redirect user to their destination
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/customer/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth errors (user cancelled, etc.)
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(
      `${origin}/customer/login?error=oauth_cancelled`
    )
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Success - redirect to destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Code exchange error:', error.message)
    return NextResponse.redirect(
      `${origin}/customer/login?error=oauth_failed`
    )
  }

  // No code provided - invalid request
  return NextResponse.redirect(`${origin}/customer/login`)
}
