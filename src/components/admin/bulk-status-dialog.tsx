'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RotateCcw, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'

type ActionType = 'reset' | 'delivered'

interface BulkStatusDialogProps {
  selectedCount: number
  selectedIds: string[]
  onSuccess: () => void
}

export function BulkStatusDialog({
  selectedCount,
  selectedIds,
  onSuccess,
}: BulkStatusDialogProps) {
  const [openDialog, setOpenDialog] = useState<ActionType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: ActionType) => {
    setIsLoading(true)
    try {
      const endpoint =
        action === 'reset'
          ? '/api/admin/bulk-reset-status'
          : '/api/admin/bulk-mark-delivered'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: selectedIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Operation failed')
      }

      const result = await response.json()
      toast.success(result.message)
      setOpenDialog(null)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenDialog('reset')}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset to Pending
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenDialog('delivered')}
      >
        <PackageCheck className="mr-2 h-4 w-4" />
        Mark as Delivered
      </Button>

      {/* Reset to Pending Dialog */}
      <AlertDialog open={openDialog === 'reset'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {selectedCount} Customer{selectedCount !== 1 ? 's' : ''} to Pending?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the status of {selectedCount} selected customer{selectedCount !== 1 ? 's' : ''} from
              &quot;Ready to Ship&quot; back to &quot;Pending&quot;. They will need to confirm their delivery
              address again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('reset')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Reset to Pending'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Delivered Dialog */}
      <AlertDialog open={openDialog === 'delivered'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark {selectedCount} Customer{selectedCount !== 1 ? 's' : ''} as Delivered?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {selectedCount} selected customer{selectedCount !== 1 ? 's' : ''} as delivered and reset
              their status to &quot;Pending&quot; for the next order cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('delivered')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Mark as Delivered'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
