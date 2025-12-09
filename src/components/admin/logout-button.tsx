'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      toast.success('Logged out successfully')
      router.push('/admin/login')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading} size="sm">
      <LogOut className="h-4 w-4 sm:mr-2" />
      <span className="sr-only sm:not-sr-only">{isLoading ? 'Logging out...' : 'Logout'}</span>
    </Button>
  )
}
