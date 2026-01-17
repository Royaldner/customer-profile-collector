'use client'

/**
 * OAuth Callback Page (Client-Side)
 * Handles code exchange on the client where the PKCE code verifier is accessible
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')

      if (!code) {
        setStatus('No authentication code found')
        router.push('/customer/login?error=no_code')
        return
      }

      const supabase = createClient()

      try {
        // Exchange code for session (client-side has access to code verifier)
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Code exchange error:', error)
          setStatus('Authentication failed')
          router.push('/customer/login?error=auth_callback_error')
          return
        }

        // Get user to check if they have a customer profile
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setStatus('Could not get user')
          router.push('/customer/login?error=no_user')
          return
        }

        // Check if user has a customer profile
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (customer) {
          // User has a profile, go to dashboard
          setStatus('Redirecting to dashboard...')
          router.push('/customer/dashboard')
        } else {
          // User doesn't have a profile, go to register
          setStatus('Redirecting to registration...')
          router.push('/register')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('An error occurred')
        router.push('/customer/login?error=callback_exception')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
