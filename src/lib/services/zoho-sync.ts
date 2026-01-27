/**
 * Zoho Books Sync Service (EPIC-14)
 * Background processing for customer-to-Zoho-contact sync
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  createContact,
  findMatchingContact,
  isZohoConnected,
  updateContact,
} from './zoho-books'
import type { Customer, ZohoSyncStatus } from '@/lib/types'
import type { ZohoSyncQueue } from '@/lib/types/zoho'

// Maximum items to process per cron run
const MAX_ITEMS_PER_RUN = 10

// Exponential backoff delays (in minutes)
const RETRY_DELAYS = [5, 15, 60] // 5min, 15min, 1hr

/**
 * Queue a customer for Zoho sync
 */
export async function queueCustomerSync(
  customerId: string,
  isReturning: boolean
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('zoho_sync_queue').insert({
    customer_id: customerId,
    action: isReturning ? 'match' : 'create',
    priority: 0,
  })

  // Mark customer as pending sync
  await supabase
    .from('customers')
    .update({ zoho_sync_status: 'pending' })
    .eq('id', customerId)
}

/**
 * Queue a retry for a failed sync
 */
export async function queueRetrySync(
  customerId: string,
  attemptNumber: number
): Promise<void> {
  const supabase = createAdminClient()

  // Calculate delay based on attempt number
  const delayMinutes = RETRY_DELAYS[Math.min(attemptNumber, RETRY_DELAYS.length - 1)] || 60
  const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()

  await supabase.from('zoho_sync_queue').insert({
    customer_id: customerId,
    action: 'retry',
    priority: -1, // Lower priority for retries
    scheduled_for: scheduledFor,
  })
}

/**
 * Process a single sync queue item
 */
