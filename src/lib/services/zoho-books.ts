/**
 * Zoho Books API Service
 * Handles OAuth token management, API requests, and caching
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  ZohoTokens,
  ZohoOAuthResponse,
  ZohoContact,
  ZohoContactsResponse,
  ZohoInvoice,
  ZohoInvoicesResponse,
  InvoiceFilter,
} from '@/lib/types/zoho'
import { INVOICE_FILTER_STATUSES } from '@/lib/types/zoho'

// ============================================
// CONFIGURATION
// ============================================

const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2'
const ZOHO_API_URL = 'https://www.zohoapis.com/books/v3'

// Cache TTLs
const MEMORY_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const DB_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// In-memory cache
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>()

/**
 * Get Zoho configuration from environment
 */
function getZohoConfig() {
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const orgId = process.env.ZOHO_ORG_ID
  const redirectUri = process.env.ZOHO_REDIRECT_URI

  if (!clientId || !clientSecret || !orgId || !redirectUri) {
    throw new Error('Missing Zoho configuration. Check ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_ORG_ID, ZOHO_REDIRECT_URI')
  }

  return { clientId, clientSecret, orgId, redirectUri }
}

/**
 * Check if Zoho is configured
 */
export function isZohoConfigured(): boolean {
  try {
    getZohoConfig()
    return true
  } catch {
    return false
  }
}

// ============================================
// OAUTH TOKEN MANAGEMENT
// ============================================

/**
 * Get the authorization URL for initial OAuth flow
 */
export function getAuthorizationUrl(): string {
  const config = getZohoConfig()
  const scopes = 'ZohoBooks.invoices.READ,ZohoBooks.contacts.READ,ZohoBooks.contacts.CREATE'

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${ZOHO_AUTH_URL}/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<ZohoTokens> {
  const config = getZohoConfig()
  const supabase = createAdminClient()

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code,
  })

  const response = await fetch(`${ZOHO_AUTH_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }

  const data: ZohoOAuthResponse = await response.json()

  if (!data.refresh_token) {
    throw new Error('No refresh token received. User may need to re-authorize with prompt=consent')
  }

  // Calculate expiry time
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // Delete any existing tokens (we only keep one)
  await supabase.from('zoho_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Insert new tokens
  const { data: tokenData, error } = await supabase
    .from('zoho_tokens')
    .insert({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`)
  }

  return tokenData as ZohoTokens
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const config = getZohoConfig()
  const supabase = createAdminClient()

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch(`${ZOHO_AUTH_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data: ZohoOAuthResponse = await response.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // Update stored tokens
  await supabase
    .from('zoho_tokens')
    .update({
      access_token: data.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('refresh_token', refreshToken)

  return data.access_token
}

/**
 * Get a valid access token (refreshing if needed)
 */
export async function getAccessToken(): Promise<string> {
  const supabase = createAdminClient()

  // Get stored tokens
  const { data: tokens, error } = await supabase
    .from('zoho_tokens')
    .select('*')
    .limit(1)
    .single()

  if (error || !tokens) {
    throw new Error('No Zoho tokens found. Admin needs to authorize the connection.')
  }

  const tokenData = tokens as ZohoTokens

  // Check if token is expired or about to expire (5 min buffer)
  const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at).getTime() : 0
  const bufferMs = 5 * 60 * 1000
  const isExpired = Date.now() > expiresAt - bufferMs

  if (isExpired || !tokenData.access_token) {
    return await refreshAccessToken(tokenData.refresh_token)
  }

  return tokenData.access_token
}

/**
 * Check if Zoho is connected (has valid tokens)
 */
export async function isZohoConnected(): Promise<boolean> {
  try {
    await getAccessToken()
    return true
  } catch {
    return false
  }
}

// ============================================
// CACHING
// ============================================

/**
 * Get from memory cache
 */
function getFromMemoryCache<T>(key: string): T | null {
  const cached = memoryCache.get(key)
  if (!cached) return null
  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return cached.data as T
}

/**
 * Set in memory cache
 */
function setInMemoryCache(key: string, data: unknown): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })
}

/**
 * Get from database cache
 */
async function getFromDbCache<T>(key: string): Promise<{ data: T; cachedAt: string } | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('zoho_cache')
    .select('data, created_at, expires_at')
    .eq('cache_key', key)
    .single()

  if (error || !data) return null

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired entry
    await supabase.from('zoho_cache').delete().eq('cache_key', key)
    return null
  }

  return { data: data.data as T, cachedAt: data.created_at }
}

/**
 * Set in database cache
 */
async function setInDbCache(key: string, data: unknown): Promise<void> {
  const supabase = createAdminClient()
  const expiresAt = new Date(Date.now() + DB_CACHE_TTL_MS).toISOString()

  await supabase
    .from('zoho_cache')
    .upsert({
      cache_key: key,
      data,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
}

/**
 * Get cached data with multi-level caching
 */
async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ data: T; cachedAt: string | null }> {
  // Check memory cache
  const memoryCached = getFromMemoryCache<T>(key)
  if (memoryCached) {
    return { data: memoryCached, cachedAt: null }
  }

  // Check database cache
  const dbCached = await getFromDbCache<T>(key)
  if (dbCached) {
    setInMemoryCache(key, dbCached.data)
    return { data: dbCached.data, cachedAt: dbCached.cachedAt }
  }

  // Fetch fresh data
  const freshData = await fetcher()
  setInMemoryCache(key, freshData)
  await setInDbCache(key, freshData)

  return { data: freshData, cachedAt: new Date().toISOString() }
}

/**
 * Invalidate cache for a specific key pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const supabase = createAdminClient()

  // Clear memory cache entries matching pattern
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key)
    }
  }

  // Clear database cache entries matching pattern
  await supabase
    .from('zoho_cache')
    .delete()
    .like('cache_key', `%${pattern}%`)
}

// ============================================
// API CLIENT
// ============================================

/**
 * Make an authenticated request to Zoho Books API
 */
async function zohoRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    params?: Record<string, string>
    body?: Record<string, unknown>
  }
): Promise<T> {
  const config = getZohoConfig()
  const accessToken = await getAccessToken()
  const { method = 'GET', params, body } = options || {}

  const url = new URL(`${ZOHO_API_URL}${endpoint}`)
  url.searchParams.set('organization_id', config.orgId)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url.toString(), fetchOptions)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zoho API error: ${response.status} - ${error}`)
  }

  return response.json()
}

