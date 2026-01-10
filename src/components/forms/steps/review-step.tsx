'use client'

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { User, Mail, Phone, MessageSquare, Truck, MapPin, Package } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CustomerWithAddressesFormData } from '@/lib/validations/customer'
import type { Courier } from '@/lib/types'

const deliveryMethodLabels = {
  pickup: 'Pick-up',
  delivered: 'Delivery',
  cod: 'Cash on Delivery',
}

const contactPreferenceLabels = {
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
}

export function ReviewStep() {
  const form = useFormContext<CustomerWithAddressesFormData>()
  const values = form.getValues()
  const { customer, addresses } = values
  const [couriers, setCouriers] = useState<Courier[]>([])

  const isPickup = customer.delivery_method === 'pickup'

  // Fetch couriers to display the name
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
      }
    }
    fetchCouriers()
  }, [])

  // Get courier display name
  const courierName = customer.courier
    ? couriers.find((c) => c.code === customer.courier)?.name || customer.courier.toUpperCase()
    : null

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{customer.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {customer.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {customer.phone || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Preference</p>
              <p className="font-medium flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                {contactPreferenceLabels[customer.contact_preference] || '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Badge variant={isPickup ? 'secondary' : 'default'} className="text-sm">
              {deliveryMethodLabels[customer.delivery_method]}
            </Badge>
          </div>
          {!isPickup && courierName && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Courier:</span>
              <span className="font-medium">{courierName}</span>
            </div>
          )}
          {isPickup && (
            <p className="text-sm text-muted-foreground">
              You will collect your orders in-store. No delivery address needed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Addresses - Only show for delivery/COD */}
      {!isPickup && addresses.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address{addresses.length > 1 ? 'es' : ''}
            </CardTitle>
            <CardDescription>
              {addresses.length} address{addresses.length > 1 ? 'es' : ''} saved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{address.label || `Address ${index + 1}`}</p>
                  {address.is_default && (
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.street_address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.barangay}, {address.city}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.province}
                  {address.region && `, ${address.region}`}
                  {' '}{address.postal_code}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Note */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Please review your information above. Click <strong>Submit Registration</strong> to complete your registration, or use the <strong>Back</strong> button to make changes.
        </p>
      </div>
    </div>
  )
}
