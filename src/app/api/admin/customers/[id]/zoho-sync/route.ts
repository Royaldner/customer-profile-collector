/**
 * Admin Zoho Sync Trigger Endpoint (EPIC-14)
 * Allows admin to manually trigger/retry sync for a customer
 */

import { NextRequest, NextResponse } from 'next/server'
import { triggerManualSync, resetSyncStatus, syncProfileToZoho } from '@/lib/services/zoho-sync'
import { isZohoConnected } from '@/lib/services/zoho-books'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Trigger manual sync
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    // Check if Zoho is connected
    const connected = await isZohoConnected()
    if (!connected) {
      return NextResponse.json(
        { error: 'Zoho Books not connected' },
        { status: 400 }
      )
    }

    // Get action from request body (optional)
    let action: 'create' | 'match' | 'update-profile' = 'match'
    try {
      const body = await request.json()
      if (body.action === 'create' || body.action === 'match' || body.action === 'update-profile') {
        action = body.action
      }
    } catch {
      // Body is optional, use default action
    }

    // Handle update-profile action separately
    if (action === 'update-profile') {
      const result = await syncProfileToZoho(id)
      if (result.success) {
        return NextResponse.json({
          message: 'Profile synced to Zoho successfully',
        })
      } else {
        return NextResponse.json(
          { error: result.error || 'Profile sync failed' },
          { status: 400 }
        )
      }
    }

    const result = await triggerManualSync(id, action)

    if (result.success) {
      return NextResponse.json({
        message: 'Sync completed successfully',
        status: 'synced',
      })
    } else {
      return NextResponse.json(
        {
          error: result.error || 'Sync failed',
          status: 'failed',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Reset sync status (allow retry)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    await resetSyncStatus(id)

    return NextResponse.json({
      message: 'Sync status reset successfully',
      status: 'pending',
    })
  } catch (error) {
    console.error('Reset sync status error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
