'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmationPage() {
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid confirmation link')
      return
    }

    const confirmDelivery = async () => {
      try {
        const response = await fetch(`/api/confirm/${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(data.message || 'Confirmation failed')
        }
      } catch {
        setStatus('error')
        setErrorMessage('An error occurred. Please try again later.')
      }
    }

    confirmDelivery()
  }, [token])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <CardTitle>Confirming...</CardTitle>
              <CardDescription>Please wait while we process your confirmation.</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Confirmed!</CardTitle>
              <CardDescription>
                Thank you for confirming your delivery details.
              </CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Confirmation Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <>
              <p className="text-muted-foreground">
                Your order is now marked as ready to ship. We&apos;ll process your delivery soon!
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Need to make changes to your profile?
                </p>
                <Button asChild variant="outline">
                  <Link href="/customer/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-muted-foreground">
                {errorMessage === 'Token already used'
                  ? 'You have already confirmed your delivery details.'
                  : errorMessage === 'Token expired'
                    ? 'This confirmation link has expired. Please contact us for assistance.'
                    : 'Please check your email for a valid confirmation link.'}
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline">
                  <Link href="/customer/dashboard">Go to Dashboard</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  If you need help, please contact support.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
