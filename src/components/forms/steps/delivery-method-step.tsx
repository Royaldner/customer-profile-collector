'use client'

import { useFormContext } from 'react-hook-form'
import { Package, Truck, Banknote } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CustomerWithAddressesFormData } from '@/lib/validations/customer'

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
] as const

export function DeliveryMethodStep() {
  const form = useFormContext<CustomerWithAddressesFormData>()

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

        {/* Info message for pickup */}
        {form.watch('customer.delivery_method') === 'pickup' && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Pick-up selected:</strong> You won&apos;t need to provide a delivery address.
              You can proceed directly to review your information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
