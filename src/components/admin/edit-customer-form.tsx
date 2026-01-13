'use client'

import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { usePSGCLocations, locationToComboboxOption } from '@/hooks/use-psgc-locations'
import { getBarangays } from '@/lib/services/psgc'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Form,
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
import {
  customerWithAddressesSchema,
  type CustomerWithAddressesFormData,
} from '@/lib/validations/customer'
import type { Customer, Courier } from '@/lib/types'

interface EditCustomerFormProps {
  customer: Customer
}

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

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true)

  // City/Barangay autocomplete states (per address index)
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({})
  const [addressBarangays, setAddressBarangays] = useState<Record<number, {value: string, label: string}[]>>({})
  const [loadingBarangays, setLoadingBarangays] = useState<Record<number, boolean>>({})

  // PSGC locations hook for city autocomplete
  const { locations, isLoading: isLoadingLocations, getLocationByCode } = usePSGCLocations()

  // City options for combobox (from PSGC API)
  const cityOptions = locations.map(locationToComboboxOption)

  const form = useForm<CustomerWithAddressesFormData>({
    resolver: zodResolver(customerWithAddressesSchema),
    defaultValues: {
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        contact_preference: customer.contact_preference,
        delivery_method: customer.delivery_method,
        courier: customer.courier || undefined,
      },
      addresses: customer.addresses?.map((addr) => ({
        first_name: addr.first_name,
        last_name: addr.last_name,
        label: addr.label,
        street_address: addr.street_address,
        barangay: addr.barangay,
        city: addr.city,
        province: addr.province,
        region: addr.region || '',
        postal_code: addr.postal_code,
        is_default: addr.is_default,
      })) || [{ ...DEFAULT_ADDRESS, is_default: true }],
    },
    mode: 'onBlur',
  })

  // Watch delivery method
  const deliveryMethod = useWatch({
    control: form.control,
    name: 'customer.delivery_method',
  })

  const isPickup = deliveryMethod === 'pickup'

  // Load barangays for a specific address index
  async function loadBarangays(index: number, cityCode: string) {
    setLoadingBarangays(prev => ({ ...prev, [index]: true }))
    setAddressBarangays(prev => ({ ...prev, [index]: [] }))
    try {
      const barangays = await getBarangays(cityCode)
      setAddressBarangays(prev => ({
        ...prev,
        [index]: barangays.map(b => ({ value: b.name, label: b.name }))
      }))
    } catch (err) {
      console.error('Failed to load barangays:', err)
    } finally {
      setLoadingBarangays(prev => ({ ...prev, [index]: false }))
    }
  }

  // Handle city selection for an address
  function handleCitySelect(index: number, cityCode: string) {
    const location = getLocationByCode(cityCode)
    if (location) {
      setSelectedCities(prev => ({ ...prev, [index]: cityCode }))
      form.setValue(`addresses.${index}.city`, location.name)
      form.setValue(`addresses.${index}.province`, location.province)
      form.setValue(`addresses.${index}.region`, location.region)
      form.setValue(`addresses.${index}.barangay`, '') // Reset barangay
      loadBarangays(index, cityCode)
    }
  }

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

  // Initialize city selections for existing addresses
  useEffect(() => {
    if (locations.length === 0) return // Wait for locations to load

    customer.addresses?.forEach((addr, index) => {
      if (addr.city) {
        const matchingLocation = locations.find(loc => loc.name === addr.city)
        if (matchingLocation) {
          setSelectedCities(prev => ({ ...prev, [index]: matchingLocation.code }))
          loadBarangays(index, matchingLocation.code)
        }
      }
    })
  }, [customer.addresses, locations])

  // Clear courier when switching to pickup
  useEffect(() => {
    if (isPickup) {
      form.setValue('customer.courier', undefined)
    }
  }, [isPickup, form])

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

      if (isRemovingDefault && fields.length > 1) {
        form.setValue('addresses.0.is_default', true)
      }
    }
  }

  const handleDefaultChange = (index: number, checked: boolean) => {
    if (checked) {
      fields.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`addresses.${i}.is_default`, false)
        }
      })
      form.setValue(`addresses.${index}.is_default`, true)
    }
  }

  async function onSubmit(data: CustomerWithAddressesFormData) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update customer')
      }

      toast.success('Customer updated successfully')
      router.push(`/admin/customers/${customer.id}`)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update customer contact details
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
                      {...field}
                    />
                  </FormControl>
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

            <FormField
              control={form.control}
              name="customer.contact_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
          </CardContent>
        </Card>

        {/* Delivery Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Preferences</CardTitle>
            <CardDescription>
              Update delivery method and courier preference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="customer.delivery_method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Delivery Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="pickup" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Pick-up (collect in-store)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="delivered" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Delivery (ship to address)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cod" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Cash on Delivery
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cop" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Cash on Pickup (at courier location)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPickup && (
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
                        {couriers.map((courier) => (
                          <SelectItem key={courier.id} value={courier.code}>
                            {courier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Addresses Section - Only show for delivery/COD */}
        {!isPickup && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Delivery Addresses</h3>
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Municipality</FormLabel>
                        {isLoadingLocations ? (
                          <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading cities...
                          </div>
                        ) : (
                          <LocationCombobox
                            options={cityOptions}
                            value={selectedCities[index] || ''}
                            onValueChange={(value) => handleCitySelect(index, value)}
                            placeholder="Search city..."
                            searchPlaceholder="Type to search..."
                            emptyText="No city found"
                          />
                        )}
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
                        {addressBarangays[index]?.length ? (
                          <LocationCombobox
                            options={addressBarangays[index]}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select barangay..."
                            searchPlaceholder="Type to search..."
                            emptyText="No barangay found"
                            disabled={loadingBarangays[index]}
                          />
                        ) : (
                          <FormControl>
                            <Input
                              placeholder={loadingBarangays[index] ? "Loading barangays..." : "Barangay name"}
                              {...field}
                              disabled={loadingBarangays[index]}
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            className={selectedCities[index] ? "bg-muted" : ""}
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
                            className={selectedCities[index] ? "bg-muted" : ""}
                          />
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
        )}

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/customers/${customer.id}`)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
