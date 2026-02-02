/**
 * Zoho Books Sync Service (EPIC-14)
 * Inline sync during registration + admin manual sync
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  createContact,
  findMatchingContact,
  isZohoConnected,
  updateContact,
} from './zoho-books'
import type { Customer, ZohoSyncStatus } from '@/lib/types'

/**
 * Sync a customer to Zoho Books inline (called during registration)
 * For new customers: creates a Zoho contact
 * For returning customers: finds a matching existing contact
 */
export async function syncCustomerToZoho(
  customerId: string,
  isReturning: boolean
): Promise<{ success: boolean; error?: string; status: ZohoSyncStatus }> {
  const supabase = createAdminClient()

  // Get customer data
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    return { success: false, error: 'Customer not found', status: 'failed' }
  }

  // Mark as syncing
  await supabase
    .from('customers')
    .update({ zoho_sync_status: 'syncing' })
    .eq('id', customerId)

  const customerName = `${customer.first_name} ${customer.last_name}`
  let result: { success: boolean; error?: string; status: ZohoSyncStatus }

  try {
    if (!isReturning) {
      // New customer — create Zoho contact
      await createContact({
        contact_name: customerName,
        email: customer.email,
        phone: customer.phone,
        billing_address: customer.profile_street_address
          ? {
              address: [
                customer.profile_street_address,
                customer.profile_barangay ? `Brgy. ${customer.profile_barangay}` : '',
              ]
                .filter(Boolean)
                .join(', '),
              city: customer.profile_city,
              state: customer.profile_province,
              zip: customer.profile_postal_code,
            }
          : undefined,
      })

      result = { success: true, status: 'synced' }
    } else {
      // Returning customer — find matching contact
      const matchResult = await findMatchingContact(customer.email, customerName)

      if (matchResult.error) {
        result = { success: false, error: matchResult.error, status: 'failed' }
      } else {
        switch (matchResult.matchType) {
          case 'email':
          case 'name':
            result = { success: true, status: 'synced' }
            break
          case 'ambiguous':
            result = {
              success: false,
              error: `Multiple matches found (${matchResult.allMatches.length}). Admin review required.`,
              status: 'skipped',
            }
            break
          case 'none':
            result = {
              success: false,
              error: 'No matching contact found in Zoho Books',
              status: 'failed',
            }
            break
        }
      }
    }
  } catch (error) {
    result = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    }
  }

  // Update customer record with sync result
  const customerUpdate: Partial<Customer> = {
    zoho_sync_status: result.status,
    zoho_sync_error: result.error ?? null,
    zoho_sync_attempts: (customer.zoho_sync_attempts || 0) + 1,
    zoho_last_sync_at: new Date().toISOString(),
  }

  // Link contact ID if sync succeeded
  if (result.success) {
    const match = await findMatchingContact(customer.email, customerName)
    if (match.contact) {
      customerUpdate.zoho_contact_id = match.contact.contact_id
    }
  }

  await supabase
    .from('customers')
    .update(customerUpdate)
    .eq('id', customerId)

  return result
}

/**
 * Manually trigger sync for a customer (admin action)
 */
export async function triggerManualSync(
  customerId: string,
  action: 'create' | 'match' = 'match'
): Promise<{ success: boolean; error?: string }> {
  const connected = await isZohoConnected()
  if (!connected) {
    return { success: false, error: 'Zoho Books not connected' }
  }

  return syncCustomerToZoho(customerId, action === 'match')
}

/**
 * Reset sync status for a customer (allow retry)
 */
export async function resetSyncStatus(customerId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('customers')
    .update({
      zoho_sync_status: 'pending',
      zoho_sync_error: null,
      zoho_sync_attempts: 0,
    })
    .eq('id', customerId)
}

/**
 * Sync customer profile data to their linked Zoho contact
 * Used by admin to update existing Zoho contacts with app profile data
 */
export async function syncProfileToZoho(
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const connected = await isZohoConnected()
  if (!connected) {
    return { success: false, error: 'Zoho Books not connected' }
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    return { success: false, error: 'Customer not found' }
  }

  if (!customer.zoho_contact_id) {
    return { success: false, error: 'Customer is not linked to a Zoho contact' }
  }

  try {
    const customerName = `${customer.first_name} ${customer.last_name}`

    const updatePayload: Parameters<typeof updateContact>[1] = {
      contact_name: customerName,
      email: customer.email,
      phone: customer.phone,
    }

    if (customer.profile_street_address) {
      updatePayload.billing_address = {
        address: [
          customer.profile_street_address,
          customer.profile_barangay ? `Brgy. ${customer.profile_barangay}` : '',
        ]
          .filter(Boolean)
          .join(', '),
        city: customer.profile_city,
        state: customer.profile_province,
        zip: customer.profile_postal_code,
      }
    }

    await updateContact(customer.zoho_contact_id, updatePayload)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update Zoho contact',
    }
  }
}
