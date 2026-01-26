'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface DashboardHeaderProps {
  greeting: string
  customerName: string
  onMenuClick: () => void
}

export function DashboardHeader({
  greeting,
  customerName,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary">
        {greeting}, {customerName}!
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open settings menu"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  )
}
