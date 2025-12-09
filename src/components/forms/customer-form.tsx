'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
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

  async function onSubmit(data: CustomerWithAddressesFormData) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit registration')
      }

      const result = await response.json()
      router.push(`/register/success?id=${result.customer.id}`)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
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

        <AddressForm />

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
