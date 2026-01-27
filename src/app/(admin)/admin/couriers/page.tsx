import { createClient } from '@/lib/supabase/server'
import { Courier } from '@/lib/types'
import { CourierList } from '@/components/admin/courier-list'
import { LogoutButton } from '@/components/admin/logout-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCouriers(): Promise<Courier[]> {
  const supabase = await createClient()

  const { data: couriers, error } = await supabase
    .from('couriers')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching couriers:', error)
    return []
  }

  return couriers || []
}

export default async function AdminCouriersPage() {
  const couriers = await getCouriers()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Courier Management</h1>
                <p className="text-sm text-muted-foreground">Manage delivery courier options</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CourierList initialCouriers={couriers} />
      </main>
    </div>
  )
}
