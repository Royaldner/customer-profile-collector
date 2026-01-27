import { Building2, Smartphone, CreditCard } from 'lucide-react'

export interface PaymentMethod {
  icon: typeof Building2
  name: string
  description: string
  available: boolean
  comingSoon?: boolean
}

export const paymentMethods: PaymentMethod[] = [
  {
    icon: Building2,
    name: 'BPI Bank Transfer',
    description: 'Direct bank transfer to our BPI account',
    available: true,
  },
  {
    icon: Smartphone,
    name: 'GCash',
    description: 'Fast and convenient mobile payment',
    available: true,
  },
  {
    icon: CreditCard,
    name: 'Credit Card',
    description: 'Visa, Mastercard, and more',
    available: false,
    comingSoon: true,
  },
]
