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
  const scopes = 'ZohoBooks.invoices.READ,ZohoBooks.contacts.READ'

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
  params?: Record<string, string>
): Promise<T> {
  const config = getZohoConfig()
  const accessToken = await getAccessToken()

  const url = new URL(`${ZOHO_API_URL}${endpoint}`)
  url.searchParams.set('organization_id', config.orgId)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

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
 */
export async function searchContacts(query: string): Promise<ZohoContact[]> {
  const cacheKey = `contacts:search:${query.toLowerCase()}`

  const { data } = await getCached(cacheKey, async () => {
    const response = await zohoRequest<ZohoContactsResponse>('/contacts', {
      search_text: query,
      contact_type: 'customer',
      per_page: '25',
    })
    return response.contacts || []
  })

  return data
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
 */
export async function getInvoices(
  contactId: string,
  filter: InvoiceFilter = 'recent',
  page: number = 1
): Promise<{ invoices: ZohoInvoice[]; hasMore: boolean; total: number; cachedAt: string | null }> {
  const statuses = INVOICE_FILTER_STATUSES[filter]
  const statusParam = statuses.join(',')
  const cacheKey = `invoices:${contactId}:${filter}:page${page}`

  const { data, cachedAt } = await getCached(cacheKey, async () => {
    const response = await zohoRequest<ZohoInvoicesResponse>('/invoices', {
      customer_id: contactId,
      status: statusParam,
      page: page.toString(),
      per_page: '10',
      sort_column: 'date',
      sort_order: 'D', // Descending
    })

    return {
      invoices: response.invoices || [],
      hasMore: response.page_context?.has_more_page || false,
      total: response.page_context?.total || 0,
    }
  })

  return { ...data, cachedAt }
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
 * Get a single invoice by ID
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
