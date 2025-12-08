import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata = {
  title: 'Registration Successful | Customer Profile Collector',
  description: 'Your customer registration has been completed successfully',
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const customerId = params.id

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Registration Successful!</CardTitle>
          <CardDescription>
            Thank you for registering with us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your customer profile has been created successfully. We will contact
            you using your preferred method of communication.
          </p>

          {customerId && (
            <p className="text-sm text-muted-foreground">
              Reference ID: <code className="font-mono">{customerId}</code>
            </p>
          )}

          <div className="pt-4">
            <Button asChild>
              <Link href="/register">Register Another Customer</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
