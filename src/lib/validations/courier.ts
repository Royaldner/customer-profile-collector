/**
 * Courier validation schemas
 * For admin CRUD operations on couriers
 */

import { z } from 'zod'

// Schema for creating/updating a courier
export const courierSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be 50 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Code must be lowercase letters, numbers, and underscores only'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  is_active: z.boolean(),
})

// Schema for updating a courier (code is readonly)
export const courierUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  is_active: z.boolean(),
})

// Type exports
export type CourierFormData = z.infer<typeof courierSchema>
export type CourierUpdateFormData = z.infer<typeof courierUpdateSchema>
