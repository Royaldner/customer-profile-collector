/**
 * Email Notification Validation Schemas
 * Zod schemas for email templates and sending
 */

import { z } from 'zod'

// Email template schema
export const emailTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase with hyphens only'),
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be 255 characters or less'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(500, 'Subject must be 500 characters or less'),
  body: z.string().min(1, 'Body is required'),
  variables: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

// Update template schema (all fields optional except what you're updating)
export const emailTemplateUpdateSchema = emailTemplateSchema.partial()

// Send email schema
export const sendEmailSchema = z.object({
  customer_ids: z
    .array(z.string().uuid('Invalid customer ID'))
    .min(1, 'At least one customer is required')
    .max(100, 'Cannot send to more than 100 customers at once'),
  template_id: z.string().uuid('Invalid template ID'),
  scheduled_for: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .refine(
      (date) => {
        if (!date) return true
        return new Date(date) > new Date()
      },
      { message: 'Scheduled date must be in the future' }
    ),
})

// Email log filter schema
export const emailLogFilterSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'sent', 'failed']).optional(),
  customer_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
})

// Type exports
export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>
export type EmailTemplateUpdateData = z.infer<typeof emailTemplateUpdateSchema>
export type SendEmailFormData = z.infer<typeof sendEmailSchema>
export type EmailLogFilterData = z.infer<typeof emailLogFilterSchema>
