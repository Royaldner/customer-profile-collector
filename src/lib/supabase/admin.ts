import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with admin privileges using the service_role key.
 *
 * SECURITY WARNING:
 * - Only use this on the server side (API routes)
 * - Never expose the service_role key to the client
 * - This client bypasses Row Level Security
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
