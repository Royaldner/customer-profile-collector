'use client'

import { useState, useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { LocationCombobox } from '@/components/ui/location-combobox'
import { usePSGCLocations, locationToComboboxOption, barangayToComboboxOption } from '@/hooks/use-psgc-locations'
import { getBarangays } from '@/lib/services/psgc'
import type { CustomerWithAddressesFormData } from '@/lib/validations/customer'

interface PersonalInfoStepProps {
  isEmailReadOnly?: boolean
}

export function PersonalInfoStep({ isEmailReadOnly = false }: PersonalInfoStepProps) {
  const form = useFormContext<CustomerWithAddressesFormData>()

  // PSGC locations hook
  const { locations, isLoading: isLoadingLocations, getLocationByCode } = usePSGCLocations()

  // Convert locations to combobox options
  const cityOptions = useMemo(() => {
    return locations.map(locationToComboboxOption)
  }, [locations])

  // State for profile address city/barangay autocomplete
  const [selectedProfileCity, setSelectedProfileCity] = useState<string>('')
  const [profileBarangayOptions, setProfileBarangayOptions] = useState<{ value: string; label: string }[]>([])
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Load barangays when city changes
  const loadProfileBarangays = useCallback(async (cityCode: string) => {
    if (!cityCode) {
      setProfileBarangayOptions([])
      return
    }

    setLoadingBarangays(true)

    try {
      const barangays = await getBarangays(cityCode)
      setProfileBarangayOptions(barangays.map(barangayToComboboxOption))
    } catch (error) {
      console.error('Failed to load barangays:', error)
      setProfileBarangayOptions([])
    } finally {
      setLoadingBarangays(false)
    }
  }, [])

  const handleProfileCitySelect = (option: { value: string; label: string; description?: string }) => {
    const location = getLocationByCode(option.value)
    if (location) {
      form.setValue('customer.profile_city', location.name)
      form.setValue('customer.profile_province', location.province)
      form.setValue('customer.profile_region', location.region)
      form.setValue('customer.profile_barangay', '') // Clear barangay when city changes

      setSelectedProfileCity(option.value)
      loadProfileBarangays(option.value)
    }
  }

  const handleProfileBarangaySelect = (option: { value: string; label: string }) => {
    form.setValue('customer.profile_barangay', option.label)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Please provide your contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customer.first_name"
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
            name="customer.last_name"
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
          name="customer.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="juan@example.com"
                  readOnly={isEmailReadOnly}
                  className={isEmailReadOnly ? 'bg-muted' : ''}
                  {...field}
                />
              </FormControl>
              {isEmailReadOnly && (
                <p className="text-xs text-muted-foreground">
                  Email is linked to your account and cannot be changed
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="09171234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden: restore when SMS system is available
        <FormField
          control={form.control}
          name="customer.contact_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Contact Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contact preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </CardContent>
    </Card>

    {/* Profile Address Section */}
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Profile Address</CardTitle>
        <CardDescription>
          Your home address for future reference (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="customer.profile_street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="House/Unit No., Street Name" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customer.profile_city"
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
                      value={selectedProfileCity || ''}
                      onValueChange={(value) => {
                        const option = cityOptions.find((o) => o.value === value)
                        if (option) {
                          handleProfileCitySelect(option)
                        }
                      }}
                      onSelect={handleProfileCitySelect}
                      placeholder="Search city/municipality..."
                      searchPlaceholder="Type to search (1,820 locations)..."
                      emptyText="Not found. You may type manually below."
                    />
                  )}
                </FormControl>
                {field.value && !selectedProfileCity && (
                  <p className="text-xs text-muted-foreground">
                    Current: {field.value} (select from list to auto-fill province/region)
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer.profile_barangay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barangay</FormLabel>
                <FormControl>
                  {loadingBarangays ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : profileBarangayOptions.length > 0 ? (
                    <LocationCombobox
                      options={profileBarangayOptions}
                      value={profileBarangayOptions.find(b => b.label === field.value)?.value || ''}
                      onValueChange={(value) => {
                        const option = profileBarangayOptions.find((o) => o.value === value)
                        if (option) {
                          handleProfileBarangaySelect(option)
                        }
                      }}
                      onSelect={handleProfileBarangaySelect}
                      placeholder="Select barangay..."
                      searchPlaceholder="Search barangays..."
                      emptyText="No barangay found."
                    />
                  ) : (
                    <Input placeholder="Select a city first" {...field} value={field.value || ''} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="customer.profile_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Province"
                    {...field}
                    value={field.value || ''}
                    readOnly={!!selectedProfileCity}
                    className={selectedProfileCity ? 'bg-muted' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer.profile_region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Region"
                    {...field}
                    value={field.value || ''}
                    readOnly={!!selectedProfileCity}
                    className={selectedProfileCity ? 'bg-muted' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer.profile_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1234"
                    maxLength={4}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
    </>
  )
}
