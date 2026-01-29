/**
 * Zoho Contacts Search Route
 * GET - Search Zoho Books contacts by name or email (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchContacts, isZohoConnected } from '@/lib/services/zoho-books'

export const dynamic = 'force-dynamic'

/**
 * GET /api/zoho/contacts?q=search_term
 * Search Zoho Books contacts (admin only)
 */
export async function GET(request: NextRequest) {
  // Check admin authentication
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession?.value) {
    return NextResponse.json(
      { error: 'Unauthorized - admin login required' },
      { status: 401 }
    )
  }

  // Check if Zoho is connected
  const connected = await isZohoConnected()
  if (!connected) {
    return NextResponse.json(
      { error: 'Zoho Books not connected' },
      { status: 400 }
    )
  }

  // Get search query
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    )
  }

  try {
    const contacts = await searchContacts(query)

    // Add cache-control headers to prevent browser caching
    return NextResponse.json(
      { contacts, query, timestamp: Date.now() },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    )
  } catch (err) {
    console.error('Failed to search Zoho contacts:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json(
      { error: `Failed to search contacts: ${message}` },
      { status: 500 }
    )
  }
}
