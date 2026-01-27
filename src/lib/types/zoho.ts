/**
 * Zoho Books Integration - TypeScript Types
 * Types for Zoho Books API entities and local database tables
 */

// ============================================
// ZOHO OAUTH TYPES
// ============================================

export interface ZohoTokens {
  id: string
  access_token: string | null
  refresh_token: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface ZohoTokensInput {
  access_token?: string
  refresh_token: string
  expires_at?: string
}

export interface ZohoOAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  api_domain?: string
}

// ============================================
// ZOHO CACHE TYPES
// ============================================

export interface ZohoCache {
  id: string
  cache_key: string
  data: unknown
  expires_at: string
  created_at: string
}

export interface ZohoCacheInput {
  cache_key: string
  data: unknown
  expires_at: string
}

// ============================================
// ZOHO CONTACTS TYPES
// ============================================

export interface ZohoContact {
  contact_id: string
  contact_name: string
  company_name?: string
  email?: string
  phone?: string
  contact_type: 'customer' | 'vendor'
  status: 'active' | 'inactive'
  created_time: string
  last_modified_time: string
}

export interface ZohoContactsResponse {
  contacts: ZohoContact[]
  page_context: {
    page: number
    per_page: number
    has_more_page: boolean
    total: number
  }
}

// ============================================
// ZOHO INVOICE TYPES
// ============================================

export type ZohoInvoiceStatus =
  | 'draft'
  | 'sent'
  | 'overdue'
  | 'partially_paid'
  | 'paid'
  | 'void'

export interface ZohoInvoiceLineItem {
  line_item_id: string
  item_id?: string
  name: string
  description?: string
  quantity: number
  rate: number
  item_total: number
  unit?: string
}

export interface ZohoInvoice {
  invoice_id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  status: ZohoInvoiceStatus
  date: string
  due_date: string
  currency_code: string
  currency_symbol: string
  total: number
  balance: number
  payment_made: number
  line_items: ZohoInvoiceLineItem[]
  created_time: string
  last_modified_time: string
}

export interface ZohoInvoicesResponse {
  invoices: ZohoInvoice[]
  page_context: {
    page: number
    per_page: number
    has_more_page: boolean
    total: number
  }
}

// ============================================
// ZOHO SYNC TYPES (EPIC-14)
// ============================================

export type ZohoSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'skipped' | 'manual'

export interface ZohoSyncQueue {
  id: string
  customer_id: string
  action: 'create' | 'match' | 'retry'
  priority: number
  attempts: number
  max_attempts: number
  last_error?: string
  scheduled_for: string
  created_at: string
  processed_at?: string
}

export interface ZohoSyncQueueInput {
  customer_id: string
  action: 'create' | 'match' | 'retry'
  priority?: number
  scheduled_for?: string
}

// ============================================
// APP-SPECIFIC TYPES
// ============================================

// Invoice filter for Recent/Completed tabs
export type InvoiceFilter = 'recent' | 'completed'

// Mapped invoice statuses for each filter
export const INVOICE_FILTER_STATUSES: Record<InvoiceFilter, ZohoInvoiceStatus[]> = {
  recent: ['sent', 'overdue', 'partially_paid'],
  completed: ['paid', 'void'],
}

// Order display format (transformed from Zoho invoice)
export interface OrderDisplay {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  status: ZohoInvoiceStatus
  statusLabel: string
  items: {
    name: string
    description?: string
    quantity: number
    unit?: string
    rate: number
    total: number
  }[]
  total: number
  paid: number
  balance: number
  currencySymbol: string
}

// Transform Zoho invoice to display format
export function transformInvoiceToOrder(invoice: ZohoInvoice): OrderDisplay {
  // Defensive check for line_items (Zoho may omit in list responses)
  const lineItems = invoice.line_items || []

  return {
    id: invoice.invoice_id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    dueDate: invoice.due_date,
    status: invoice.status,
    statusLabel: getStatusLabel(invoice.status),
    items: lineItems.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      total: item.item_total,
    })),
    total: invoice.total,
    paid: invoice.payment_made,
    balance: invoice.balance,
    currencySymbol: invoice.currency_symbol || '₱',
  }
}

// Human-readable status labels
export function getStatusLabel(status: ZohoInvoiceStatus): string {
  const labels: Record<ZohoInvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Unpaid',
    overdue: 'Overdue',
    partially_paid: 'Partially Paid',
    paid: 'Paid',
    void: 'Cancelled',
  }
  return labels[status] || status
}

// Status badge colors
export function getStatusColor(status: ZohoInvoiceStatus): string {
  const colors: Record<ZohoInvoiceStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    partially_paid: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
    void: 'bg-gray-100 text-gray-500',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
