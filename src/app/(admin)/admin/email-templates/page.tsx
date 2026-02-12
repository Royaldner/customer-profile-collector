import { createAdminClient } from '@/lib/supabase/admin'
import { EmailTemplate } from '@/lib/types'
import { EmailTemplateList } from '@/components/admin/email-template-list'
import { LogoutButton } from '@/components/admin/logout-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = createAdminClient()

  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('display_name', { ascending: true })

  if (error) {
    console.error('Error fetching email templates:', error)
    return []
  }

  // Normalize variables: JSONB may return string if double-stringified
  return (templates || []).map((t) => ({
    ...t,
    variables: typeof t.variables === 'string' ? JSON.parse(t.variables) : (t.variables || []),
  }))
}

export default async function AdminEmailTemplatesPage() {
  const templates = await getEmailTemplates()

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
                <h1 className="text-2xl font-bold text-primary">Email Templates</h1>
                <p className="text-sm text-muted-foreground">Manage email notification templates</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <EmailTemplateList initialTemplates={templates} />
      </main>
    </div>
  )
}
