/**
 * Customer Profile Collector - Zod Validation Schemas
 * Form validation for customer registration
 */

import { z } from 'zod'

// Delivery method enum (includes cop - Cash on Pickup)
export const deliveryMethodSchema = z.enum(['pickup', 'delivered', 'cod', 'cop'], {
  message: 'Please select a delivery method',
})

// Couriers allowed per delivery method
export const COURIER_OPTIONS = {
  pickup: [], // No courier needed
  delivered: ['lbc', 'jrs'], // All couriers
  cod: ['lbc'], // LBC only
  cop: ['lbc'], // LBC only
} as const

export const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be 100 characters or less'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be 100 characters or less'),
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

// Profile address schema (all fields optional)
export const profileAddressSchema = z.object({
  profile_street_address: z.string().max(500, 'Street address must be 500 characters or less').optional(),
  profile_barangay: z.string().max(255, 'Barangay must be 255 characters or less').optional(),
  profile_city: z.string().max(255, 'City must be 255 characters or less').optional(),
  profile_province: z.string().max(255, 'Province must be 255 characters or less').optional(),
  profile_region: z.string().max(100, 'Region must be 100 characters or less').optional(),
  profile_postal_code: z.string().regex(/^\d{4}$/, 'Postal code must be exactly 4 digits').optional().or(z.literal('')),
})

export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be 100 characters or less'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be 100 characters or less'),
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(255, 'Email must be 255 characters or less'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone must be at least 10 digits')
    .max(50, 'Phone must be 50 characters or less'),
  contact_preference: z.enum(['email', 'phone', 'sms'], {
    message: 'Please select a contact preference',
  }),
  delivery_method: deliveryMethodSchema,
  courier: z.string().optional(),
  // Profile address fields (optional)
  ...profileAddressSchema.shape,
})

// Conditional address and courier validation based on delivery_method
export const customerWithAddressesSchema = z
  .object({
    customer: customerSchema,
    addresses: z.array(addressSchema),
  })
  .refine(
    (data) => {
      // Pickup orders: addresses optional (can be empty)
      if (data.customer.delivery_method === 'pickup') {
        return true
      }
      // Delivered/COD/COP: require 1-3 addresses with exactly one default
      if (data.addresses.length < 1 || data.addresses.length > 3) {
        return false
      }
      return data.addresses.filter((a) => a.is_default).length === 1
    },
    {
      message: 'Delivery orders require 1-3 addresses with exactly one default',
      path: ['addresses'],
    }
  )
  .refine(
    (data) => {
      // Pickup orders: courier not required
      if (data.customer.delivery_method === 'pickup') {
        return true
      }
      // Delivered/COD/COP: require courier selection
      return !!data.customer.courier && data.customer.courier.length > 0
    },
    {
      message: 'Please select a courier for delivery orders',
      path: ['customer', 'courier'],
    }
  )
  .refine(
    (data) => {
      // Validate courier is allowed for delivery method
      const method = data.customer.delivery_method
      const courier = data.customer.courier
      if (method === 'pickup' || !courier) {
        return true
      }
      const allowedCouriers: readonly string[] = COURIER_OPTIONS[method]
      return allowedCouriers.includes(courier)
    },
    {
      message: 'Selected courier is not available for this delivery method',
      path: ['customer', 'courier'],
    }
  )

// Type exports inferred from schemas
export type DeliveryMethodFormData = z.infer<typeof deliveryMethodSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
export type CustomerWithAddressesFormData = z.infer<typeof customerWithAddressesSchema>
export type ProfileAddressFormData = z.infer<typeof profileAddressSchema>
