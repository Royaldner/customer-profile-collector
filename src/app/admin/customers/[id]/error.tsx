'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function CustomerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Customer detail error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Customer Details</h1>
            <p className="text-sm text-muted-foreground">Canada Goodies Inc.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to load customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load the customer details. The customer may not exist or there may be a connection issue.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => reset()} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
