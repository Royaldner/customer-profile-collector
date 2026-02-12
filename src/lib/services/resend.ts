/**
 * Resend Email Service
 * Wrapper for sending emails with template variable substitution
 */

import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
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
const DEFAULT_FROM = 'Canada Goodies <hello@cangoodies.com>'

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
 * Generate HTML button
 */
function generateHtmlButton(url: string, text: string, color: string = '#dc2626'): string {
  return `<a href="${url}" style="display: inline-block; background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 8px 0;">${text}</a>`
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

  const dashboardUrl = `${appUrl}/customer/dashboard`

  const variables: Record<string, string> = {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    update_profile_link: generateHtmlButton(dashboardUrl, 'Update My Profile'),
  }

  if (confirmToken) {
    const confirmUrl = `${appUrl}/confirm/${confirmToken}`
    variables.confirm_button = generateHtmlButton(confirmUrl, 'Confirm My Details', '#16a34a')
  }

  return variables
}

/**
 * Get today's sent email count for rate limiting
 */
export async function getDailyEmailCount(): Promise<number> {
  const supabase = createAdminClient()

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
  const supabase = createAdminClient()
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
 * Convert body text to HTML email
 */
function bodyToHtml(body: string): string {
  // Convert line breaks to HTML and wrap in email template
  const htmlBody = body
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
    <p>${htmlBody}</p>
  </div>
  <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
    Canada Goodies Inc.
  </p>
</body>
</html>`
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
      replyTo: 'cangoodsph@gmail.com',
      to,
      subject,
      html: bodyToHtml(body),
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML for plain text fallback
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
  const supabase = createAdminClient()

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
  const supabase = createAdminClient()

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
  const supabase = createAdminClient()
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
