import { createClient } from '@/lib/supabase/server'
import { Customer } from '@/lib/types'
import { CustomerList } from '@/components/admin/customer-list'
import { LogoutButton } from '@/components/admin/logout-button'

export const dynamic = 'force-dynamic'

async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      *,
      addresses (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return customers || []
}

export default async function AdminPage() {
  const customers = await getCustomers()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Canada Goodies Inc.</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CustomerList initialCustomers={customers} />
      </main>
    </div>
  )
}
