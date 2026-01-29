'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { Copy, Loader2 } from 'lucide-react'
import type { Address, Customer } from '@/lib/types'

interface AddressFormData {
  first_name: string
  last_name: string
  label: string
  street_address: string
  barangay: string
  city: string
  province: string
  region: string
  postal_code: string
  is_default: boolean
}

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAddress: Address | null
  addressForm: AddressFormData
  setAddressForm: React.Dispatch<React.SetStateAction<AddressFormData>>
  onSave: () => Promise<void>
  isSaving: boolean
  // Location autocomplete
  cityOptions: { value: string; label: string }[]
  isLoadingLocations: boolean
  selectedAddressCity: string
  addressBarangays: { value: string; label: string }[]
  loadingAddressBarangays: boolean
  onAddressCitySelect: (value: string) => void
  // Profile copy
  hasProfileAddress: boolean
  onCopyFromProfile: () => void
}

export function AddressDialog({
  open,
  onOpenChange,
  editingAddress,
  addressForm,
  setAddressForm,
  onSave,
  isSaving,
  cityOptions,
  isLoadingLocations,
  selectedAddressCity,
  addressBarangays,
  loadingAddressBarangays,
  onAddressCitySelect,
  hasProfileAddress,
  onCopyFromProfile,
}: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
          <DialogDescription>
            {editingAddress ? 'Update your address details' : 'Add a new delivery address'}
          </DialogDescription>
          {hasProfileAddress && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCopyFromProfile}
              className="w-fit mt-2"
            >
              <Copy className="mr-1.5 h-3 w-3" />
              Use my address
            </Button>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addr-first-name">First Name</Label>
              <Input
                id="addr-first-name"
                placeholder="Juan"
                value={addressForm.first_name}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, first_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-last-name">Last Name</Label>
              <Input
                id="addr-last-name"
                placeholder="Dela Cruz"
                value={addressForm.last_name}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, last_name: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-label">Label</Label>
            <Input
              id="addr-label"
              placeholder="e.g., Home, Work"
              value={addressForm.label}
              onChange={(e) =>
                setAddressForm((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-street">Street Address</Label>
            <Input
              id="addr-street"
              placeholder="House/Unit No., Street Name"
              value={addressForm.street_address}
              onChange={(e) =>
                setAddressForm((prev) => ({ ...prev, street_address: e.target.value }))
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
                value={selectedAddressCity}
                onValueChange={onAddressCitySelect}
                placeholder="Search city/municipality..."
                searchPlaceholder="Type to search..."
                emptyText="No city found"
              />
            )}
            {!selectedAddressCity && addressForm.city && (
              <p className="text-xs text-muted-foreground">Current: {addressForm.city}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Barangay</Label>
            {loadingAddressBarangays ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading barangays...</span>
              </div>
            ) : addressBarangays.length > 0 ? (
              <LocationCombobox
                options={addressBarangays}
                value={
                  addressBarangays.find((b) => b.label === addressForm.barangay)?.value ||
                  ''
                }
                onValueChange={(value) => {
                  const option = addressBarangays.find((o) => o.value === value)
                  if (option)
                    setAddressForm((prev) => ({ ...prev, barangay: option.label }))
                }}
                placeholder="Select barangay..."
                searchPlaceholder="Type to search..."
                emptyText="No barangay found"
              />
            ) : (
              <Input
                placeholder="Barangay name"
                value={addressForm.barangay}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, barangay: e.target.value }))
                }
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addr-province">Province</Label>
              <Input
                id="addr-province"
                placeholder="Province"
                value={addressForm.province}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, province: e.target.value }))
                }
                className={selectedAddressCity ? 'bg-muted' : ''}
                readOnly={!!selectedAddressCity}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-region">Region</Label>
              <Input
                id="addr-region"
                placeholder="e.g., NCR"
                value={addressForm.region}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, region: e.target.value }))
                }
                className={selectedAddressCity ? 'bg-muted' : ''}
                readOnly={!!selectedAddressCity}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-postal">Postal Code</Label>
            <Input
              id="addr-postal"
              placeholder="4 digits"
              maxLength={4}
              value={addressForm.postal_code}
              onChange={(e) =>
                setAddressForm((prev) => ({ ...prev, postal_code: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="addr-default"
              checked={addressForm.is_default}
              onChange={(e) =>
                setAddressForm((prev) => ({ ...prev, is_default: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="addr-default" className="cursor-pointer">
              Set as default address
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Address'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { AddressFormData }
