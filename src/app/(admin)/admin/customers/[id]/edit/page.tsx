import { createClient } from '@/lib/supabase/server'
import { Customer } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/admin/logout-button'
import { EditCustomerForm } from '@/components/admin/edit-customer-form'

export const dynamic = 'force-dynamic'

interface EditCustomerPageProps {
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

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Edit Customer</h1>
              <p className="text-sm text-muted-foreground">{customer.first_name} {customer.last_name}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/customers/${id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <EditCustomerForm customer={customer} />
      </main>
    </div>
  )
}
