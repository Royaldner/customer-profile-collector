import { Search, ShoppingCart, Plane, Package } from 'lucide-react'

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
    description: 'Explore our curated deals on premium Canadian brands',
    step: 1,
  },
  {
    icon: ShoppingCart,
    title: 'Order',
    description: 'Create your profile and place your order with flexible payment',
    step: 2,
  },
  {
    icon: Plane,
    title: 'Ship',
    description: 'We ship directly from Canada to the Philippines',
    step: 3,
  },
  {
    icon: Package,
    title: 'Receive',
    description: 'Get your items delivered or pick up at your convenience',
    step: 4,
  },
]
