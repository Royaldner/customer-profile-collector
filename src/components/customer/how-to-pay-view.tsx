'use client'

import { useState } from 'react'
import { ArrowLeft, Smartphone, Landmark, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PaymentModal } from './payment-modal'
import { PAYMENT_METHODS, type PaymentMethod, type OrderPaymentContext } from '@/lib/constants/payment-methods'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Landmark,
}

interface HowToPayViewProps {
  onBack: () => void
  orderContext?: OrderPaymentContext
}

export function HowToPayView({ onBack, orderContext }: HowToPayViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  const title = orderContext
    ? `Pay for ${orderContext.invoiceNumber}`
    : 'How to Pay'

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.icon]
          return (
            <Card
              key={method.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setSelectedMethod(method)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                {Icon && <Icon className="h-6 w-6 text-primary shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <PaymentModal
        method={selectedMethod}
        open={!!selectedMethod}
        onOpenChange={(open) => { if (!open) setSelectedMethod(null) }}
        orderContext={orderContext}
      />
    </div>
  )
}
