'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusColor } from '@/lib/types/zoho'
import type { OrderDisplay } from '@/lib/types/zoho'

interface OrderCardProps {
  order: OrderDisplay
  onPayNow?: (order: OrderDisplay) => void
}

export function OrderCard({ order, onPayNow }: OrderCardProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    const value = amount ?? 0
    return `${order.currencySymbol || '₱'}${value.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{order.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>{order.statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Line items */}
        <div className="space-y-3">
          {(order.items || []).map((item, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-start justify-between">
                <span className="font-medium flex-1">{item.name}</span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
              {item.description && (
                <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
              )}
              <div className="text-muted-foreground text-xs mt-0.5">
                {item.quantity}{item.unit ? ` ${item.unit}` : ''} × {formatCurrency(item.rate)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="text-green-600">{formatCurrency(order.paid)}</span>
          </div>
          {(order.balance ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance</span>
              <span className="text-orange-600 font-medium">{formatCurrency(order.balance)}</span>
            </div>
          )}
        </div>

        {/* Due date for unpaid orders */}
        {(order.balance ?? 0) > 0 && order.dueDate && (
          <div className="text-xs text-muted-foreground">
            Due: {formatDate(order.dueDate)}
          </div>
        )}

        {/* Pay Now button */}
        {onPayNow && (order.balance ?? 0) > 0 && (
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={() => onPayNow(order)}
          >
            Pay Now
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
