'use client'

import { useState, useCallback, useMemo } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { usePSGCLocations, locationToComboboxOption, barangayToComboboxOption } from '@/hooks/use-psgc-locations'
import { getBarangays, type BarangayOption } from '@/lib/services/psgc'
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

export function AddressForm() {
  const form = useFormContext<CustomerWithAddressesFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses',
  })

  // PSGC locations hook
  const { locations, isLoading: isLoadingLocations, searchLocations, getLocationByCode } = usePSGCLocations()

  // Convert locations to combobox options
  const cityOptions = useMemo(() => {
    return locations.map(locationToComboboxOption)
  }, [locations])

  // Track selected city codes and barangays for each address
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({})
  const [barangayOptions, setBarangayOptions] = useState<Record<number, { value: string; label: string }[]>>({})
  const [loadingBarangays, setLoadingBarangays] = useState<Record<number, boolean>>({})

  // Track which addresses use profile name
  const [useProfileName, setUseProfileName] = useState<Record<number, boolean>>({})

  // Load barangays when city changes
  const loadBarangays = useCallback(async (index: number, cityCode: string) => {
    if (!cityCode) {
      setBarangayOptions((prev) => ({ ...prev, [index]: [] }))
      return
    }

    setLoadingBarangays((prev) => ({ ...prev, [index]: true }))

    try {
      const barangays = await getBarangays(cityCode)
      setBarangayOptions((prev) => ({
        ...prev,
        [index]: barangays.map(barangayToComboboxOption),
      }))
    } catch (error) {
      console.error('Failed to load barangays:', error)
      setBarangayOptions((prev) => ({ ...prev, [index]: [] }))
    } finally {
      setLoadingBarangays((prev) => ({ ...prev, [index]: false }))
    }
  }, [])

  const handleCitySelect = (index: number, option: { value: string; label: string; description?: string }) => {
    // Find the full location data
    const location = getLocationByCode(option.value)
    if (location) {
      // Update form values
      form.setValue(`addresses.${index}.city`, location.name)
      form.setValue(`addresses.${index}.province`, location.province)
      form.setValue(`addresses.${index}.region`, location.region)
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
      setUseProfileName((prev) => {
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

  // Watch customer data for profile name feature
  const customer = form.watch('customer')
  const hasProfileAddress = !!customer?.profile_city
  const hasProfileName = !!(customer?.first_name && customer?.last_name)

  // Handle "Use my profile name" checkbox toggle
  const handleUseProfileNameChange = (index: number, checked: boolean) => {
    setUseProfileName((prev) => ({ ...prev, [index]: checked }))

    if (checked && hasProfileName) {
      // Copy name from customer profile
      form.setValue(`addresses.${index}.first_name`, customer.first_name || '')
      form.setValue(`addresses.${index}.last_name`, customer.last_name || '')
    } else {
      // Clear the name fields when unchecked
      form.setValue(`addresses.${index}.first_name`, '')
      form.setValue(`addresses.${index}.last_name`, '')
    }
  }

  const handleCopyFromProfile = (index: number) => {
    if (!hasProfileAddress) return

    // Copy name from customer profile and set the checkbox
    form.setValue(`addresses.${index}.first_name`, customer.first_name || '')
    form.setValue(`addresses.${index}.last_name`, customer.last_name || '')
    setUseProfileName((prev) => ({ ...prev, [index]: true }))

    // Copy address fields from profile
    form.setValue(`addresses.${index}.street_address`, customer.profile_street_address || '')
    form.setValue(`addresses.${index}.barangay`, customer.profile_barangay || '')
    form.setValue(`addresses.${index}.city`, customer.profile_city || '')
    form.setValue(`addresses.${index}.province`, customer.profile_province || '')
    form.setValue(`addresses.${index}.region`, customer.profile_region || '')
    form.setValue(`addresses.${index}.postal_code`, customer.profile_postal_code || '')

    // Clear the city state since we're setting it manually
    setSelectedCities((prev) => ({ ...prev, [index]: '' }))
    setBarangayOptions((prev) => ({ ...prev, [index]: [] }))

    toast.success('Profile address copied')
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
              <div className="flex items-center gap-2">
                {hasProfileAddress && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyFromProfile(index)}
                    className="h-8 text-xs"
                  >
                    <Copy className="mr-1.5 h-3 w-3" />
                    Use my address
                  </Button>
                )}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* "Use my profile name" checkbox */}
            {hasProfileName && (
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id={`use-profile-name-${index}`}
                  checked={useProfileName[index] || false}
                  onCheckedChange={(checked) => handleUseProfileNameChange(index, checked === true)}
                />
                <label
                  htmlFor={`use-profile-name-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Use my profile name ({customer.first_name} {customer.last_name})
                </label>
              </div>
            )}

            {/* Recipient Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`addresses.${index}.first_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        readOnly={useProfileName[index]}
                        className={useProfileName[index] ? 'bg-muted' : ''}
                      />
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
                      <Input
                        placeholder="Dela Cruz"
                        {...field}
                        readOnly={useProfileName[index]}
                        className={useProfileName[index] ? 'bg-muted' : ''}
                      />
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
                    {isLoadingLocations ? (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading locations...</span>
                      </div>
                    ) : (
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
                        searchPlaceholder="Type to search (1,820 locations)..."
                        emptyText="Not found. You may type manually in the fields below."
                      />
                    )}
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
                    {loadingBarangays[index] ? (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading barangays...</span>
                      </div>
                    ) : barangayOptions[index] && barangayOptions[index].length > 0 ? (
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
