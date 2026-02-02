'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { CopyableField, PaymentMethod, OrderPaymentContext } from '@/lib/constants/payment-methods'

interface PaymentModalProps {
  method: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
  orderContext?: OrderPaymentContext
}

function CopyField({ field }: { field: CopyableField }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const success = await copyToClipboard(field.value)
    if (success) {
      setCopied(true)
      toast.success(`${field.label} copied!`)
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm">
          {field.value}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleCopy}
          aria-label={`Copy ${field.label}`}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
        {field.note && (
          <p className="text-xs text-muted-foreground italic">{field.note}</p>
        )}
      </div>
    </div>
  )
}

export function PaymentModal({ method, open, onOpenChange, orderContext }: PaymentModalProps) {
  const [qrError, setQrError] = useState(false)

  if (!method) return null

  const orderFields: CopyableField[] = orderContext
    ? [
        { label: 'Invoice Number', value: orderContext.invoiceNumber },
        { label: 'Amount', value: orderContext.amount, note: '50% required upon order' },
      ]
    : []

  const allFields = [...orderFields, ...method.fields]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay with {method.name}</DialogTitle>
          <DialogDescription>{method.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!qrError && (
            <div className="flex justify-center">
              <Image
                src={method.qrImagePath}
                alt={`${method.name} QR Code`}
                width={200}
                height={200}
                className="rounded-lg"
                onError={() => setQrError(true)}
              />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              {method.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-3">
            {allFields.map((field) => (
              <CopyField key={field.label} field={field} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
