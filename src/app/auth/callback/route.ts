/**
 * OAuth Callback Handler
 * Handles redirects from OAuth providers (Google) and email confirmation links
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If explicit next parameter provided, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Otherwise, check if user has a customer profile to decide where to redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (customer) {
          // User has a profile, go to dashboard
          return NextResponse.redirect(`${origin}/customer/dashboard`)
        } else {
          // User doesn't have a profile, go to register
          return NextResponse.redirect(`${origin}/register`)
        }
      }

      // Fallback to dashboard
      return NextResponse.redirect(`${origin}/customer/dashboard`)
    }
  }

  // Return to login page with error
  return NextResponse.redirect(`${origin}/customer/login?error=auth_callback_error`)
}
