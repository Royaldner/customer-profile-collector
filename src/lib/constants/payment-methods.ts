export interface CopyableField {
  label: string
  value: string
  note?: string
}

export interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
  qrImagePath: string
  instructions: string[]
  fields: CopyableField[]
}

export interface OrderPaymentContext {
  invoiceNumber: string
  amount: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay via GCash',
    icon: 'Smartphone',
    qrImagePath: '/images/gcash-qr.png',
    instructions: [
      'Click Pay Now button on your recent order to open the QR code and account information',
      'Open GCash App',
      'Scan QR code or Click Send and copy the account number provided',
      'Add account details or Amount (for QR Code)',
      'Add in Notes the Invoice Number (Optional)',
      'Review and Confirm Transaction',
      'Screenshoot the transaction and send it to us via Facebook Messenger',
    ],
    fields: [
      { label: 'Account Number', value: '09301697375' },
    ],
  },
  {
    id: 'bpi',
    name: 'BPI',
    description: 'Bank transfer',
    icon: 'Landmark',
    qrImagePath: '/images/bpi-qr.png',
    instructions: [
      'Click Pay Now button on your recent order to open the QR code and account information',
      'Open Your Bank App or WebApp',
      'Select "Transfer Money" or "Move Money"',
      'Scan the QR Code or copy the account information provided',
      'Enter the amount to transfer',
      'Add in Notes the Invoice Number (Optional)',
      'Review and Confirm Transaction',
      'Screenshoot the transaction and send it to us via Facebook Messenger',
    ],
    fields: [
      { label: 'Account Name', value: 'Perpee Berse' },
      { label: 'Account Number', value: '9319317497' },
    ],
  },
]
