'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Pencil, Package, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COURIER_OPTIONS } from '@/lib/validations/customer'
import type { Customer, DeliveryMethod, Courier } from '@/lib/types'

const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: 'Pick-up',
  delivered: 'Delivery',
  cod: 'Cash on Delivery',
  cop: 'Cash on Pickup',
}

interface DeliveryPreferenceCardProps {
  customer: Customer
  couriers: Courier[]
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  editedDelivery: DeliveryMethod
  editedCourier: string | undefined
  onDeliveryMethodChange: (value: DeliveryMethod) => void
  onCourierChange: (value: string | undefined) => void
  onSave: () => Promise<void>
  isSaving: boolean
}

export function DeliveryPreferenceCard({
  customer,
  couriers,
  isEditing,
  setIsEditing,
  editedDelivery,
  editedCourier,
  onDeliveryMethodChange,
  onCourierChange,
  onSave,
  isSaving,
}: DeliveryPreferenceCardProps) {
  // Get filtered couriers based on delivery method
  const allowedCourierCodes = editedDelivery
    ? (COURIER_OPTIONS[editedDelivery] as readonly string[])
    : []
  const filteredCouriers = couriers.filter((c) =>
    allowedCourierCodes.includes(c.code)
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Delivery Preference</CardTitle>
          <CardDescription>How you receive your orders</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <RadioGroup
              value={editedDelivery}
              onValueChange={(value) => onDeliveryMethodChange(value as DeliveryMethod)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="pickup" id="pref-pickup" />
                <Label htmlFor="pref-pickup" className="cursor-pointer">
                  <span className="font-medium">Pick-up</span>
                  <span className="text-muted-foreground ml-2">- Collect in-store</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="delivered" id="pref-delivered" />
                <Label htmlFor="pref-delivered" className="cursor-pointer">
                  <span className="font-medium">Delivery</span>
                  <span className="text-muted-foreground ml-2">- Deliver to address</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cod" id="pref-cod" />
                <Label htmlFor="pref-cod" className="cursor-pointer">
                  <span className="font-medium">Cash on Delivery</span>
                  <span className="text-muted-foreground ml-2">- Pay when delivered</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cop" id="pref-cop" />
                <Label htmlFor="pref-cop" className="cursor-pointer">
                  <span className="font-medium">Cash on Pickup</span>
                  <span className="text-muted-foreground ml-2">
                    - Pick up at courier location
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {/* Courier selection - only show for delivery/cod/cop */}
            {editedDelivery !== 'pickup' && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label className="text-base font-semibold">Preferred Courier</Label>
                  <p className="text-sm text-muted-foreground">
                    {editedDelivery === 'cod' || editedDelivery === 'cop'
                      ? 'Only LBC is available for COD/COP orders'
                      : 'Select your preferred courier for deliveries'}
                  </p>
                </div>
                <RadioGroup
                  value={editedCourier || ''}
                  onValueChange={(value) => onCourierChange(value || undefined)}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {filteredCouriers.map((courier) => {
                    const isSelected = editedCourier === courier.code
                    const CourierIcon = courier.code === 'lbc' ? Package : Truck

                    return (
                      <label
                        key={courier.id}
                        className={cn(
                          'flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/50'
                        )}
                      >
                        <RadioGroupItem value={courier.code} className="sr-only" />
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-lg',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <CourierIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{courier.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {courier.code === 'lbc'
                              ? 'Available for all delivery types'
                              : 'Standard delivery only'}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/50'
                          )}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                      </label>
                    )
                  })}
                </RadioGroup>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge
              variant={customer.delivery_method === 'pickup' ? 'secondary' : 'default'}
            >
              {DELIVERY_METHOD_LABELS[customer.delivery_method]}
            </Badge>
            {customer.delivery_method !== 'pickup' && customer.courier && (
              <p className="text-sm text-muted-foreground">
                Courier:{' '}
                {couriers.find((c) => c.code === customer.courier)?.name ||
                  customer.courier}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
