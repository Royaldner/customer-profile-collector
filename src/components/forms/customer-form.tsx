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
