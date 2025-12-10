'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Customer, Address } from '@/lib/types'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomerData() {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/customer/login')
          return
        }

        // Fetch customer data linked to this user
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (customerError) {
          if (customerError.code === 'PGRST116') {
            // No customer profile found - user needs to register
            setError('No customer profile linked to this account. Please register first.')
            return
          }
          throw customerError
        }

        setCustomer(customerData)

        // Fetch addresses
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

    loadCustomerData()
  }, [supabase, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/customer/login')
    router.refresh()
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
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer.name}</p>
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
          </CardContent>
        </Card>

        {/* Delivery Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Preference</CardTitle>
            <CardDescription>How you receive your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={customer.delivery_method === 'pickup' ? 'secondary' : 'default'}>
              {deliveryMethodLabels[customer.delivery_method]}
            </Badge>
          </CardContent>
        </Card>

        {/* Addresses - Only show if not pickup */}
        {customer.delivery_method !== 'pickup' && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Addresses</CardTitle>
              <CardDescription>
                {addresses.length === 0
                  ? 'No addresses saved'
                  : `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-muted-foreground">You haven&apos;t added any addresses yet.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.label}</span>
                        {address.is_default && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
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
    </div>
  )
}
