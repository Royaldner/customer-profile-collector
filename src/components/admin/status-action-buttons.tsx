'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { RotateCcw, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'

interface StatusActionButtonsProps {
  customerId: string
  isReadyToShip: boolean
  isDelivered: boolean
}

export function StatusActionButtons({ customerId, isReadyToShip, isDelivered }: StatusActionButtonsProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false)

  const handleResetStatus = async () => {
    setIsResetting(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/reset-status`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reset status')
      }

      toast.success('Status reset to Pending')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset status')
    } finally {
      setIsResetting(false)
    }
  }

  const handleMarkDelivered = async () => {
    setIsMarkingDelivered(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/mark-delivered`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to mark as delivered')
      }

      toast.success('Customer marked as Delivered')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as delivered')
    } finally {
      setIsMarkingDelivered(false)
    }
  }

  // Show nothing when status is Pending
  if (!isReadyToShip && !isDelivered) {
    return null
  }

  return (
    <>
      {/* Reset to Pending - show for Ready to Ship or Delivered */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isResetting}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {isResetting ? 'Resetting...' : 'Reset to Pending'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Status to Pending?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the customer&apos;s status back to &quot;Pending&quot;.
              {isDelivered
                ? ' The customer will need to confirm their delivery address for the next order.'
                : ' The customer will need to confirm their delivery address again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetStatus} disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset to Pending'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Delivered - only show for Ready to Ship */}
      {isReadyToShip && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isMarkingDelivered}>
              <PackageCheck className="mr-2 h-4 w-4" />
              {isMarkingDelivered ? 'Processing...' : 'Mark as Delivered'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Delivered?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the order as &quot;Delivered&quot;. Use this after the customer
                has received their order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMarkDelivered} disabled={isMarkingDelivered}>
                {isMarkingDelivered ? 'Processing...' : 'Mark as Delivered'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
