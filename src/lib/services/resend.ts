/**
 * Resend Email Service
 * Wrapper for sending emails with template variable substitution
 */

import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { Customer, EmailTemplate } from '@/lib/types'

// Lazy initialization of Resend client
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Daily email limit for rate limiting
const DAILY_EMAIL_LIMIT = 100

// Confirmation token expiry (30 days)
const TOKEN_EXPIRY_DAYS = 30

// Default sender email
const DEFAULT_FROM = 'Canada Goodies <onboarding@resend.dev>'

/**
 * Generate a cryptographically secure confirmation token
 */
export function generateConfirmationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Substitute template variables with actual values
 */
export function substituteTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

/**
 * Build variable values for a customer
 */
export function buildTemplateVariables(
  customer: Customer,
  confirmToken?: string,
  baseUrl?: string
): Record<string, string> {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const variables: Record<string, string> = {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    update_profile_link: `${appUrl}/customer/dashboard`,
  }

  if (confirmToken) {
    variables.confirm_button = `${appUrl}/confirm/${confirmToken}`
  }

  return variables
}

/**
 * Get today's sent email count for rate limiting
 */
export async function getDailyEmailCount(): Promise<number> {
  const supabase = await createClient()

  // Get start of today in UTC
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
    .in('status', ['sent', 'pending'])

  if (error) {
    console.error('Error getting daily email count:', error)
    return 0
  }

  return count || 0
}

/**
 * Check if sending emails would exceed daily limit
 */
export async function checkRateLimit(emailCount: number): Promise<{
  allowed: boolean
  remaining: number
  limit: number
}> {
  const currentCount = await getDailyEmailCount()
  const remaining = Math.max(0, DAILY_EMAIL_LIMIT - currentCount)

  return {
    allowed: currentCount + emailCount <= DAILY_EMAIL_LIMIT,
    remaining,
    limit: DAILY_EMAIL_LIMIT,
  }
}

/**
 * Create a confirmation token for a customer
 */
export async function createConfirmationToken(customerId: string): Promise<string> {
  const supabase = await createClient()
  const token = generateConfirmationToken()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS)

  const { error } = await supabase
    .from('confirmation_tokens')
    .insert({
      customer_id: customerId,
      token,
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    console.error('Error creating confirmation token:', error)
    throw new Error('Failed to create confirmation token')
  }

  return token
}

/**
 * Send a single email
 */
export async function sendEmail(params: {
  to: string
  subject: string
  body: string
  from?: string
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const { to, subject, body, from = DEFAULT_FROM } = params

  // Check if API key is configured
  const client = getResendClient()
  if (!client) {
    console.warn('RESEND_API_KEY not configured, email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      text: body,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Process and send email to a customer using a template
 */
export async function sendTemplateEmail(params: {
  customer: Customer
  template: EmailTemplate
  scheduledFor?: Date
}): Promise<{
  success: boolean
  logId?: string
  error?: string
}> {
  const { customer, template, scheduledFor } = params
  const supabase = await createClient()

  // Generate confirmation token
  const confirmToken = await createConfirmationToken(customer.id)

  // Build and substitute variables
  const variables = buildTemplateVariables(customer, confirmToken)
  const subject = substituteTemplateVariables(template.subject, variables)
  const body = substituteTemplateVariables(template.body, variables)

  // Determine initial status
  const status = scheduledFor ? 'scheduled' : 'pending'

  // Create email log entry
  const { data: logData, error: logError } = await supabase
    .from('email_logs')
    .insert({
      template_id: template.id,
      customer_id: customer.id,
      recipient_email: customer.email,
      recipient_name: `${customer.first_name} ${customer.last_name}`,
      subject,
      body,
      status,
      scheduled_for: scheduledFor?.toISOString(),
    })
    .select('id')
    .single()

  if (logError) {
    console.error('Error creating email log:', logError)
    return { success: false, error: 'Failed to create email log' }
  }

  // If scheduled, don't send now
  if (scheduledFor) {
    return { success: true, logId: logData.id }
  }

  // Send immediately
  const sendResult = await sendEmail({
    to: customer.email,
    subject,
    body,
  })

  // Update log with result
  await supabase
    .from('email_logs')
    .update({
      status: sendResult.success ? 'sent' : 'failed',
      sent_at: sendResult.success ? new Date().toISOString() : null,
      error_message: sendResult.error || null,
    })
    .eq('id', logData.id)

  return {
    success: sendResult.success,
    logId: logData.id,
    error: sendResult.error,
  }
}

/**
 * Validate a confirmation token and mark as used
 */
export async function validateConfirmationToken(token: string): Promise<{
  valid: boolean
  customerId?: string
  error?: string
}> {
  const supabase = await createClient()

  // Find the token
  const { data: tokenData, error: tokenError } = await supabase
    .from('confirmation_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tokenError || !tokenData) {
    return { valid: false, error: 'Invalid token' }
  }

  // Check if already used
  if (tokenData.used_at) {
    return { valid: false, error: 'Token already used' }
  }

  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { valid: false, error: 'Token expired' }
  }

  // Mark token as used
  const { error: updateError } = await supabase
    .from('confirmation_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenData.id)

  if (updateError) {
    console.error('Error marking token as used:', updateError)
    return { valid: false, error: 'Failed to process token' }
  }

  // Update customer's delivery_confirmed_at
  await supabase
    .from('customers')
    .update({ delivery_confirmed_at: new Date().toISOString() })
    .eq('id', tokenData.customer_id)

  return { valid: true, customerId: tokenData.customer_id }
}

/**
 * Process scheduled emails that are due
 */
export async function processScheduledEmails(): Promise<{
  processed: number
  sent: number
  failed: number
}> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Get all scheduled emails that are due
  const { data: dueEmails, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)

  if (error) {
    console.error('Error fetching scheduled emails:', error)
    return { processed: 0, sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const emailLog of dueEmails || []) {
    const result = await sendEmail({
      to: emailLog.recipient_email,
      subject: emailLog.subject,
      body: emailLog.body,
    })

    await supabase
      .from('email_logs')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null,
      })
      .eq('id', emailLog.id)

    if (result.success) {
      sent++
    } else {
      failed++
    }
  }

  return {
    processed: dueEmails?.length || 0,
    sent,
    failed,
  }
}
