'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface SetDefaultAddressButtonProps {
  addressId: string
  isDefault: boolean
}

export function SetDefaultAddressButton({ addressId, isDefault }: SetDefaultAddressButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  if (isDefault) {
    return null
  }

  async function handleSetDefault() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to set default address')
      }

      toast.success('Default address updated')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set default address'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSetDefault}
      disabled={isLoading}
      className="h-7 text-xs"
    >
      <Star className="mr-1 h-3 w-3" />
      {isLoading ? 'Setting...' : 'Set as Default'}
    </Button>
  )
}
