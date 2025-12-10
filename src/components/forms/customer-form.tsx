'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CustomerWithAddressesFormData>({
    resolver: zodResolver(customerWithAddressesSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  })

  // Watch delivery method to conditionally show address section
  const deliveryMethod = useWatch({
    control: form.control,
    name: 'customer.delivery_method',
  })

  const requiresAddress = deliveryMethod !== 'pickup'

  async function onSubmit(data: CustomerWithAddressesFormData) {
    setIsSubmitting(true)
    setSubmitError(null)

    // Clear addresses for pickup orders
    const submitData = {
      ...data,
      addresses: data.customer.delivery_method === 'pickup' ? [] : data.addresses,
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
      router.push(`/register/success?id=${result.customer.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      {...field}
                    />
                  </FormControl>
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
