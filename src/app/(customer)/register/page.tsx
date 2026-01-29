import { CustomerForm } from '@/components/forms/customer-form'
import { AuthHeader } from '@/components/auth/auth-header'

export const metadata = {
  title: 'Customer Registration | Customer Profile Collector',
  description: 'Register as a customer and provide your contact information',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 relative">
      <AuthHeader />
      <div className="mx-auto max-w-2xl pt-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Customer Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill out the form below to register as a customer
          </p>
        </div>

        <CustomerForm />
      </div>
    </div>
  )
}
