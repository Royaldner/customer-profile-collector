'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { LocationCombobox } from '@/components/ui/location-combobox'
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Star,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Customer, Address } from '@/lib/types'
import type { SettingsView } from './settings-menu'

interface SettingsViewProps {
  view: SettingsView
  onBack: () => void
  customer: Customer
  addresses: Address[]
  // Profile editing
  isEditingProfile: boolean
  setIsEditingProfile: (editing: boolean) => void
  editedProfile: {
    first_name: string
    last_name: string
    phone: string
    contact_preference: 'email' | 'sms'
    profile_street_address: string
    profile_barangay: string
    profile_city: string
    profile_province: string
    profile_region: string
    profile_postal_code: string
  }
  setEditedProfile: React.Dispatch<React.SetStateAction<{
    first_name: string
    last_name: string
    phone: string
    contact_preference: 'email' | 'sms'
    profile_street_address: string
    profile_barangay: string
    profile_city: string
    profile_province: string
    profile_region: string
    profile_postal_code: string
  }>>
  onSaveProfile: () => Promise<void>
  isSaving: boolean
  // Profile address autocomplete
  cityOptions: { value: string; label: string }[]
  isLoadingLocations: boolean
  selectedProfileCity: string
  profileBarangays: { value: string; label: string }[]
  loadingProfileBarangays: boolean
  onProfileCitySelect: (value: string) => void
  onProfileBarangaySelect: (value: string) => void
  // Address management
  onOpenAddressDialog: (address?: Address) => void
  onDeleteAddress: (addressId: string) => Promise<void>
  onSetDefaultAddress: (addressId: string) => Promise<void>
  // Account actions
  onDeleteAccount: () => Promise<void>
  isDeletingAccount: boolean
}

export function SettingsViewComponent({
  view,
  onBack,
  customer,
  addresses,
  isEditingProfile,
  setIsEditingProfile,
  editedProfile,
  setEditedProfile,
  onSaveProfile,
  isSaving,
  cityOptions,
  isLoadingLocations,
  selectedProfileCity,
  profileBarangays,
  loadingProfileBarangays,
  onProfileCitySelect,
  onProfileBarangaySelect,
  onOpenAddressDialog,
  onDeleteAddress,
  onSetDefaultAddress,
  onDeleteAccount,
  isDeletingAccount,
}: SettingsViewProps) {
  if (!view) return null

  const titles: Record<NonNullable<SettingsView>, string> = {
    personal: 'Personal Information',
    addresses: 'Delivery Addresses',
    account: 'Account',
    danger: 'Danger Zone',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{titles[view]}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {view === 'personal' && (
          <PersonalInfoView
            customer={customer}
            isEditing={isEditingProfile}
            setIsEditing={setIsEditingProfile}
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            onSave={onSaveProfile}
            isSaving={isSaving}
            cityOptions={cityOptions}
            isLoadingLocations={isLoadingLocations}
            selectedProfileCity={selectedProfileCity}
            profileBarangays={profileBarangays}
            loadingProfileBarangays={loadingProfileBarangays}
            onProfileCitySelect={onProfileCitySelect}
            onProfileBarangaySelect={onProfileBarangaySelect}
          />
        )}
        {view === 'addresses' && (
          <AddressesView
            addresses={addresses}
            onOpenAddressDialog={onOpenAddressDialog}
            onDeleteAddress={onDeleteAddress}
            onSetDefaultAddress={onSetDefaultAddress}
          />
        )}
        {view === 'account' && <AccountView customer={customer} />}
        {view === 'danger' && (
          <DangerZoneView
            onDeleteAccount={onDeleteAccount}
            isDeletingAccount={isDeletingAccount}
          />
        )}
      </div>
    </div>
  )
}