// ============================================
// CONTACTS
// ============================================

/**
 * Search contacts by name or email
 * Note: No caching for search to ensure real-time results
 */
export async function searchContacts(query: string): Promise<ZohoContact[]> {
  // No caching for search - admins need real-time results
  // Use contact_name_contains for more accurate name search
  const response = await zohoRequest<ZohoContactsResponse>('/contacts', {
    params: {
      contact_name_contains: query,
      contact_type: 'customer',
      per_page: '25',
    },
  })
  return response.contacts || []
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<ZohoContact | null> {
  const cacheKey = `contact:${contactId}`

  try {
    const { data } = await getCached(cacheKey, async () => {
      const response = await zohoRequest<{ contact: ZohoContact }>(`/contacts/${contactId}`)
      return response.contact
    })
    return data
  } catch {
    return null
  }
}

// ============================================
// INVOICES
// ============================================

/**
 * Get invoices for a contact with filtering
 * Note: Zoho API doesn't accept multiple statuses, so we fetch all and filter client-side
 */
export async function getInvoices(
  contactId: string,
  filter: InvoiceFilter = 'recent',
  page: number = 1
): Promise<{ invoices: ZohoInvoice[]; hasMore: boolean; total: number; cachedAt: string | null }> {
  const cacheKey = `invoices:${contactId}:page${page}`

  const { data, cachedAt } = await getCached(cacheKey, async () => {
    // Fetch all invoices for this contact (no status filter - Zoho API limitation)
    const response = await zohoRequest<ZohoInvoicesResponse>('/invoices', {
      params: {
        customer_id: contactId,
        page: page.toString(),
        per_page: '50', // Fetch more to allow client-side filtering
        sort_column: 'date',
        sort_order: 'D', // Descending
      },
    })

    return {
      invoices: response.invoices || [],
      hasMore: response.page_context?.has_more_page || false,
      total: response.page_context?.total || 0,
    }
  })

  // Filter client-side based on the requested filter (with defensive check)
  const statuses = INVOICE_FILTER_STATUSES[filter]
  const invoices = data.invoices || []
  const filteredInvoices = invoices.filter((inv) => statuses.includes(inv.status))

  return {
    invoices: filteredInvoices,
    hasMore: data.hasMore || false,
    total: filteredInvoices.length,
    cachedAt,
  }
}

/**
 * Get all invoices for a contact (both recent and completed)
 */
export async function getAllInvoices(
  contactId: string
): Promise<{ recent: ZohoInvoice[]; completed: ZohoInvoice[]; cachedAt: string | null }> {
  const [recentResult, completedResult] = await Promise.all([
    getInvoices(contactId, 'recent'),
    getInvoices(contactId, 'completed'),
  ])

  return {
    recent: recentResult.invoices,
    completed: completedResult.invoices,
    cachedAt: recentResult.cachedAt || completedResult.cachedAt,
  }
}

/**
 * Get a single invoice by ID (full details including line item descriptions)
 */
export async function getInvoice(invoiceId: string): Promise<ZohoInvoice | null> {
  const cacheKey = `invoice:${invoiceId}`

  try {
    const { data } = await getCached(cacheKey, async () => {
      const response = await zohoRequest<{ invoice: ZohoInvoice }>(`/invoices/${invoiceId}`)
      return response.invoice
    })
    return data
  } catch {
    return null
  }
}

/**
 * Get invoices with full details (including line item descriptions and units)
 * Fetches list first, then enriches each invoice with full details
 */
export async function getInvoicesWithDetails(
  contactId: string,
  filter: InvoiceFilter = 'recent',
  page: number = 1
): Promise<{ invoices: ZohoInvoice[]; hasMore: boolean; total: number; cachedAt: string | null }> {
  // First get the filtered list
  const listResult = await getInvoices(contactId, filter, page)

  if (listResult.invoices.length === 0) {
    return listResult
  }

  // Fetch full details for each invoice (in parallel)
  const detailedInvoices = await Promise.all(
    listResult.invoices.map(async (inv) => {
      const detailed = await getInvoice(inv.invoice_id)
      return detailed || inv // Fall back to list data if detail fetch fails
    })
  )

  return {
    invoices: detailedInvoices,
    hasMore: listResult.hasMore,
    total: listResult.total,
    cachedAt: listResult.cachedAt,
  }
}

// ============================================
// CONTACT SYNC (EPIC-14)
// ============================================

/**
 * Search contacts by email (exact match)
 * Used for finding returning customers
 */
export async function searchContactByEmail(email: string): Promise<ZohoContact[]> {
  // No caching for search - need real-time results for sync
  const response = await zohoRequest<ZohoContactsResponse>('/contacts', {
    params: {
      email: email,
      contact_type: 'customer',
      per_page: '10',
    },
  })
  return response.contacts || []
}

/**
 * Create a new contact in Zoho Books
 * Used for new customers during sync
 *
 * contact_type: 'customer' = people you sell to (receive invoices)
 *               'vendor' = people you buy from (receive bills)
 */
export async function createContact(input: {
  contact_name: string
  email?: string
  phone?: string
  // Profile address (optional)
  billing_address?: {
    address?: string    // Street + Barangay
    city?: string       // City/Municipality
    state?: string      // Province
    zip?: string        // Postal code
    country?: string    // Country (defaults to Philippines)
  }
}): Promise<ZohoContact> {
  const body: Record<string, unknown> = {
    contact_name: input.contact_name,
    email: input.email,
    phone: input.phone,
    contact_type: 'customer',
  }

  // Add billing address if provided
  if (input.billing_address) {
    body.billing_address = {
      ...input.billing_address,
      country: input.billing_address.country || 'Philippines',
    }
  }

  const response = await zohoRequest<{ contact: ZohoContact }>('/contacts', {
    method: 'POST',
    body,
  })
  return response.contact
}

/**
 * Update an existing contact in Zoho Books
 * Used by admin to sync customer profile data to Zoho
 */
export async function updateContact(
  contactId: string,
  input: {
    contact_name?: string
    email?: string
    phone?: string
    billing_address?: {
      address?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
  }
): Promise<ZohoContact> {
  const body: Record<string, unknown> = {}

  if (input.contact_name) body.contact_name = input.contact_name
  if (input.email) body.email = input.email
  if (input.phone) body.phone = input.phone

  if (input.billing_address) {
    body.billing_address = {
      ...input.billing_address,
      country: input.billing_address.country || 'Philippines',
    }
  }

  const response = await zohoRequest<{ contact: ZohoContact }>(`/contacts/${contactId}`, {
    method: 'PUT',
    body,
  })

  // Invalidate cache for this contact
  await invalidateCache(`contact:${contactId}`)

  return response.contact
}

/**
 * Match result from findMatchingContact
 */
export interface MatchResult {
  contact: ZohoContact | null
  matchType: 'email' | 'name' | 'none' | 'ambiguous'
  allMatches: ZohoContact[]
  error?: string
}

/**
 * Find matching contact for a returning customer
 * Searches by email first (exact), then by name (fuzzy)
 */
export async function findMatchingContact(
  email: string,
  name: string
): Promise<MatchResult> {
  try {
    // Step 1: Search by email (exact match - most reliable)
    const emailMatches = await searchContactByEmail(email)
    if (emailMatches.length === 1 && emailMatches[0]) {
      return {
        contact: emailMatches[0],
        matchType: 'email',
        allMatches: emailMatches,
      }
    }
    if (emailMatches.length > 1) {
      return {
        contact: null,
        matchType: 'ambiguous',
        allMatches: emailMatches,
      }
    }

    // Step 2: Search by name (fuzzy match - less reliable)
    const nameMatches = await searchContacts(name)
    if (nameMatches.length === 1 && nameMatches[0]) {
      return {
        contact: nameMatches[0],
        matchType: 'name',
        allMatches: nameMatches,
      }
    }
    if (nameMatches.length > 1) {
      return {
        contact: null,
        matchType: 'ambiguous',
        allMatches: nameMatches,
      }
    }

    // No matches found
    return {
      contact: null,
      matchType: 'none',
      allMatches: [],
    }
  } catch (error) {
    return {
      contact: null,
      matchType: 'none',
      allMatches: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
