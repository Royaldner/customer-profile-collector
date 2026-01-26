'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ChevronRight } from 'lucide-react'
import type { Address } from '@/lib/types'

interface DefaultAddressCardProps {
  defaultAddress: Address | undefined
  onManageAddresses: () => void
}

export function DefaultAddressCard({
  defaultAddress,
  onManageAddresses,
}: DefaultAddressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Default Address
            </CardTitle>
            <CardDescription>
              {defaultAddress ? 'Your primary delivery address' : 'No default address set'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultAddress ? (
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{defaultAddress.label}</span>
              <Badge variant="outline" className="text-xs">
                Default
              </Badge>
            </div>
            <p className="text-sm font-medium">
              {defaultAddress.first_name} {defaultAddress.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {defaultAddress.street_address}
            </p>
            <p className="text-sm text-muted-foreground">
              {defaultAddress.barangay}, {defaultAddress.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {defaultAddress.province} {defaultAddress.postal_code}
            </p>
            {defaultAddress.region && (
              <p className="text-sm text-muted-foreground">{defaultAddress.region}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              You haven&apos;t set a default address yet.
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={onManageAddresses}
        >
          <span>Manage Addresses</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
