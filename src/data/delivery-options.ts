import { MapPin, Truck, Banknote, Building } from 'lucide-react'

export interface DeliveryOption {
  icon: typeof MapPin
  title: string
  description: string
  code: string
}

export const deliveryOptions: DeliveryOption[] = [
  {
    icon: MapPin,
    title: 'Pick-up',
    description: 'Collect your order from our designated location',
    code: 'pickup',
  },
  {
    icon: Truck,
    title: 'Delivered',
    description: 'Free delivery straight to your doorstep',
    code: 'delivered',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    code: 'cod',
  },
  {
    icon: Building,
    title: 'Cash on Pickup',
    description: 'Pay at your chosen courier pickup location',
    code: 'cop',
  },
]

export const shippingInfo = {
  timeline: '10-12 weeks',
  timelineDetail: 'from order confirmation to delivery',
  freeShipping: true,
  freeShippingNote: 'Delivery fees may vary in different provinces',
  lbcLink: 'https://www.lbcexpress.com/',
  jrsLink: 'https://www.jrs-express.com/',
}
