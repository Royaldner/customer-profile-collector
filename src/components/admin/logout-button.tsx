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
    <Button variant="outline" onClick={handleLogout} disabled={isLoading} size="sm" className="sm:size-default">
      <LogOut className="mr-2 h-4 w-4" />
      <span className="hidden sm:inline">{isLoading ? 'Logging out...' : 'Logout'}</span>
      <span className="sm:hidden">{isLoading ? '...' : ''}</span>
    </Button>
  )
}
