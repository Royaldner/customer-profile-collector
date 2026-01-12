'use client'

import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Package, Truck, Banknote, MapPin } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { COURIER_OPTIONS, type CustomerWithAddressesFormData } from '@/lib/validations/customer'
import type { Courier } from '@/lib/types'

const deliveryOptions = [
  {
    value: 'pickup',
    label: 'Pick-up',
    description: "I'll collect my order in-store",
    icon: Package,
  },
  {
    value: 'delivered',
    label: 'Delivery',
    description: 'Deliver to my address',
    icon: Truck,
  },
  {
    value: 'cod',
    label: 'Cash on Delivery (COD)',
    description: 'Pay when delivered',
    icon: Banknote,
  },
  {
    value: 'cop',
    label: 'Cash on Pickup (COP)',
    description: 'Pick up at courier location, pay on pickup',
    icon: MapPin,
  },
] as const

export function DeliveryMethodStep() {
  const form = useFormContext<CustomerWithAddressesFormData>()
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true)

  // Watch delivery method to show/hide courier dropdown
  const deliveryMethod = useWatch({
    control: form.control,
    name: 'customer.delivery_method',
  })

  const showCourierDropdown = deliveryMethod !== 'pickup'
  const isCOP = deliveryMethod === 'cop'

  // Get allowed couriers based on delivery method
  const allowedCourierCodes: readonly string[] = deliveryMethod ? COURIER_OPTIONS[deliveryMethod] : []
  const filteredCouriers = couriers.filter((c) =>
    allowedCourierCodes.includes(c.code)
  )

  // Fetch couriers on mount
  useEffect(() => {
    async function fetchCouriers() {
      try {
        const response = await fetch('/api/couriers')
        if (response.ok) {
          const data = await response.json()
          setCouriers(data.couriers || [])
        }
      } catch (error) {
        console.error('Failed to fetch couriers:', error)
      } finally {
        setIsLoadingCouriers(false)
      }
    }
    fetchCouriers()
  }, [])

  // Clear courier when switching to pickup, or reset if current courier is not allowed
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      form.setValue('customer.courier', undefined)
    } else {
      const currentCourier = form.getValues('customer.courier')
      if (currentCourier && !allowedCourierCodes.includes(currentCourier)) {
        form.setValue('customer.courier', undefined)
      }
    }
  }, [deliveryMethod, form, allowedCourierCodes])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Preference</CardTitle>
        <CardDescription>
          How would you like to receive your orders?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="customer.delivery_method"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-3"
                >
                  {deliveryOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = field.value === option.value

                    return (
                      <FormItem key={option.value}>
                        <FormControl>
                          <label
                            className={cn(
                              'flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50'
                            )}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <FormLabel className="font-medium cursor-pointer">
                                {option.label}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                            <div
                              className={cn(
                                'h-4 w-4 rounded-full border-2',
                                isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/50'
                              )}
                            >
                              {isSelected && (
                                <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                              )}
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>
                    )
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Courier selection for delivery/cod/cop */}
        {showCourierDropdown && (
          <div className="mt-6 pt-6 border-t">
            <FormField
              control={form.control}
              name="customer.courier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Courier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={isLoadingCouriers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCouriers ? 'Loading couriers...' : 'Select a courier'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCouriers.map((courier) => (
                        <SelectItem key={courier.id} value={courier.code}>
                          {courier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(deliveryMethod === 'cod' || deliveryMethod === 'cop') && (
                    <p className="text-xs text-muted-foreground">
                      Only LBC is available for {deliveryMethod === 'cod' ? 'COD' : 'COP'} orders
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Info message for pickup */}
        {deliveryMethod === 'pickup' && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Pick-up selected:</strong> You won&apos;t need to provide a delivery address.
              You can proceed directly to review your information.
            </p>
          </div>
        )}

        {/* Info message for COP */}
        {isCOP && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <strong>Cash on Pickup (COP):</strong> The address you provide will be the courier&apos;s
              pickup location where you&apos;ll collect and pay for your package.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
