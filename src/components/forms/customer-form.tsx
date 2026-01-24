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
import { Form } from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Stepper, type Step } from '@/components/ui/stepper'
import {
  PersonalInfoStep,
  DeliveryMethodStep,
  AddressStep,
  ReviewStep,
} from './steps'
import {
  customerWithAddressesSchema,
  type CustomerWithAddressesFormData,
} from '@/lib/validations/customer'

const DEFAULT_VALUES: CustomerWithAddressesFormData = {
  customer: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contact_preference: 'email',
    delivery_method: 'delivered',
  },
  addresses: [
    {
      first_name: '',
      last_name: '',
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

// Define steps
const STEPS: Step[] = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'delivery', title: 'Delivery' },
  { id: 'address', title: 'Address' },
  { id: 'review', title: 'Review' },
]

// Steps for pickup orders (no address step)
const PICKUP_STEPS: Step[] = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'delivery', title: 'Delivery' },
  { id: 'review', title: 'Review' },
]

export function CustomerForm() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
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
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

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

  // Watch delivery method to determine if address step is needed
  const deliveryMethod = useWatch({
    control: form.control,
    name: 'customer.delivery_method',
  })

  const isPickup = deliveryMethod === 'pickup'
  const steps = isPickup ? PICKUP_STEPS : STEPS
  const isLastStep = currentStep === steps.length - 1

  // Get current step ID
  const currentStepId = steps[currentStep]?.id

  async function handleGoogleSignup() {
    setAuthError('')
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/register`,
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupEmail)) {
      setAuthError('Please enter a valid email address')
      return
    }

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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/register`,
        },
      })

      if (error) throw error

      // Check if email confirmation is required (no session means confirmation needed)
      if (data.user && !data.session) {
        // Email confirmation is enabled - show confirmation pending UI
        setEmailConfirmationPending(true)
      } else if (data.user && data.session) {
        // Email confirmation is disabled - user is immediately confirmed
        setAuthUser({ id: data.user.id, email: signupEmail })
        setShowAuthOptions(false)
        form.setValue('customer.email', signupEmail)
        toast.success('Account created! Continue with your registration.')
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsAuthLoading(false)
    }
  }

  async function handleResendConfirmation() {
    setIsResending(true)
    setResendSuccess(false)
    setAuthError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/register`,
        },
      })

      if (error) throw error

      setResendSuccess(true)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to resend confirmation email')
    } finally {
      setIsResending(false)
    }
  }

  function handleSkipAuth() {
    setShowAuthOptions(false)
  }

  // Validate current step before proceeding
  async function validateCurrentStep(): Promise<boolean> {
    let fieldsToValidate: (keyof CustomerWithAddressesFormData | `customer.${string}` | `addresses.${number}.${string}`)[] = []

    switch (currentStepId) {
      case 'personal':
        fieldsToValidate = [
          'customer.first_name',
          'customer.last_name',
          'customer.email',
          'customer.phone',
          'customer.contact_preference',
        ]
        break
      case 'delivery':
        fieldsToValidate = ['customer.delivery_method']
        // Manually validate courier for non-pickup orders
        const method = form.getValues('customer.delivery_method')
        if (method !== 'pickup') {
          const courier = form.getValues('customer.courier')
          if (!courier) {
            form.setError('customer.courier', {
              type: 'manual',
              message: 'Please select a courier for delivery orders',
            })
            return false
          }
        }
        break
      case 'address':
        // Validate all address fields
        const addresses = form.getValues('addresses')
        addresses.forEach((_, index) => {
          fieldsToValidate.push(
            `addresses.${index}.first_name` as `addresses.${number}.${string}`,
            `addresses.${index}.last_name` as `addresses.${number}.${string}`,
            `addresses.${index}.label` as `addresses.${number}.${string}`,
            `addresses.${index}.street_address` as `addresses.${number}.${string}`,
            `addresses.${index}.barangay` as `addresses.${number}.${string}`,
            `addresses.${index}.city` as `addresses.${number}.${string}`,
            `addresses.${index}.province` as `addresses.${number}.${string}`,
            `addresses.${index}.postal_code` as `addresses.${number}.${string}`,
            `addresses.${index}.is_default` as `addresses.${number}.${string}`
          )
        })
        break
      case 'review':
        // Full form validation
        return form.trigger()
    }

    const result = await form.trigger(fieldsToValidate as Parameters<typeof form.trigger>[0])
    return result
  }

  async function handleNext() {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Handle delivery method change - reset step if changing from pickup to delivery
  useEffect(() => {
    // If on address step and switch to pickup, go back to delivery step
    if (isPickup && currentStepId === 'address') {
      setCurrentStep(steps.findIndex((s) => s.id === 'delivery'))
    }
  }, [isPickup, currentStepId, steps])

  // Handle form validation errors and show them to user
  function handleSubmitWithValidation(e: React.FormEvent) {
    e.preventDefault()

    // Clear any previous error
    setSubmitError(null)

    // Use handleSubmit which validates before calling onSubmit
    form.handleSubmit(onSubmit, (errors) => {
      // This callback runs when validation fails
      console.error('Form validation errors:', errors)

      // Build a user-friendly error message from validation errors
      const errorMessages: string[] = []

      // Check for root-level errors (from refine validations)
      if (errors.addresses?.root?.message) {
        errorMessages.push(errors.addresses.root.message)
      }
      if (errors.addresses?.message) {
        errorMessages.push(errors.addresses.message)
      }
      if (errors.customer?.courier?.message) {
        errorMessages.push(errors.customer.courier.message)
      }

      // Check for field-level errors
      if (errors.customer) {
        Object.entries(errors.customer).forEach(([field, error]) => {
          if (error && typeof error === 'object' && 'message' in error && field !== 'courier') {
            errorMessages.push(`${field}: ${error.message}`)
          }
        })
      }

      // Check for address field errors
      if (errors.addresses && Array.isArray(errors.addresses)) {
        errors.addresses.forEach((addressError, index) => {
          if (addressError) {
            Object.entries(addressError).forEach(([field, error]) => {
              if (error && typeof error === 'object' && 'message' in error) {
                errorMessages.push(`Address ${index + 1} ${field}: ${error.message}`)
              }
            })
          }
        })
      }

      const errorMessage = errorMessages.length > 0
        ? errorMessages.join('. ')
        : 'Please fix the form errors before submitting'

      setSubmitError(errorMessage)
      toast.error('Please fix the form errors before submitting')
    })(e)
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

  // Email confirmation pending UI
  if (emailConfirmationPending) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-primary">Confirmation Email Sent!</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation link to:
            </CardDescription>
            <p className="mt-2 font-medium text-foreground">{signupEmail}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Check your email inbox</li>
                <li>Click the confirmation link</li>
                <li>Return here to complete your registration</li>
              </ol>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Don&apos;t see the email?</strong> Check your spam or junk folder. The email is sent from Supabase.
              </p>
            </div>

            {resendSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900 dark:bg-green-950">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 dark:text-green-200">
                  Confirmation email resent successfully!
                </p>
              </div>
            )}

            {authError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendConfirmation}
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend Confirmation Email'}
            </Button>

            <Button
              variant="default"
              className="w-full"
              onClick={async () => {
                // Try to sign in with the credentials they entered
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: signupEmail,
                  password: signupPassword,
                })
                if (data?.user && !error) {
                  setAuthUser({ id: data.user.id, email: signupEmail })
                  setEmailConfirmationPending(false)
                  setShowAuthOptions(false)
                  form.setValue('customer.email', signupEmail)
                  toast.success('Email confirmed! Continue with your registration.')
                } else if (error?.message?.includes('Email not confirmed')) {
                  toast.error('Email not yet confirmed. Please check your inbox and click the confirmation link.')
                } else {
                  toast.error(error?.message || 'Unable to verify. Please try again.')
                }
              }}
            >
              I&apos;ve confirmed my email
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setEmailConfirmationPending(false)
                setSignupEmail('')
                setSignupPassword('')
                setConfirmPassword('')
                setIsEmailSignup(false)
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {/* Stepper */}
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          allowClickNavigation={true}
        />

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStepId === 'personal' && (
            <PersonalInfoStep isEmailReadOnly={!!authUser} />
          )}
          {currentStepId === 'delivery' && <DeliveryMethodStep />}
          {currentStepId === 'address' && <AddressStep />}
          {currentStepId === 'review' && <ReviewStep />}
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          {isLastStep ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>

        {/* Already registered link */}
        <div className="text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link href="/customer/login" className="text-primary hover:underline">
            Sign in to your account
          </Link>
        </div>
      </form>
    </Form>
  )
}
