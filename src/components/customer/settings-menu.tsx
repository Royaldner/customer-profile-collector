'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  User,
  MapPin,
  Info,
  AlertTriangle,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import type { Customer } from '@/lib/types'

export type SettingsView = 'personal' | 'addresses' | 'account' | 'danger' | null

interface SettingsMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
  onSelectView: (view: SettingsView) => void
  onLogout: () => Promise<void>
}

interface MenuItem {
  id: SettingsView
  label: string
  description: string
  icon: React.ReactNode
  show: boolean
  danger?: boolean
}

export function SettingsMenu({
  open,
  onOpenChange,
  customer,
  onSelectView,
  onLogout,
}: SettingsMenuProps) {
  const menuItems: MenuItem[] = [
    {
      id: 'personal',
      label: 'Personal Information',
      description: 'Name, email, phone, contact preference',
      icon: <User className="h-5 w-5" />,
      show: true,
    },
    {
      id: 'addresses',
      label: 'Delivery Addresses',
      description: 'Manage your delivery addresses',
      icon: <MapPin className="h-5 w-5" />,
      show: customer.delivery_method !== 'pickup',
    },
    {
      id: 'account',
      label: 'Account',
      description: 'Account information and history',
      icon: <Info className="h-5 w-5" />,
      show: true,
    },
    {
      id: 'danger',
      label: 'Danger Zone',
      description: 'Delete your account',
      icon: <AlertTriangle className="h-5 w-5" />,
      show: true,
      danger: true,
    },
  ]

  const handleItemClick = (view: SettingsView) => {
    onOpenChange(false)
    // Small delay to let drawer close animation complete
    setTimeout(() => onSelectView(view), 150)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your profile and preferences</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 py-6">
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted/50 transition-colors ${
                  item.danger ? 'hover:bg-destructive/10' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    item.danger
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      item.danger ? 'text-destructive' : ''
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 ${
                    item.danger ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