async function processSyncItem(
  item: ZohoSyncQueue,
  customer: Customer
): Promise<{ success: boolean; error?: string; status: ZohoSyncStatus }> {
  const customerName = `${customer.first_name} ${customer.last_name}`

  try {
    if (item.action === 'create') {
      // New customer - create Zoho contact with profile address
      const contact = await createContact({
        contact_name: customerName,
        email: customer.email,
        phone: customer.phone,
        // Include profile address if available
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

      return {
        success: true,
        status: 'synced',
      }
    } else {
      // Returning customer or retry - find matching contact
      const result = await findMatchingContact(customer.email, customerName)

      if (result.error) {
        return {
          success: false,
          error: result.error,
          status: 'failed',
        }
      }

      switch (result.matchType) {
        case 'email':
        case 'name':
          // Single match found - link it
          return {
            success: true,
            status: 'synced',
          }

        case 'ambiguous':
          // Multiple matches - needs manual review
          return {
            success: false,
            error: `Multiple matches found (${result.allMatches.length}). Admin review required.`,
            status: 'skipped',
          }

        case 'none':
          // No match found for returning customer
          return {
            success: false,
            error: 'No matching contact found in Zoho Books',
            status: 'failed',
          }
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    }
  }
}

/**
 * Process pending items in the sync queue
 * Called by cron job
 */
export async function processSyncQueue(): Promise<{
  processed: number
  succeeded: number
  failed: number
  skipped: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  }

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    results.errors.push('Zoho Books not connected')
    return results
  }

  // Get pending queue items (ordered by priority desc, then scheduled_for asc)
  const { data: queueItems, error: queueError } = await supabase
    .from('zoho_sync_queue')
    .select('*')
    .is('processed_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true })
    .limit(MAX_ITEMS_PER_RUN)

  if (queueError) {
    results.errors.push(`Failed to fetch queue: ${queueError.message}`)
    return results
  }

  if (!queueItems || queueItems.length === 0) {
    return results
  }

  // Process each item
  for (const item of queueItems as ZohoSyncQueue[]) {
    results.processed++

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', item.customer_id)
      .single()

    if (customerError || !customer) {
      results.failed++
      results.errors.push(`Customer ${item.customer_id} not found`)

      // Mark queue item as processed (failed)
      await supabase
        .from('zoho_sync_queue')
        .update({
          processed_at: new Date().toISOString(),
          last_error: 'Customer not found',
          attempts: item.attempts + 1,
        })
        .eq('id', item.id)

      continue
    }

    // Update customer status to syncing
    await supabase
      .from('customers')
      .update({ zoho_sync_status: 'syncing' })
      .eq('id', item.customer_id)

    // Process the sync
    const result = await processSyncItem(item, customer as Customer)

    // Update customer with result
    const customerUpdate: Partial<Customer> = {
      zoho_sync_status: result.status,
      zoho_sync_error: result.error,
      zoho_sync_attempts: (customer.zoho_sync_attempts || 0) + 1,
      zoho_last_sync_at: new Date().toISOString(),
    }

    // If successful and we found a contact, link it
    if (result.success && item.action !== 'create') {
      const matchResult = await findMatchingContact(
        customer.email,
        `${customer.first_name} ${customer.last_name}`
      )
      if (matchResult.contact) {
        customerUpdate.zoho_contact_id = matchResult.contact.contact_id
      }
    }

    // For create action, we need to get the created contact ID
    if (result.success && item.action === 'create') {
      // The contact was just created - search for it by email
      const matchResult = await findMatchingContact(
        customer.email,
        `${customer.first_name} ${customer.last_name}`
      )
      if (matchResult.contact) {
        customerUpdate.zoho_contact_id = matchResult.contact.contact_id
      }
    }

    await supabase
      .from('customers')
      .update(customerUpdate)
      .eq('id', item.customer_id)

    // Mark queue item as processed
    await supabase
      .from('zoho_sync_queue')
      .update({
        processed_at: new Date().toISOString(),
        last_error: result.error,
        attempts: item.attempts + 1,
      })
      .eq('id', item.id)

    // Track results
    if (result.success) {
      results.succeeded++
    } else if (result.status === 'skipped') {
      results.skipped++
    } else {
      results.failed++

      // Queue retry if under max attempts
      if (item.attempts + 1 < item.max_attempts) {
        await queueRetrySync(item.customer_id, item.attempts + 1)
      }
    }
  }

  return results
}

/**
 * Manually trigger sync for a customer (admin action)
 */
export async function triggerManualSync(
  customerId: string,
  action: 'create' | 'match' = 'match'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    return { success: false, error: 'Zoho Books not connected' }
  }

  // Get customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    return { success: false, error: 'Customer not found' }
  }

  // Create a queue item and process immediately
  const queueItem: ZohoSyncQueue = {
    id: 'manual',
    customer_id: customerId,
    action,
    priority: 10,
    attempts: 0,
    max_attempts: 1,
    scheduled_for: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  // Update status to syncing
  await supabase
    .from('customers')
    .update({ zoho_sync_status: 'syncing' })
    .eq('id', customerId)

  const result = await processSyncItem(queueItem, customer as Customer)

  // Update customer with result
  const customerUpdate: Partial<Customer> = {
    zoho_sync_status: result.status,
    zoho_sync_error: result.error,
    zoho_sync_attempts: (customer.zoho_sync_attempts || 0) + 1,
    zoho_last_sync_at: new Date().toISOString(),
  }

  // Link contact if found
  if (result.success) {
    const matchResult = await findMatchingContact(
      customer.email,
      `${customer.first_name} ${customer.last_name}`
    )
    if (matchResult.contact) {
      customerUpdate.zoho_contact_id = matchResult.contact.contact_id
    }
  }

  await supabase
    .from('customers')
    .update(customerUpdate)
    .eq('id', customerId)

  return {
    success: result.success,
    error: result.error,
  }
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

  // Queue a new sync attempt
  const { data: customer } = await supabase
    .from('customers')
    .select('is_returning_customer')
    .eq('id', customerId)
    .single()

  await queueCustomerSync(customerId, customer?.is_returning_customer ?? false)
}

/**
 * Sync customer profile data to their linked Zoho contact
 * Used by admin to update existing Zoho contacts with app profile data
 */
export async function syncProfileToZoho(
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    return { success: false, error: 'Zoho Books not connected' }
  }

  // Get customer with their linked Zoho contact
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
    // Build update payload from customer profile
    const customerName = `${customer.first_name} ${customer.last_name}`

    const updatePayload: Parameters<typeof updateContact>[1] = {
      contact_name: customerName,
      email: customer.email,
      phone: customer.phone,
    }

    // Include profile address if available
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

    // Update the Zoho contact
    await updateContact(customer.zoho_contact_id, updatePayload)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update Zoho contact',
    }
  }
}
