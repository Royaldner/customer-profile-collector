import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Customer Profile Collector
          </CardTitle>
          <CardDescription>
            Customer profile collection system for small businesses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Register as a customer to provide your contact information and
            delivery addresses.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg">
              <Link href="/register">Register Now</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
