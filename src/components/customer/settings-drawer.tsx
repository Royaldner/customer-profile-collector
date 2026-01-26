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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { LocationCombobox } from '@/components/ui/location-combobox'
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Star,
  Copy,
  Loader2,
  LogOut,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Customer, Address, Courier } from '@/lib/types'

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
  addresses: Address[]
  couriers: Courier[]
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
  onLogout: () => Promise<void>
  onDeleteAccount: () => Promise<void>
  isDeletingAccount: boolean
  // Section to expand on open
  initialSection?: 'addresses' | null
}

export function SettingsDrawer({
  open,
  onOpenChange,
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
  onLogout,
  onDeleteAccount,
  isDeletingAccount,
  initialSection,
}: SettingsDrawerProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: false,
    addresses: initialSection === 'addresses',
    account: false,
    danger: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // When drawer opens with initialSection, expand that section
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && initialSection === 'addresses') {
      setOpenSections(prev => ({ ...prev, addresses: true }))
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your profile and preferences</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Personal Information Section */}
          <Collapsible
            open={openSections.personal}
            onOpenChange={() => toggleSection('personal')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 font-medium hover:bg-muted/50">
              <span>Personal Information</span>
              {openSections.personal ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-4">
              <PersonalInfoSection
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
            </CollapsibleContent>
          </Collapsible>

          {/* Delivery Addresses Section */}
          {customer.delivery_method !== 'pickup' && (
            <Collapsible
              open={openSections.addresses}
              onOpenChange={() => toggleSection('addresses')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 font-medium hover:bg-muted/50">
                <span>Delivery Addresses</span>
                {openSections.addresses ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-4">
                <AddressesSection
                  addresses={addresses}
                  onOpenAddressDialog={onOpenAddressDialog}
                  onDeleteAddress={onDeleteAddress}
                  onSetDefaultAddress={onSetDefaultAddress}
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Account Section */}
          <Collapsible
            open={openSections.account}
            onOpenChange={() => toggleSection('account')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 font-medium hover:bg-muted/50">
              <span>Account</span>
              {openSections.account ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Member since:</span>{' '}
                  {formatDate(customer.created_at)}
                </p>
                <p>
                  <span className="text-muted-foreground">Last updated:</span>{' '}
                  {formatDate(customer.updated_at)}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Danger Zone Section */}
          <Collapsible
            open={openSections.danger}
            onOpenChange={() => toggleSection('danger')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-destructive/50 p-4 font-medium hover:bg-destructive/5">
              <span className="text-destructive">Danger Zone</span>
              {openSections.danger ? (
                <ChevronDown className="h-4 w-4 text-destructive" />
              ) : (
                <ChevronRight className="h-4 w-4 text-destructive" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-4">
              <DangerZoneSection
                onDeleteAccount={onDeleteAccount}
                isDeletingAccount={isDeletingAccount}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Personal Info Section Component
function PersonalInfoSection({
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
  editedProfile: SettingsDrawerProps['editedProfile']
  setEditedProfile: SettingsDrawerProps['setEditedProfile']
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="drawer-first-name">First Name</Label>
            <Input
              id="drawer-first-name"
              value={editedProfile.first_name}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, first_name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawer-last-name">Last Name</Label>
            <Input
              id="drawer-last-name"
              value={editedProfile.last_name}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, last_name: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drawer-email">Email</Label>
          <Input id="drawer-email" value={customer.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drawer-phone">Phone</Label>
          <Input
            id="drawer-phone"
            value={editedProfile.phone}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="drawer-contact-pref">Contact Preference</Label>
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
        <div className="pt-4 border-t space-y-4">
          <h4 className="font-medium text-sm">Profile Address (Optional)</h4>
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

        <div className="flex gap-2">
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Name</p>
          <p className="font-medium">
            {customer.first_name} {customer.last_name}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{customer.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Contact Preference</p>
          <p className="font-medium capitalize">{customer.contact_preference}</p>
        </div>
      </div>
      {customer.profile_city && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Profile Address</p>
          <div className="text-sm space-y-1">
            {customer.profile_street_address && (
              <p className="font-medium">{customer.profile_street_address}</p>
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

// Addresses Section Component
function AddressesSection({
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
      <div className="text-center py-4">
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
        <div key={address.id} className="p-3 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{address.label}</span>
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
                  className="h-7 w-7"
                  onClick={() => onSetDefaultAddress(address.id)}
                  title="Set as default"
                >
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onOpenAddressDialog(address)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
          <p className="text-sm font-medium">
            {address.first_name} {address.last_name}
          </p>
          <p className="text-xs text-muted-foreground">{address.street_address}</p>
          <p className="text-xs text-muted-foreground">
            {address.barangay}, {address.city}
          </p>
          <p className="text-xs text-muted-foreground">
            {address.province} {address.postal_code}
          </p>
        </div>
      ))}
      {addresses.length < 3 && (
        <Button
          variant="outline"
          size="sm"
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

// Danger Zone Section Component
function DangerZoneSection({
  onDeleteAccount,
  isDeletingAccount,
}: {
  onDeleteAccount: () => Promise<void>
  isDeletingAccount: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Delete Account</p>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all data
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeletingAccount}>
            {isDeletingAccount ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
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
  )
}
