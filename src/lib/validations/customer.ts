/**
 * Customer Profile Collector - Zod Validation Schemas
 * Form validation for customer registration
 */

import { z } from 'zod'

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label must be 100 characters or less'),
  street_address: z.string().min(1, 'Street address is required').max(500, 'Street address must be 500 characters or less'),
  barangay: z.string().min(1, 'Barangay is required').max(255, 'Barangay must be 255 characters or less'),
  city: z.string().min(1, 'City/Municipality is required').max(255, 'City must be 255 characters or less'),
  province: z.string().min(1, 'Province is required').max(255, 'Province must be 255 characters or less'),
  region: z.string().max(100, 'Region must be 100 characters or less').optional(),
  postal_code: z
    .string()
    .min(1, 'Postal code is required')
    .regex(/^\d{4}$/, 'Postal code must be exactly 4 digits'),
  is_default: z.boolean(),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(255, 'Email must be 255 characters or less'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone must be at least 10 digits')
    .max(50, 'Phone must be 50 characters or less'),
  contact_preference: z.enum(['email', 'phone', 'sms'], {
    message: 'Please select a contact preference',
  }),
})

export const customerWithAddressesSchema = z.object({
  customer: customerSchema,
  addresses: z
    .array(addressSchema)
    .min(1, 'At least one address is required')
    .max(3, 'Maximum 3 addresses allowed')
    .refine(
      (addresses) => addresses.filter((a) => a.is_default).length === 1,
      'Exactly one address must be set as default'
    ),
})

// Type exports inferred from schemas
export type AddressFormData = z.infer<typeof addressSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
export type CustomerWithAddressesFormData = z.infer<typeof customerWithAddressesSchema>
