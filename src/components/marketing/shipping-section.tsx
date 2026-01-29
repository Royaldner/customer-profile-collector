import { deliveryOptions, shippingInfo } from '@/data/delivery-options'
import { Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ShippingSection() {
  return (
    <section
      id="shipping"
      className="relative py-20 lg:py-28 bg-[var(--bright-snow)] overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[var(--cinnabar-100)]/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
            Free Shipping
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
            Delivered Your Way
          </h2>
          <p className="mt-4 text-lg text-[var(--graphite)]/60">
            Free international shipping to the Philippines with flexible delivery options
          </p>
        </div>

        {/* Timeline Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-[var(--cinnabar-100)] shadow-sm">
            <Clock className="w-5 h-5 text-[var(--cinnabar-500)]" />
            <span className="text-base font-medium text-[var(--cinnabar-950)]">
              {shippingInfo.timeline}
            </span>
            <span className="text-sm text-[var(--graphite)]/60">
              {shippingInfo.timelineDetail}
            </span>
          </div>
        </div>

        {/* Delivery Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliveryOptions.map((option, index) => (
            <div
              key={option.code}
              className={cn(
                'relative p-6 lg:p-8 rounded-2xl bg-white',
                'border border-[var(--cinnabar-100)]/50',
                'transition-all duration-300',
                'hover:border-[var(--cinnabar-200)]',
                'hover:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.1)]',
                'group'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'inline-flex items-center justify-center',
                  'w-12 h-12 rounded-xl mb-5',
                  'bg-[var(--cinnabar-50)]',
                  'text-[var(--cinnabar-600)]',
                  'transition-all duration-300',
                  'group-hover:bg-[var(--cinnabar-600)]',
                  'group-hover:text-white'
                )}
              >
                <option.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--cinnabar-950)] mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-[var(--graphite)]/60 leading-relaxed">
                {option.description}
              </p>
            </div>
          ))}
        </div>

        {/* Free Shipping Note */}
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-2 text-[var(--cinnabar-950)]">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{shippingInfo.freeShippingNote}</span>
            <span className="font-sm text-tiny">Check out our partners: <a href={shippingInfo.lbcLink} target="_blank" className="text-[var(--hot-pink)]">LBC</a> and <a href={shippingInfo.jrsLink} target="_blank" className="text-[var(--hot-pink)]">JRS</a> for the rates</span>
          </div>
        </div>
      </div>
    </section>
  )
}
