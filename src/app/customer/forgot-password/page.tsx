'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/customer/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Click the link in the email to reset your password.</p>
            <p className="mt-2">If you don&apos;t see it, check your spam folder.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/customer/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/customer/login" className="text-sm text-muted-foreground hover:text-primary">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
