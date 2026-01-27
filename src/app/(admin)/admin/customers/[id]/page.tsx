import { createClient } from '@/lib/supabase/server'
import { Customer, Courier, DeliveryLog } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Check, Clock, PackageCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/admin/logout-button'
import { DeleteCustomerDialog } from '@/components/admin/delete-customer-dialog'
import { SetDefaultAddressButton } from '@/components/admin/set-default-address-button'
import { SendSingleEmailButton } from '@/components/admin/send-single-email-button'
import { StatusActionButtons } from '@/components/admin/status-action-buttons'
import { ZohoSection } from '@/components/admin/zoho-section'

export const dynamic = 'force-dynamic'

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      addresses (*)
    `)
    .eq('id', id)
    .single()

  if (error || !customer) {
    return null
  }

  return customer
}

const contactPreferenceLabels = {
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
}

const deliveryMethodLabels = {
  pickup: 'Pick-up',
  delivered: 'Delivery',
  cod: 'Cash on Delivery',
  cop: 'Cash on Pickup',
}

async function getCouriers(): Promise<Courier[]> {
  const supabase = await createClient()
  const { data: couriers } = await supabase
    .from('couriers')
    .select('*')
    .order('name', { ascending: true })
  return couriers || []
}

async function getDeliveryLogs(customerId: string): Promise<DeliveryLog[]> {
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('delivery_logs')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return logs || []
}

const deliveryActionLabels = {
  confirmed: 'Confirmed Ready to Ship',
  delivered: 'Marked as Delivered',
  reset: 'Reset to Pending',
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params
  const [customer, couriers, deliveryLogs] = await Promise.all([
    getCustomer(id),
    getCouriers(),
    getDeliveryLogs(id)
  ])

  if (!customer) {
    notFound()
  }

  const isPickup = customer.delivery_method === 'pickup'
  const courierName = customer.courier
    ? couriers.find((c) => c.code === customer.courier)?.name || customer.courier.toUpperCase()
    : null

  // Determine delivery status
  const isDelivered = !!customer.delivered_at
  const isReadyToShip = !!customer.delivery_confirmed_at && !isDelivered
  const isPending = !customer.delivery_confirmed_at

  const getStatusBadge = () => {
    if (isDelivered) {
      return (
        <Badge variant="outline" className="border-green-600 text-green-600">
          <PackageCheck className="mr-1 h-3 w-3" />
          Delivered
        </Badge>
      )
    }
    if (isReadyToShip) {
      return (
        <Badge variant="default">
          <Check className="mr-1 h-3 w-3" />
          Ready to Ship
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">Customer Details</h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{customer.first_name} {customer.last_name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Back to List</Link>
              </Button>
              <StatusActionButtons
                customerId={id}
                isReadyToShip={isReadyToShip}
                isDelivered={isDelivered}
              />
              <SendSingleEmailButton customer={customer} />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/customers/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <DeleteCustomerDialog customerId={id} customerName={`${customer.first_name} ${customer.last_name}`} />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{customer.first_name} {customer.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg">
                  <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                    {customer.phone}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Contact Preference
                </label>
                <p className="mt-1">
                  <Badge>{contactPreferenceLabels[customer.contact_preference]}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Delivery Method
                </label>
                <p className="mt-1">
                  <Badge variant={isPickup ? 'secondary' : 'default'}>
                    {deliveryMethodLabels[customer.delivery_method]}
                  </Badge>
                </p>
              </div>
              {!isPickup && courierName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Preferred Courier
                  </label>
                  <p className="text-lg">{courierName}</p>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Registered</label>
                    <p>{formatDate(customer.created_at, true)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Last Updated</label>
                    <p>{formatDate(customer.updated_at, true)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Address Card - Only show if customer has a profile address */}
          {customer.profile_street_address && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{customer.profile_street_address}</p>
                  <p>
                    Barangay {customer.profile_barangay}, {customer.profile_city}
                  </p>
                  <p>
                    {customer.profile_province}
                    {customer.profile_region && `, ${customer.profile_region}`}
                  </p>
                  <p>{customer.profile_postal_code}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses Card - Only show for delivery/COD */}
          {!isPickup ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Addresses ({customer.addresses?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.addresses && customer.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {customer.addresses
                      .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
                      .map((address) => (
                        <div
                          key={address.id}
                          className={`rounded-lg border p-4 ${
                            address.is_default ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.label}</span>
                              {address.is_default && (
                                <Badge variant="default">Default</Badge>
                              )}
                            </div>
                            <SetDefaultAddressButton
                              addressId={address.id}
                              isDefault={address.is_default}
                            />
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{address.first_name} {address.last_name}</p>
                            <p>{address.street_address}</p>
                            <p>
                              Barangay {address.barangay}, {address.city}
                            </p>
                            <p>
                              {address.province}
                              {address.region && `, ${address.region}`}
                            </p>
                            <p>{address.postal_code}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No addresses on file.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This customer uses pick-up. No delivery address required.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Zoho Books Section */}
          <ZohoSection
            customerId={id}
            customerName={`${customer.first_name} ${customer.last_name}`}
            customerEmail={customer.email}
            zohoContactId={customer.zoho_contact_id || null}
            zohoSyncStatus={customer.zoho_sync_status}
            isReturningCustomer={customer.is_returning_customer}
            zohoSyncError={customer.zoho_sync_error}
          />

          {/* Delivery Logs Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveryLogs.length > 0 ? (
                <div className="space-y-3">
                  {deliveryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {deliveryActionLabels[log.action]}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.created_at, true)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No delivery history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
