'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { LocationCombobox } from '@/components/ui/location-combobox'
import { cities, type Location, type Barangay } from '@/lib/data/philippines'
import type { CustomerWithAddressesFormData } from '@/lib/validations/customer'

const DEFAULT_ADDRESS = {
  first_name: '',
  last_name: '',
  label: '',
  street_address: '',
  barangay: '',
  city: '',
  province: '',
  region: '',
  postal_code: '',
  is_default: false,
}

// Convert cities to combobox options
const cityOptions = cities.map((city) => ({
  value: city.code,
  label: city.name,
  description: `${city.province}, ${city.region}`,
}))

export function AddressForm() {
  const form = useFormContext<CustomerWithAddressesFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses',
  })

  // Track selected city codes and barangays for each address
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({})
  const [barangayOptions, setBarangayOptions] = useState<Record<number, { value: string; label: string }[]>>({})

  // Load barangays when city changes
  const loadBarangays = useCallback(async (index: number, cityCode: string) => {
    if (!cityCode) {
      setBarangayOptions((prev) => ({ ...prev, [index]: [] }))
      return
    }

    try {
      const response = await fetch(`/api/barangays?cityCode=${cityCode}`)
      if (response.ok) {
        const { barangays } = await response.json()
        setBarangayOptions((prev) => ({
          ...prev,
          [index]: barangays.map((b: Barangay) => ({
            value: b.code,
            label: b.name,
          })),
        }))
      }
    } catch (error) {
      console.error('Failed to load barangays:', error)
    }
  }, [])

  const handleCitySelect = (index: number, option: { value: string; label: string; description?: string }) => {
    // Find the full city data
    const city = cities.find((c) => c.code === option.value)
    if (city) {
      // Update form values
      form.setValue(`addresses.${index}.city`, city.name)
      form.setValue(`addresses.${index}.province`, city.province)
      form.setValue(`addresses.${index}.region`, city.region)
      form.setValue(`addresses.${index}.barangay`, '') // Clear barangay when city changes

      // Track selected city and load barangays
      setSelectedCities((prev) => ({ ...prev, [index]: option.value }))
      loadBarangays(index, option.value)
    }
  }

  const handleBarangaySelect = (index: number, option: { value: string; label: string }) => {
    form.setValue(`addresses.${index}.barangay`, option.label)
  }

  const handleAddAddress = () => {
    if (fields.length < 3) {
      append({ ...DEFAULT_ADDRESS, is_default: fields.length === 0 })
    }
  }

  const handleRemoveAddress = (index: number) => {
    if (fields.length > 1) {
      const isRemovingDefault = form.getValues(`addresses.${index}.is_default`)
      remove(index)

      // Clean up state for removed address
      setSelectedCities((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })
      setBarangayOptions((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })

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
        <h3 className="text-lg font-medium">Delivery Address</h3>
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
            {/* Recipient Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`addresses.${index}.first_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`addresses.${index}.last_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dela Cruz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* City/Municipality with Autocomplete */}
            <FormField
              control={form.control}
              name={`addresses.${index}.city`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City/Municipality</FormLabel>
                  <FormControl>
                    <LocationCombobox
                      options={cityOptions}
                      value={selectedCities[index] || ''}
                      onValueChange={(value) => {
                        const option = cityOptions.find((o) => o.value === value)
                        if (option) {
                          handleCitySelect(index, option)
                        }
                      }}
                      onSelect={(option) => handleCitySelect(index, option)}
                      placeholder="Search city/municipality..."
                      searchPlaceholder="Type to search cities..."
                      emptyText="No cities found. Try a different search."
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && !selectedCities[index] && (
                    <p className="text-xs text-muted-foreground">
                      Current: {field.value} (select from list to auto-fill province/region)
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Barangay with Autocomplete */}
            <FormField
              control={form.control}
              name={`addresses.${index}.barangay`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barangay</FormLabel>
                  <FormControl>
                    {barangayOptions[index] && barangayOptions[index].length > 0 ? (
                      <LocationCombobox
                        options={barangayOptions[index]}
                        value={barangayOptions[index].find((b) => b.label === field.value)?.value || ''}
                        onValueChange={(value) => {
                          const option = barangayOptions[index]?.find((o) => o.value === value)
                          if (option) {
                            handleBarangaySelect(index, option)
                          }
                        }}
                        onSelect={(option) => handleBarangaySelect(index, option)}
                        placeholder="Select barangay..."
                        searchPlaceholder="Search barangays..."
                        emptyText="No barangays found."
                      />
                    ) : (
                      <Input
                        placeholder={selectedCities[index] ? "No barangay data available" : "Select city first or type barangay"}
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`addresses.${index}.province`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Province"
                        {...field}
                        readOnly={!!selectedCities[index]}
                        className={selectedCities[index] ? 'bg-muted' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`addresses.${index}.region`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., NCR, Region IV-A"
                        {...field}
                        readOnly={!!selectedCities[index]}
                        className={selectedCities[index] ? 'bg-muted' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
