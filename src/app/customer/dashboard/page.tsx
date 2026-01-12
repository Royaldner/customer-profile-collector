'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, Trash2, Star, Package, Truck, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COURIER_OPTIONS } from '@/lib/validations/customer'
import type { Customer, Address, DeliveryMethod, Courier } from '@/lib/types'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingDelivery, setIsEditingDelivery] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    contact_preference: 'email' as 'email' | 'sms',
  })
  const [editedDelivery, setEditedDelivery] = useState<DeliveryMethod>('delivered')
  const [editedCourier, setEditedCourier] = useState<string | undefined>(undefined)

  // Address dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
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
  })

  useEffect(() => {
    loadCustomerData()
    loadCouriers()
  }, [])

  async function loadCouriers() {
    try {
      const response = await fetch('/api/couriers')
      if (response.ok) {
        const data = await response.json()
        setCouriers(data.couriers || [])
      }
    } catch (err) {
      console.error('Failed to load couriers:', err)
    }
  }

  async function loadCustomerData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/customer/login')
        return
      }

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          setError('No customer profile linked to this account. Please register first.')
          return
        }
        throw customerError
      }

      setCustomer(customerData)
      setEditedProfile({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        phone: customerData.phone,
        contact_preference: customerData.contact_preference,
      })
      setEditedDelivery(customerData.delivery_method)
      setEditedCourier(customerData.courier || undefined)

      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerData.id)
        .order('is_default', { ascending: false })

      if (addressError) {
        throw addressError
      }

      setAddresses(addressData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer data')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/customer/login')
    router.refresh()
  }

  async function handleSaveProfile() {
    setIsSaving(true)
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const { customer: updatedCustomer } = await response.json()
      setCustomer(prev => prev ? { ...prev, ...updatedCustomer } : null)
      setIsEditingProfile(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveDelivery() {
    setIsSaving(true)
    try {
      // Clear courier if switching to pickup
      const courierToSave = editedDelivery === 'pickup' ? null : editedCourier

      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_method: editedDelivery,
          courier: courierToSave,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const { customer: updatedCustomer } = await response.json()
      setCustomer(prev => prev ? { ...prev, ...updatedCustomer } : null)
      setIsEditingDelivery(false)
      toast.success('Delivery preference updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update delivery preference')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delivery method change - clear courier if not allowed for new method
  function handleDeliveryMethodChange(value: DeliveryMethod) {
    setEditedDelivery(value)
    if (value === 'pickup') {
      setEditedCourier(undefined)
    } else {
      // Check if current courier is allowed for new delivery method
      const allowedCouriers = COURIER_OPTIONS[value] as readonly string[]
      if (editedCourier && !allowedCouriers.includes(editedCourier)) {
        setEditedCourier(undefined)
      }
    }
  }

  // Get filtered couriers based on delivery method
  const allowedCourierCodes = editedDelivery ? (COURIER_OPTIONS[editedDelivery] as readonly string[]) : []
  const filteredCouriers = couriers.filter(c => allowedCourierCodes.includes(c.code))

  // Check if profile address exists
  const hasProfileAddress = !!customer?.profile_city

  // Copy profile address to address form
  function handleCopyFromProfile() {
    if (!customer || !hasProfileAddress) return
    setAddressForm({
      ...addressForm,
      first_name: customer.first_name,
      last_name: customer.last_name,
      street_address: customer.profile_street_address || '',
      barangay: customer.profile_barangay || '',
      city: customer.profile_city || '',
      province: customer.profile_province || '',
      region: customer.profile_region || '',
      postal_code: customer.profile_postal_code || '',
    })
    toast.success('Profile address copied')
  }

  function openAddressDialog(address?: Address) {
    if (address) {
      setEditingAddress(address)
      setAddressForm({
        first_name: address.first_name,
        last_name: address.last_name,
        label: address.label,
        street_address: address.street_address,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        region: address.region || '',
        postal_code: address.postal_code,
        is_default: address.is_default,
      })
    } else {
      setEditingAddress(null)
      setAddressForm({
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        label: '',
        street_address: '',
        barangay: '',
        city: '',
        province: '',
        region: '',
        postal_code: '',
        is_default: addresses.length === 0,
      })
    }
    setAddressDialogOpen(true)
  }

  async function handleSaveAddress() {
    setIsSaving(true)
    try {
      const url = editingAddress
        ? `/api/customer/addresses/${editingAddress.id}`
        : '/api/customer/addresses'

      const response = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      await loadCustomerData()
      setAddressDialogOpen(false)
      toast.success(editingAddress ? 'Address updated' : 'Address added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAddress(addressId: string) {
    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      await loadCustomerData()
      toast.success('Address deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete address')
    }
  }

  async function handleSetDefaultAddress(addressId: string) {
    const address = addresses.find(a => a.id === addressId)
    if (!address) return

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...address, is_default: true }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      await loadCustomerData()
      toast.success('Default address updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set default address')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-2">
                <Link href="/register">
                  <Button>Register Now</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  const deliveryMethodLabels = {
    pickup: 'Pick-up',
    delivered: 'Delivery',
    cod: 'Cash on Delivery',
    cop: 'Cash on Pickup',
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">My Profile</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your contact details</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editedProfile.first_name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editedProfile.last_name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={customer.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_preference">Contact Preference</Label>
                  <Select
                    value={editedProfile.contact_preference}
                    onValueChange={(value: 'email' | 'sms') =>
                      setEditedProfile(prev => ({ ...prev, contact_preference: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Preference</p>
                    <p className="font-medium capitalize">{customer.contact_preference}</p>
                  </div>
                </div>
                {/* Profile Address */}
                {customer.profile_city && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Profile Address</p>
                    <div className="text-sm space-y-1">
                      {customer.profile_street_address && (
                        <p className="font-medium">{customer.profile_street_address}</p>
                      )}
                      <p>{customer.profile_barangay}, {customer.profile_city}</p>
                      <p>{customer.profile_province} {customer.profile_postal_code}</p>
                      {customer.profile_region && (
                        <p className="text-muted-foreground">{customer.profile_region}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Preference */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Delivery Preference</CardTitle>
              <CardDescription>How you receive your orders</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingDelivery(!isEditingDelivery)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isEditingDelivery ? (
              <div className="space-y-4">
                <RadioGroup
                  value={editedDelivery}
                  onValueChange={handleDeliveryMethodChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="cursor-pointer">
                      <span className="font-medium">Pick-up</span>
                      <span className="text-muted-foreground ml-2">- Collect in-store</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="delivered" id="delivered" />
                    <Label htmlFor="delivered" className="cursor-pointer">
                      <span className="font-medium">Delivery</span>
                      <span className="text-muted-foreground ml-2">- Deliver to address</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer">
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="text-muted-foreground ml-2">- Pay when delivered</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="cop" id="cop" />
                    <Label htmlFor="cop" className="cursor-pointer">
                      <span className="font-medium">Cash on Pickup</span>
                      <span className="text-muted-foreground ml-2">- Pick up at courier location</span>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Courier selection - only show for delivery/cod/cop */}
                {editedDelivery !== 'pickup' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <Label className="text-base font-semibold">Preferred Courier</Label>
                      <p className="text-sm text-muted-foreground">
                        {(editedDelivery === 'cod' || editedDelivery === 'cop')
                          ? 'Only LBC is available for COD/COP orders'
                          : 'Select your preferred courier for deliveries'
                        }
                      </p>
                    </div>
                    <RadioGroup
                      value={editedCourier || ''}
                      onValueChange={(value) => setEditedCourier(value || undefined)}
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
                                {courier.code === 'lbc' ? 'Available for all delivery types' : 'Standard delivery only'}
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
                  <Button onClick={handleSaveDelivery} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingDelivery(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant={customer.delivery_method === 'pickup' ? 'secondary' : 'default'}>
                  {deliveryMethodLabels[customer.delivery_method]}
                </Badge>
                {customer.delivery_method !== 'pickup' && customer.courier && (
                  <p className="text-sm text-muted-foreground">
                    Courier: {couriers.find(c => c.code === customer.courier)?.name || customer.courier}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Addresses - Only show if not pickup */}
        {customer.delivery_method !== 'pickup' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Delivery Addresses</CardTitle>
                <CardDescription>
                  {addresses.length === 0
                    ? 'No addresses saved'
                    : `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved`
                  }
                </CardDescription>
              </div>
              {addresses.length < 3 && (
                <Button variant="outline" size="sm" onClick={() => openAddressDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No addresses yet</p>
                  <Button onClick={() => openAddressDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!address.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openAddressDialog(address)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{address.label}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        {address.first_name} {address.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.street_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.barangay}, {address.city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.province} {address.postal_code}
                      </p>
                      {address.region && (
                        <p className="text-sm text-muted-foreground">{address.region}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Member since {new Date(customer.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(customer.updated_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? 'Update your address details' : 'Add a new delivery address'}
                </DialogDescription>
              </div>
              {hasProfileAddress && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFromProfile}
                  className="shrink-0"
                >
                  <Copy className="mr-1.5 h-3 w-3" />
                  Use my address
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-first-name">First Name</Label>
                <Input
                  id="addr-first-name"
                  placeholder="Juan"
                  value={addressForm.first_name}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-last-name">Last Name</Label>
                <Input
                  id="addr-last-name"
                  placeholder="Dela Cruz"
                  value={addressForm.last_name}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-label">Label</Label>
              <Input
                id="addr-label"
                placeholder="e.g., Home, Work"
                value={addressForm.label}
                onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-street">Street Address</Label>
              <Input
                id="addr-street"
                placeholder="House/Unit No., Street Name"
                value={addressForm.street_address}
                onChange={(e) => setAddressForm(prev => ({ ...prev, street_address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-barangay">Barangay</Label>
              <Input
                id="addr-barangay"
                placeholder="Barangay name"
                value={addressForm.barangay}
                onChange={(e) => setAddressForm(prev => ({ ...prev, barangay: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-city">City/Municipality</Label>
                <Input
                  id="addr-city"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-province">Province</Label>
                <Input
                  id="addr-province"
                  placeholder="Province"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, province: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-region">Region (Optional)</Label>
                <Input
                  id="addr-region"
                  placeholder="e.g., NCR"
                  value={addressForm.region}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, region: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-postal">Postal Code</Label>
                <Input
                  id="addr-postal"
                  placeholder="4 digits"
                  maxLength={4}
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addr-default"
                checked={addressForm.is_default}
                onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="addr-default" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
