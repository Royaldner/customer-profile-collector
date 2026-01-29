'use client'

import { useFormContext } from 'react-hook-form'
import { UserPlus, RotateCcw } from 'lucide-react'
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

const customerHistoryOptions = [
  {
    value: false,
    label: "I'm a new customer",
    description: 'This is my first time ordering from Cangoods',
    icon: UserPlus,
  },
  {
    value: true,
    label: "I'm a returning customer",
    description:
      "I've ordered from Cangoods before and want to link my previous order history to this account",
    icon: RotateCcw,
  },
] as const

export function CustomerHistoryStep() {
  const form = useFormContext<CustomerWithAddressesFormData>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Have you ordered from Cangoods before?</CardTitle>
        <CardDescription>
          This helps us link your order history to your new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="customer.is_returning_customer"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === 'true')}
                  value={field.value?.toString() ?? 'false'}
                  className="flex flex-col space-y-3"
                >
                  {customerHistoryOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = field.value === option.value

                    return (
                      <FormItem key={option.value.toString()}>
                        <FormControl>
                          <label
                            className={cn(
                              'flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50'
                            )}
                          >
                            <RadioGroupItem
                              value={option.value.toString()}
                              className="sr-only"
                            />
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

        {/* Info message */}
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Why does this matter?</strong> If you&apos;re a returning
            customer, we&apos;ll automatically link your previous orders to your new
            account so you can view your order history.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
