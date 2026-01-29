'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COURIER_OPTIONS } from '@/lib/validations/customer'
import { usePSGCLocations, locationToComboboxOption, barangayToComboboxOption } from '@/hooks/use-psgc-locations'
import { getBarangays } from '@/lib/services/psgc'
import type { Customer, Address, DeliveryMethod, Courier } from '@/lib/types'
import { CustomerOrdersSection } from '@/components/orders/customer-orders-section'
import { DashboardHeader } from '@/components/customer/dashboard-header'
import { SettingsMenu, type SettingsView } from '@/components/customer/settings-menu'
import { SettingsViewComponent } from '@/components/customer/settings-view'
import { DeliveryPreferenceCard } from '@/components/customer/delivery-preference-card'
import { DefaultAddressCard } from '@/components/customer/default-address-card'
import { AddressDialog, type AddressFormData } from '@/components/customer/address-dialog'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [greeting, setGreeting] = useState('Welcome')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Menu drawer state
  const [menuOpen, setMenuOpen] = useState(false)

  // Active view state (null = dashboard, otherwise full-screen settings view)
  const [activeView, setActiveView] = useState<SettingsView>(null)

  // PSGC locations
  const { locations, isLoading: isLoadingLocations, getLocationByCode } = usePSGCLocations()
  const cityOptions = useMemo(() => locations.map(locationToComboboxOption), [locations])

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingDelivery, setIsEditingDelivery] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    first_name: '', last_name: '', phone: '',
    contact_preference: 'email' as 'email' | 'sms',
    profile_street_address: '', profile_barangay: '', profile_city: '',
    profile_province: '', profile_region: '', profile_postal_code: '',
  })
  const [editedDelivery, setEditedDelivery] = useState<DeliveryMethod>('delivered')
  const [editedCourier, setEditedCourier] = useState<string | undefined>(undefined)

  // Profile address autocomplete
  const [selectedProfileCity, setSelectedProfileCity] = useState('')
  const [profileBarangays, setProfileBarangays] = useState<{value: string, label: string}[]>([])
  const [loadingProfileBarangays, setLoadingProfileBarangays] = useState(false)

  // Address dialog state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    first_name: '', last_name: '', label: '', street_address: '',
    barangay: '', city: '', province: '', region: '', postal_code: '', is_default: false,
  })
  const [selectedAddressCity, setSelectedAddressCity] = useState('')
  const [addressBarangays, setAddressBarangays] = useState<{value: string, label: string}[]>([])
  const [loadingAddressBarangays, setLoadingAddressBarangays] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    loadCustomerData()
    loadCouriers()
  }, [])

  useEffect(() => {
    if (locations.length > 0 && customer?.profile_city && !selectedProfileCity) {
      const match = locations.find(c => c.name === customer.profile_city)
      if (match) { setSelectedProfileCity(match.code); loadProfileBarangays(match.code) }
    }
  }, [locations, customer?.profile_city])

  async function loadCouriers() {
    try {
      const res = await fetch('/api/couriers')
      if (res.ok) { const data = await res.json(); setCouriers(data.couriers || []) }
    } catch (err) { console.error('Failed to load couriers:', err) }
  }

  async function loadAddressBarangays(cityCode: string) {
    setLoadingAddressBarangays(true); setAddressBarangays([])
    try { const b = await getBarangays(cityCode); setAddressBarangays(b.map(barangayToComboboxOption)) }
    catch (err) { console.error('Failed to load barangays:', err) }
    finally { setLoadingAddressBarangays(false) }
  }

  async function loadProfileBarangays(cityCode: string) {
    setLoadingProfileBarangays(true); setProfileBarangays([])
    try { const b = await getBarangays(cityCode); setProfileBarangays(b.map(barangayToComboboxOption)) }
    catch (err) { console.error('Failed to load profile barangays:', err) }
    finally { setLoadingProfileBarangays(false) }
  }

  async function loadCustomerData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/customer/login'); return }
      const { data: cust, error: custErr } = await supabase.from('customers').select('*').eq('user_id', user.id).single()
      if (custErr) {
        if (custErr.code === 'PGRST116') { setError('No customer profile linked. Please register first.'); return }
        throw custErr
      }
      setCustomer(cust)
      setEditedProfile({
        first_name: cust.first_name, last_name: cust.last_name, phone: cust.phone,
        contact_preference: cust.contact_preference,
        profile_street_address: cust.profile_street_address || '', profile_barangay: cust.profile_barangay || '',
        profile_city: cust.profile_city || '', profile_province: cust.profile_province || '',
        profile_region: cust.profile_region || '', profile_postal_code: cust.profile_postal_code || '',
      })
      setEditedDelivery(cust.delivery_method)
      setEditedCourier(cust.courier || undefined)
      const { data: addrs, error: addrErr } = await supabase.from('addresses').select('*').eq('customer_id', cust.id).order('is_default', { ascending: false })
      if (addrErr) throw addrErr
      setAddresses(addrs || [])
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load customer data') }
    finally { setIsLoading(false) }
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/customer/login'); router.refresh() }

  async function handleSaveProfile() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editedProfile) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const { customer: upd } = await res.json()
      setCustomer(prev => prev ? { ...prev, ...upd } : null)
      setIsEditingProfile(false)
      toast.success('Profile updated successfully')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update profile') }
    finally { setIsSaving(false) }
  }

  async function handleSaveDelivery() {
    setIsSaving(true)
    try {
      const courierToSave = editedDelivery === 'pickup' ? null : editedCourier
      const res = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delivery_method: editedDelivery, courier: courierToSave }) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const { customer: upd } = await res.json()
      setCustomer(prev => prev ? { ...prev, ...upd } : null)
      setIsEditingDelivery(false)
      toast.success('Delivery preference updated')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update delivery') }
    finally { setIsSaving(false) }
  }

  function handleDeliveryMethodChange(value: DeliveryMethod) {
    setEditedDelivery(value)
    if (value === 'pickup') { setEditedCourier(undefined) }
    else {
      const allowed = COURIER_OPTIONS[value] as readonly string[]
      if (editedCourier && !allowed.includes(editedCourier)) setEditedCourier(undefined)
    }
  }

  const hasProfileAddress = !!customer?.profile_city

  function handleCopyFromProfile() {
    if (!customer || !hasProfileAddress) return
    setAddressForm(prev => ({
      ...prev, first_name: customer.first_name, last_name: customer.last_name,
      street_address: customer.profile_street_address || '', barangay: customer.profile_barangay || '',
      city: customer.profile_city || '', province: customer.profile_province || '',
      region: customer.profile_region || '', postal_code: customer.profile_postal_code || '',
    }))
    toast.success('Profile address copied')
  }

  function openAddressDialog(address?: Address) {
    setSelectedAddressCity(''); setAddressBarangays([])
    if (address) {
      setEditingAddress(address)
      setAddressForm({
        first_name: address.first_name, last_name: address.last_name, label: address.label,
        street_address: address.street_address, barangay: address.barangay, city: address.city,
        province: address.province, region: address.region || '', postal_code: address.postal_code, is_default: address.is_default,
      })
      if (locations.length > 0) {
        const match = locations.find(c => c.name === address.city)
        if (match) { setSelectedAddressCity(match.code); loadAddressBarangays(match.code) }
      }
    } else {
      setEditingAddress(null)
      setAddressForm({
        first_name: customer?.first_name || '', last_name: customer?.last_name || '', label: '',
        street_address: '', barangay: '', city: '', province: '', region: '', postal_code: '', is_default: addresses.length === 0,
      })
    }
    setAddressDialogOpen(true)
  }

  async function handleSaveAddress() {
    setIsSaving(true)
    try {
      const url = editingAddress ? `/api/customer/addresses/${editingAddress.id}` : '/api/customer/addresses'
      const res = await fetch(url, { method: editingAddress ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addressForm) })
      if (!res.ok) {
        const e = await res.json()
        if (e.errors) { const msgs = Object.entries(e.errors).map(([f, m]) => `${f}: ${(m as string[]).join(', ')}`).join('; '); throw new Error(msgs || e.message) }
        throw new Error(e.message)
      }
      await loadCustomerData(); setAddressDialogOpen(false)
      toast.success(editingAddress ? 'Address updated' : 'Address added')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to save address') }
    finally { setIsSaving(false) }
  }

  async function handleDeleteAddress(addressId: string) {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}`, { method: 'DELETE' })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      await loadCustomerData(); toast.success('Address deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete address') }
  }

  async function handleSetDefaultAddress(addressId: string) {
    const addr = addresses.find(a => a.id === addressId)
    if (!addr) return
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...addr, is_default: true }) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      await loadCustomerData(); toast.success('Default address updated')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to set default') }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true)
    try {
      const res = await fetch('/api/customer/delete-account', { method: 'DELETE' })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      toast.success('Account deleted successfully'); router.push('/'); router.refresh()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete account'); setIsDeletingAccount(false) }
  }

  function handleProfileCitySelect(value: string) {
    const loc = getLocationByCode(value)
    if (loc) {
      setSelectedProfileCity(value)
      setEditedProfile(prev => ({ ...prev, profile_city: loc.name, profile_province: loc.province, profile_region: loc.region, profile_barangay: '' }))
      loadProfileBarangays(value)
    }
  }

  function handleProfileBarangaySelect(value: string) {
    const opt = profileBarangays.find(o => o.value === value)
    if (opt) setEditedProfile(prev => ({ ...prev, profile_barangay: opt.label }))
  }

  function handleAddressCitySelect(value: string) {
    const loc = getLocationByCode(value)
    if (loc) {
      setSelectedAddressCity(value)
      setAddressForm(prev => ({ ...prev, city: loc.name, province: loc.province, region: loc.region, barangay: '' }))
      loadAddressBarangays(value)
    }
  }

  function handleManageAddresses() {
    setActiveView('addresses')
  }

  function handleBackFromSettings() {
    setActiveView(null)
    setIsEditingProfile(false)
  }

  const defaultAddress = addresses.find(a => a.is_default)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
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
            <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-2">
                <Link href="/register"><Button>Register Now</Button></Link>
                <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!customer) return null

  // Show full-screen settings view if activeView is set
  if (activeView) {
    return (
      <>
        <SettingsViewComponent
          view={activeView}
          onBack={handleBackFromSettings}
          customer={customer}
          addresses={addresses}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          editedProfile={editedProfile}
          setEditedProfile={setEditedProfile}
          onSaveProfile={handleSaveProfile}
          isSaving={isSaving}
          cityOptions={cityOptions}
          isLoadingLocations={isLoadingLocations}
          selectedProfileCity={selectedProfileCity}
          profileBarangays={profileBarangays}
          loadingProfileBarangays={loadingProfileBarangays}
          onProfileCitySelect={handleProfileCitySelect}
          onProfileBarangaySelect={handleProfileBarangaySelect}
          onOpenAddressDialog={openAddressDialog}
          onDeleteAddress={handleDeleteAddress}
          onSetDefaultAddress={handleSetDefaultAddress}
          onDeleteAccount={handleDeleteAccount}
          isDeletingAccount={isDeletingAccount}
        />
        <AddressDialog
          open={addressDialogOpen}
          onOpenChange={setAddressDialogOpen}
          editingAddress={editingAddress}
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          onSave={handleSaveAddress}
          isSaving={isSaving}
          cityOptions={cityOptions}
          isLoadingLocations={isLoadingLocations}
          selectedAddressCity={selectedAddressCity}
          addressBarangays={addressBarangays}
          loadingAddressBarangays={loadingAddressBarangays}
          onAddressCitySelect={handleAddressCitySelect}
          hasProfileAddress={hasProfileAddress}
          onCopyFromProfile={handleCopyFromProfile}
        />
      </>
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <DashboardHeader
          greeting={greeting}
          customerName={customer.first_name}
          onMenuClick={() => setMenuOpen(true)}
        />
        <CustomerOrdersSection />
        <DeliveryPreferenceCard
          customer={customer}
          couriers={couriers}
          isEditing={isEditingDelivery}
          setIsEditing={setIsEditingDelivery}
          editedDelivery={editedDelivery}
          editedCourier={editedCourier}
          onDeliveryMethodChange={handleDeliveryMethodChange}
          onCourierChange={setEditedCourier}
          onSave={handleSaveDelivery}
          isSaving={isSaving}
        />
        {customer.delivery_method !== 'pickup' && (
          <DefaultAddressCard
            defaultAddress={defaultAddress}
            onManageAddresses={handleManageAddresses}
          />
        )}
      </div>

      <SettingsMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        customer={customer}
        onSelectView={setActiveView}
        onLogout={handleLogout}
      />

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        editingAddress={editingAddress}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        onSave={handleSaveAddress}
        isSaving={isSaving}
        cityOptions={cityOptions}
        isLoadingLocations={isLoadingLocations}
        selectedAddressCity={selectedAddressCity}
        addressBarangays={addressBarangays}
        loadingAddressBarangays={loadingAddressBarangays}
        onAddressCitySelect={handleAddressCitySelect}
        hasProfileAddress={hasProfileAddress}
        onCopyFromProfile={handleCopyFromProfile}
      />
    </div>
  )
}
