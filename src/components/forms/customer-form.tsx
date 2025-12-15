'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AddressForm } from './address-form'
import {
  customerWithAddressesSchema,
  type CustomerWithAddressesFormData,
} from '@/lib/validations/customer'

const DEFAULT_VALUES: CustomerWithAddressesFormData = {
  customer: {
    name: '',
    email: '',
    phone: '',
    contact_preference: 'email',
    delivery_method: 'delivered',
  },
  addresses: [
    {
      label: '',
      street_address: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      postal_code: '',
      is_default: true,
    },
  ],
}

export function CustomerForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Auth state
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null)
  const [showAuthOptions, setShowAuthOptions] = useState(true)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailSignup, setIsEmailSignup] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const form = useForm<CustomerWithAddressesFormData>({
    resolver: zodResolver(customerWithAddressesSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  })

  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setAuthUser({ id: user.id, email: user.email })
        setShowAuthOptions(false)
        form.setValue('customer.email', user.email)
      }
    }
    checkAuth()
  }, [supabase.auth, form])

  // Watch delivery method to conditionally show address section
  const deliveryMethod = useWatch({
    control: form.control,
    name: 'customer.delivery_method',
  })

  const requiresAddress = deliveryMethod !== 'pickup'

  async function handleGoogleSignup() {
    setAuthError('')
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/register?auth=google`,
        },
      })

      if (error) throw error
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google signup failed')
      setIsGoogleLoading(false)
    }
  }

  async function handleEmailSignup() {
    setAuthError('')

    if (signupPassword !== confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }

    if (signupPassword.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return
    }

    setIsAuthLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/register`,
        },
      })

      if (error) throw error

      if (data.user) {
        // For email signups, the user needs to verify email first
        // But we can still proceed with registration if email confirmation is disabled
        if (data.session) {
          setAuthUser({ id: data.user.id, email: signupEmail })
          setShowAuthOptions(false)
          form.setValue('customer.email', signupEmail)
          toast.success('Account created! Continue with your registration.')
        } else {
          // Email confirmation required
          toast.info('Please check your email to confirm your account, then return to complete registration.')
          setAuthError('Please verify your email before continuing. Check your inbox.')
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsAuthLoading(false)
    }
  }

  function handleSkipAuth() {
    setShowAuthOptions(false)
  }

  async function onSubmit(data: CustomerWithAddressesFormData) {
    setIsSubmitting(true)
    setSubmitError(null)

    // Clear addresses for pickup orders
    const submitData = {
      ...data,
      addresses: data.customer.delivery_method === 'pickup' ? [] : data.addresses,
      user_id: authUser?.id || null,
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit registration')
      }

      const result = await response.json()
      toast.success('Registration submitted successfully!')

      // If user is authenticated, redirect to dashboard, otherwise to success page
      if (authUser) {
        router.push('/customer/dashboard')
      } else {
        router.push(`/register/success?id=${result.customer.id}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth options UI (shown first before form)
  if (showAuthOptions) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Sign up for an account to track your orders and manage your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                'Connecting...'
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Email Sign Up Form */}
            {!isEmailSignup ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsEmailSignup(true)}
              >
                Sign up with Email
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <PasswordInput
                    id="signup-password"
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleEmailSignup}
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            )}

            {authError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleSkipAuth}
            >
              Continue without an account
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/customer/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Show authenticated user info */}
        {authUser && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm text-muted-foreground">{authUser.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setAuthUser(null)
                  setShowAuthOptions(true)
                  form.setValue('customer.email', '')
                }}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Please provide your contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customer.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan@example.com"
                      readOnly={!!authUser}
                      className={authUser ? 'bg-muted' : ''}
                      {...field}
                    />
                  </FormControl>
                  {authUser && (
                    <p className="text-xs text-muted-foreground">
                      Email is linked to your account and cannot be changed
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="09171234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer.contact_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select contact preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Delivery Method Section */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Preference</CardTitle>
            <CardDescription>
              How would you like to receive your orders?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="customer.delivery_method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="pickup" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Pick-up</span>
                          <span className="text-muted-foreground ml-2">
                            - I&apos;ll collect my order in-store
                          </span>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="delivered" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Delivery</span>
                          <span className="text-muted-foreground ml-2">
                            - Deliver to my address
                          </span>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cod" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Cash on Delivery (COD)</span>
                          <span className="text-muted-foreground ml-2">
                            - Pay when delivered
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Address Section - Only show for delivery/COD */}
        {requiresAddress && <AddressForm />}

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link href="/customer/login" className="text-primary hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
