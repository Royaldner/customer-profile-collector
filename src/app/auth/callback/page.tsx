'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next')

      console.log('[Auth Callback] Starting callback handler', { code: code?.substring(0, 10) + '...', next })

      if (!code) {
        console.log('[Auth Callback] No code provided')
        setStatus('error')
        setErrorMessage('No authorization code provided')
        setTimeout(() => router.push('/customer/login?error=no_code'), 2000)
        return
      }

      try {
        const supabase = createClient()

        console.log('[Auth Callback] Exchanging code for session...')
        // Exchange code for session - client-side has access to PKCE code_verifier
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('[Auth Callback] Code exchange error:', error)
          setStatus('error')
          setErrorMessage(error.message)
          setTimeout(() => router.push('/customer/login?error=auth_callback_error'), 2000)
          return
        }

        console.log('[Auth Callback] Code exchange successful, getting user...')

        // Check if user has a customer profile to decide where to redirect
        const { data: { user } } = await supabase.auth.getUser()
        console.log('[Auth Callback] User:', user?.id, user?.email)

        if (user) {
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .single()

          console.log('[Auth Callback] Customer lookup:', { customer, customerError })

          if (customer) {
            // User has a profile, go to dashboard or specified next URL
            console.log('[Auth Callback] Redirecting to:', next || '/customer/dashboard')
            router.push(next || '/customer/dashboard')
          } else {
            // User doesn't have a profile, go to register
            console.log('[Auth Callback] No customer profile, redirecting to /register')
            router.push('/register')
          }
        } else {
          console.log('[Auth Callback] No user found after auth')
          setStatus('error')
          setErrorMessage('No user found after authentication')
          setTimeout(() => router.push('/customer/login?error=no_user'), 2000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
        setTimeout(() => router.push('/customer/login?error=auth_callback_error'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">Authentication Error</div>
          {errorMessage && (
            <div className="text-sm text-muted-foreground max-w-md">{errorMessage}</div>
          )}
          <div className="text-sm text-muted-foreground">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <div className="text-lg font-medium">Completing sign in...</div>
        <div className="text-sm text-muted-foreground">Please wait while we verify your account</div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <div className="text-lg font-medium">Loading...</div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
