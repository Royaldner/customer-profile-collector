/**
 * Customer Profile Collector - TypeScript Types
 * Database entity types for Supabase tables
 */

export type ContactPreference = 'email' | 'phone' | 'sms'

export type DeliveryMethod = 'pickup' | 'delivered' | 'cod' | 'cop'

export interface Courier {
  id: string
  code: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  contact_preference: ContactPreference
  user_id?: string
  delivery_method: DeliveryMethod
  courier?: string
  // Profile address (optional)
  profile_street_address?: string
  profile_barangay?: string
  profile_city?: string
  profile_province?: string
  profile_region?: string
  profile_postal_code?: string
  // Delivery confirmation
  delivery_confirmed_at?: string
  created_at: string
  updated_at: string
  addresses?: Address[]
}

export interface Address {
  id: string
  customer_id: string
  first_name: string
  last_name: string
  label: string
  street_address: string
  barangay: string
  city: string
  province: string
  region?: string
  postal_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// Input types for creating/updating entities (without auto-generated fields)
export interface CustomerInput {
  first_name: string
  last_name: string
  email: string
  phone: string
  contact_preference: ContactPreference
  delivery_method: DeliveryMethod
  courier?: string
  // Profile address (optional)
  profile_street_address?: string
  profile_barangay?: string
  profile_city?: string
  profile_province?: string
  profile_region?: string
  profile_postal_code?: string
}

// Input type for courier management
export interface CourierInput {
  code: string
  name: string
  is_active?: boolean
}

export interface AddressInput {
  customer_id?: string
  first_name: string
  last_name: string
  label: string
  street_address: string
  barangay: string
  city: string
  province: string
  region?: string
  postal_code: string
  is_default?: boolean
}

// Combined type for form submission (customer with addresses)
export interface CustomerWithAddressesInput {
  customer: CustomerInput
  addresses: AddressInput[]
}

// ============================================
// EMAIL NOTIFICATION TYPES
// ============================================

export type EmailStatus = 'pending' | 'scheduled' | 'sent' | 'failed'

export interface EmailTemplate {
  id: string
  name: string
  display_name: string
  subject: string
  body: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailTemplateInput {
  name: string
  display_name: string
  subject: string
  body: string
  variables?: string[]
  is_active?: boolean
}

export interface EmailLog {
  id: string
  template_id?: string
  customer_id?: string
  recipient_email: string
  recipient_name?: string
  subject: string
  body: string
  status: EmailStatus
  scheduled_for?: string
  sent_at?: string
  error_message?: string
  created_at: string
  // Joined fields
  template?: EmailTemplate
  customer?: Customer
}

export interface ConfirmationToken {
  id: string
  customer_id: string
  token: string
  expires_at: string
  used_at?: string
  created_at: string
}

export interface SendEmailInput {
  customer_ids: string[]
  template_id: string
  scheduled_for?: string
}
