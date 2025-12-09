import { createClient } from '@/lib/supabase/server'
import { Customer } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/admin/logout-button'
import { DeleteCustomerDialog } from '@/components/admin/delete-customer-dialog'
import { SetDefaultAddressButton } from '@/components/admin/set-default-address-button'

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

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Customer Details</h1>
              <p className="text-sm text-muted-foreground">{customer.name}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline">Back to List</Button>
              </Link>
              <Link href={`/admin/customers/${id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteCustomerDialog customerId={id} customerName={customer.name} />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{customer.name}</p>
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
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Registered</label>
                    <p>{formatDate(customer.created_at)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Last Updated</label>
                    <p>{formatDate(customer.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses Card */}
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
        </div>
      </main>
    </div>
  )
}
