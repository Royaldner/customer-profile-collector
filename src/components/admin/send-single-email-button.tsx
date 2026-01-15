'use client'

import { useState } from 'react'
import { Customer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { SendEmailDialog } from './send-email-dialog'
import { Mail } from 'lucide-react'

interface SendSingleEmailButtonProps {
  customer: Customer
}

export function SendSingleEmailButton({ customer }: SendSingleEmailButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </Button>
      <SendEmailDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        selectedCustomers={[customer]}
        onSuccess={() => {}}
      />
    </>
  )
}
