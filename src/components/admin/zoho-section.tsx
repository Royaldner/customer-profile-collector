'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZohoLinkDialog } from './zoho-link-dialog'
import { toast } from 'sonner'
import { Link as LinkIcon, Unlink, Loader2, ExternalLink } from 'lucide-react'

interface ZohoSectionProps {
  customerId: string
  customerName: string
  customerEmail: string
  zohoContactId: string | null
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
}: ZohoSectionProps) {
  const [zohoStatus, setZohoStatus] = useState<ZohoStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [zohoContactId, setZohoContactId] = useState(initialZohoContactId)

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
          {zohoContactId ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Zoho Contact ID
                </label>
                <p className="font-mono text-sm">{zohoContactId}</p>
              </div>
              <div className="flex gap-2">
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
