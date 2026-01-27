import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function CustomerDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-6 w-48" />
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="mt-1 h-4 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-4 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-7 w-28" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
