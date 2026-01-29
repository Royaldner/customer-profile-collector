'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZohoLinkDialog } from './zoho-link-dialog'
import { OrdersDisplay } from '@/components/orders/orders-display'
import { toast } from 'sonner'
import { Link as LinkIcon, Unlink, Loader2, ExternalLink, RefreshCw, UserPlus, RotateCcw, AlertCircle, CheckCircle2, Clock, HelpCircle, Upload } from 'lucide-react'
import type { ZohoSyncStatus } from '@/lib/types'

interface ZohoSectionProps {
  customerId: string
  customerName: string
  customerEmail: string
  zohoContactId: string | null
  // EPIC-14: Sync status props
  zohoSyncStatus?: ZohoSyncStatus
  isReturningCustomer?: boolean
  zohoSyncError?: string | null
}

interface ZohoStatus {
  configured: boolean
  connected: boolean
}

export function ZohoSection({
  customerId,
  customerName,
  customerEmail,
  zohoContactId: initialZohoContactId,
  zohoSyncStatus,
  isReturningCustomer,
  zohoSyncError,
}: ZohoSectionProps) {
  const [zohoStatus, setZohoStatus] = useState<ZohoStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [zohoContactId, setZohoContactId] = useState(initialZohoContactId)
  const [syncStatus, setSyncStatus] = useState(zohoSyncStatus)
  const [syncError, setSyncError] = useState(zohoSyncError)

  // Check Zoho connection status
  useEffect(() => {
    const checkZohoStatus = async () => {
      try {
        const response = await fetch('/api/zoho/auth')
        const data = await response.json()
        setZohoStatus(data)
      } catch {
        setZohoStatus({ configured: false, connected: false })
      } finally {
        setIsLoading(false)
      }
    }

    checkZohoStatus()
  }, [])

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to unlink this customer from Zoho Books?')) {
      return
    }

    setIsUnlinking(true)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/zoho-link`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unlink customer')
      }

      toast.success('Customer unlinked from Zoho Books')
      setZohoContactId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlink customer')
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleLinkSuccess = () => {
    // Refresh the page to get the updated customer data
    window.location.reload()
  }

  const handleConnectZoho = async () => {
    try {
      const response = await fetch('/api/zoho/auth', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL')
      }

      // Redirect to Zoho authorization
      window.location.href = data.authUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect to Zoho')
    }
  }

  // EPIC-14: Handle sync retry
  const handleRetrySync = async () => {
    setIsSyncing(true)
    setSyncError(undefined)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/zoho-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isReturningCustomer ? 'match' : 'create' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      toast.success('Sync completed successfully')
      setSyncStatus('synced')
      // Refresh to get updated zoho_contact_id
      window.location.reload()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed'
      toast.error(errorMessage)
      setSyncError(errorMessage)
      setSyncStatus('failed')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle sync profile to Zoho (for linked customers)
  const handleSyncProfileToZoho = async () => {
    if (!confirm('This will update the Zoho contact with the customer profile data from this app. Continue?')) {
      return
    }

    setIsUpdatingProfile(true)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/zoho-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-profile' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync profile')
      }

      toast.success('Profile synced to Zoho successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sync profile to Zoho')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Helper to get sync status display info
  const getSyncStatusInfo = (status?: ZohoSyncStatus) => {
    switch (status) {
      case 'synced':
        return { icon: CheckCircle2, label: 'Synced', color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'pending':
        return { icon: Clock, label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
      case 'syncing':
        return { icon: Loader2, label: 'Syncing', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'failed':
        return { icon: AlertCircle, label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'skipped':
        return { icon: HelpCircle, label: 'Review', color: 'text-orange-600', bgColor: 'bg-orange-50' }
      case 'manual':
        return { icon: LinkIcon, label: 'Manual', color: 'text-gray-600', bgColor: 'bg-gray-50' }
      default:
        return { icon: Clock, label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zoho Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking Zoho connection...
          </div>
        </CardContent>
      </Card>
    )
  }

  // Zoho not configured
  if (!zohoStatus?.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zoho Books</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Zoho Books integration is not configured. Set the ZOHO_* environment variables to enable.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Zoho not connected
  if (!zohoStatus?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zoho Books</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Zoho Books is not connected. Connect to view and link customer orders.
          </p>
          <Button onClick={handleConnectZoho}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Zoho Books
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Zoho connected - show link status
  const statusInfo = getSyncStatusInfo(syncStatus)
  const StatusIcon = statusInfo.icon

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Zoho Books</span>
            {zohoContactId ? (
              <Badge variant="outline" className="border-green-600 text-green-600">
                Linked
              </Badge>
            ) : (
              <Badge variant="secondary">Not Linked</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* EPIC-14: Sync Status Section */}
          {syncStatus && (
            <div className={`rounded-lg p-3 ${statusInfo.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${statusInfo.color} ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    Sync Status: {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isReturningCustomer !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {isReturningCustomer ? (
                        <><RotateCcw className="mr-1 h-3 w-3" /> Returning</>
                      ) : (
                        <><UserPlus className="mr-1 h-3 w-3" /> New</>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
              {syncError && (
                <p className="mt-2 text-sm text-red-600">{syncError}</p>
              )}
              {(syncStatus === 'failed' || syncStatus === 'skipped') && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetrySync}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Retry Sync
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLinkDialogOpen(true)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link Manually
                  </Button>
                </div>
              )}
            </div>
          )}

          {zohoContactId ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Zoho Contact ID
                </label>
                <p className="font-mono text-sm">{zohoContactId}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncProfileToZoho}
                  disabled={isUpdatingProfile}
                  title="Update Zoho contact with profile data from this app"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Sync Profile to Zoho
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkDialogOpen(true)}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Change Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnlink}
                  disabled={isUnlinking}
                >
                  {isUnlinking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="mr-2 h-4 w-4" />
                  )}
                  Unlink
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Link this customer to a Zoho Books contact to view their orders and invoices.
              </p>
              <Button onClick={() => setLinkDialogOpen(true)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Link to Zoho Contact
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Orders Display - only show when linked */}
      {zohoContactId && (
        <OrdersDisplay
          customerId={customerId}
          zohoContactId={zohoContactId}
          apiBasePath="/api/admin/customers/[id]/orders"
        />
      )}

      <ZohoLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        customerId={customerId}
        customerName={customerName}
        customerEmail={customerEmail}
        onSuccess={handleLinkSuccess}
      />
    </>
  )
}