// Personal Info View
function PersonalInfoView({
  customer,
  isEditing,
  setIsEditing,
  editedProfile,
  setEditedProfile,
  onSave,
  isSaving,
  cityOptions,
  isLoadingLocations,
  selectedProfileCity,
  profileBarangays,
  loadingProfileBarangays,
  onProfileCitySelect,
  onProfileBarangaySelect,
}: {
  customer: Customer
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  editedProfile: SettingsViewProps['editedProfile']
  setEditedProfile: SettingsViewProps['setEditedProfile']
  onSave: () => Promise<void>
  isSaving: boolean
  cityOptions: { value: string; label: string }[]
  isLoadingLocations: boolean
  selectedProfileCity: string
  profileBarangays: { value: string; label: string }[]
  loadingProfileBarangays: boolean
  onProfileCitySelect: (value: string) => void
  onProfileBarangaySelect: (value: string) => void
}) {
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={editedProfile.first_name}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, first_name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={editedProfile.last_name}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, last_name: e.target.value }))
              }
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
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-pref">Contact Preference</Label>
          <Select
            value={editedProfile.contact_preference}
            onValueChange={(value: 'email' | 'sms') =>
              setEditedProfile((prev) => ({ ...prev, contact_preference: value }))
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

        {/* Profile Address Section */}
        <div className="pt-6 border-t space-y-4">
          <h3 className="font-medium">Profile Address (Optional)</h3>
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              placeholder="House/Unit No., Street Name"
              value={editedProfile.profile_street_address}
              onChange={(e) =>
                setEditedProfile((prev) => ({
                  ...prev,
                  profile_street_address: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>City/Municipality</Label>
            {isLoadingLocations ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading locations...</span>
              </div>
            ) : (
              <LocationCombobox
                options={cityOptions}
                value={selectedProfileCity}
                onValueChange={onProfileCitySelect}
                placeholder="Search city/municipality..."
                searchPlaceholder="Type to search..."
                emptyText="No city found"
              />
            )}
            {!selectedProfileCity && editedProfile.profile_city && (
              <p className="text-xs text-muted-foreground">
                Current: {editedProfile.profile_city}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Barangay</Label>
            {loadingProfileBarangays ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading barangays...</span>
              </div>
            ) : profileBarangays.length > 0 ? (
              <LocationCombobox
                options={profileBarangays}
                value={
                  profileBarangays.find((b) => b.label === editedProfile.profile_barangay)
                    ?.value || ''
                }
                onValueChange={onProfileBarangaySelect}
                placeholder="Select barangay..."
                searchPlaceholder="Type to search..."
                emptyText="No barangay found"
              />
            ) : (
              <Input
                placeholder="Barangay name"
                value={editedProfile.profile_barangay}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    profile_barangay: e.target.value,
                  }))
                }
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Province</Label>
              <Input
                placeholder="Province"
                value={editedProfile.profile_province}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    profile_province: e.target.value,
                  }))
                }
                className={selectedProfileCity ? 'bg-muted' : ''}
                readOnly={!!selectedProfileCity}
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input
                placeholder="e.g., NCR"
                value={editedProfile.profile_region}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    profile_region: e.target.value,
                  }))
                }
                className={selectedProfileCity ? 'bg-muted' : ''}
                readOnly={!!selectedProfileCity}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input
              placeholder="4 digits"
              maxLength={4}
              value={editedProfile.profile_postal_code}
              onChange={(e) =>
                setEditedProfile((prev) => ({
                  ...prev,
                  profile_postal_code: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">First Name</p>
            <p className="font-medium">{customer.first_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Last Name</p>
            <p className="font-medium">{customer.last_name}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{customer.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Phone</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Contact Preference</p>
          <p className="font-medium capitalize">{customer.contact_preference}</p>
        </div>
      </div>

      {customer.profile_city && (
        <div className="pt-6 border-t space-y-2">
          <h3 className="font-medium">Profile Address</h3>
          <div className="text-sm space-y-1">
            {customer.profile_street_address && (
              <p>{customer.profile_street_address}</p>
            )}
            <p>
              {customer.profile_barangay}, {customer.profile_city}
            </p>
            <p>
              {customer.profile_province} {customer.profile_postal_code}
            </p>
            {customer.profile_region && (
              <p className="text-muted-foreground">{customer.profile_region}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Addresses View
function AddressesView({
  addresses,
  onOpenAddressDialog,
  onDeleteAddress,
  onSetDefaultAddress,
}: {
  addresses: Address[]
  onOpenAddressDialog: (address?: Address) => void
  onDeleteAddress: (addressId: string) => Promise<void>
  onSetDefaultAddress: (addressId: string) => Promise<void>
}) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No addresses yet</p>
        <Button onClick={() => onOpenAddressDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Address
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{address.label}</span>
              {address.is_default && (
                <Badge variant="outline" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              {!address.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSetDefaultAddress(address.id)}
                  title="Set as default"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenAddressDialog(address)}
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
                      Are you sure you want to delete &quot;{address.label}&quot;? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteAddress(address.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <p className="font-medium">
            {address.first_name} {address.last_name}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{address.street_address}</p>
            <p>
              {address.barangay}, {address.city}
            </p>
            <p>
              {address.province} {address.postal_code}
            </p>
          </div>
        </div>
      ))}
      {addresses.length < 3 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOpenAddressDialog()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      )}
    </div>
  )
}

// Account View
function AccountView({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Member since</p>
        <p className="font-medium">{formatDate(customer.created_at)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Last updated</p>
        <p className="font-medium">{formatDate(customer.updated_at)}</p>
      </div>
    </div>
  )
}

// Danger Zone View
function DangerZoneView({
  onDeleteAccount,
  isDeletingAccount,
}: {
  onDeleteAccount: () => Promise<void>
  isDeletingAccount: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
        <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeletingAccount}>
              {isDeletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data including:
                </span>
                <ul className="list-disc list-inside text-sm">
                  <li>Your profile information</li>
                  <li>All saved addresses</li>
                  <li>Order history and preferences</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
