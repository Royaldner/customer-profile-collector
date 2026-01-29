import { Search, ShoppingCart, Plane, UserRound, Package } from 'lucide-react'

export interface Step {
  icon: typeof Search
  title: string
  description: string
  step: number
}

export const steps: Step[] = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Explore our curated deals on premium Canadian brands from our Facebook page',
    step: 1,
  },
  {
    icon: ShoppingCart,
    title: 'Order',
    description: 'Place your order with flexible payment',
    step: 2,
  },
  {
    icon: Plane,
    title: 'Ship',
    description: 'We ship directly from Canada to the Philippines',
    step: 3,
  },
  {
    icon: UserRound,
    title: 'Track',
    description: 'Track your payment and order status and shipping progress on your account',
    step: 4,
  },
  {
    icon: Package,
    title: 'Receive',
    description: 'Get your items delivered or pick up at your convenience',
    step: 5,
  },
]
