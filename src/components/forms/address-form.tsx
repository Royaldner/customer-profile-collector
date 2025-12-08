'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CustomerWithAddressesFormData } from '@/lib/validations/customer'

const DEFAULT_ADDRESS = {
  label: '',
  street_address: '',
  barangay: '',
  city: '',
  province: '',
  region: '',
  postal_code: '',
  is_default: false,
}

export function AddressForm() {
  const form = useFormContext<CustomerWithAddressesFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses',
  })

  const handleAddAddress = () => {
    if (fields.length < 3) {
      append({ ...DEFAULT_ADDRESS, is_default: fields.length === 0 })
    }
  }

  const handleRemoveAddress = (index: number) => {
    if (fields.length > 1) {
      const isRemovingDefault = form.getValues(`addresses.${index}.is_default`)
      remove(index)

      // If we removed the default address, set the first remaining one as default
      if (isRemovingDefault && fields.length > 1) {
        form.setValue('addresses.0.is_default', true)
      }
    }
  }

  const handleDefaultChange = (index: number, checked: boolean) => {
    if (checked) {
      // Unset all other defaults first
      fields.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`addresses.${i}.is_default`, false)
        }
      })
      form.setValue(`addresses.${index}.is_default`, true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Addresses</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAddress}
          disabled={fields.length >= 3}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {form.formState.errors.addresses?.root && (
        <p className="text-sm text-destructive">
          {form.formState.errors.addresses.root.message}
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Address {index + 1}
              </CardTitle>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAddress(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`addresses.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home, Work, Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.street_address`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="House/Unit No., Street Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.barangay`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barangay</FormLabel>
                  <FormControl>
                    <Input placeholder="Barangay name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`addresses.${index}.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City/Municipality</FormLabel>
                    <FormControl>
                      <Input placeholder="City or Municipality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`addresses.${index}.province`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`addresses.${index}.region`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NCR, Region IV-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`addresses.${index}.postal_code`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="4-digit code" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`addresses.${index}.is_default`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        handleDefaultChange(index, checked === true)
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Set as default address
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}

      <p className="text-sm text-muted-foreground">
        You can add up to 3 addresses. One must be set as default.
      </p>
    </div>
  )
}
