import { MapPin, Bell, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const upcomingFeatures = [
  {
    id: 'order-tracking',
    icon: MapPin,
    title: 'Order Tracking',
    description:
      'Track your order in real-time from Canada to your doorstep. Get notified at every step.',
    color: 'cinnabar',
  },
  {
    id: 'price-watch',
    icon: Bell,
    title: 'Price Watch',
    description:
      'Set alerts for your favorite items. Get notified when prices drop or items go on sale.',
    color: 'pink',
  },
]

export default function ComingSoonSection() {
  return (
    <section
      id="coming-soon"
      className="relative py-20 lg:py-28 bg-[var(--bright-snow)] overflow-hidden"
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--cinnabar-900) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--hot-pink)]/10 border border-[var(--hot-pink)]/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--hot-pink)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--hot-pink)]" />
            </span>
            <span className="text-sm font-medium text-[var(--hot-pink)]">
              Coming Soon
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
            More Features on the Way
          </h2>
          <p className="mt-4 text-lg text-[var(--graphite)]/60">
            We're constantly improving to serve you better
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.id}
              id={feature.id}
              className={cn(
                'relative p-8 rounded-3xl',
                'bg-white border-2 border-dashed',
                feature.color === 'cinnabar'
                  ? 'border-[var(--cinnabar-200)]'
                  : 'border-[var(--hot-pink)]/30',
                'transition-all duration-300',
                'hover:border-solid',
                feature.color === 'cinnabar'
                  ? 'hover:border-[var(--cinnabar-300)]'
                  : 'hover:border-[var(--hot-pink)]/50',
                'hover:shadow-lg',
                'group'
              )}
            >
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 right-6">
                <span
                  className={cn(
                    'inline-block px-3 py-1 text-xs font-semibold rounded-full',
                    feature.color === 'cinnabar'
                      ? 'bg-[var(--cinnabar-100)] text-[var(--cinnabar-700)]'
                      : 'bg-[var(--hot-pink)]/10 text-[var(--hot-pink)]'
                  )}
                >
                  Coming Soon
                </span>
              </div>

              {/* Icon */}
              <div
                className={cn(
                  'inline-flex items-center justify-center',
                  'w-14 h-14 rounded-2xl mb-6',
                  feature.color === 'cinnabar'
                    ? 'bg-[var(--cinnabar-50)] text-[var(--cinnabar-500)]'
                    : 'bg-[var(--hot-pink)]/10 text-[var(--hot-pink)]',
                  'transition-all duration-300',
                  'group-hover:scale-110'
                )}
              >
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[var(--cinnabar-950)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--graphite)]/60 leading-relaxed">
                {feature.description}
              </p>

              {/* Notify Link (placeholder) */}
              <div className="mt-6">
                <span
                  className={cn(
                    'inline-flex items-center gap-2 text-sm font-medium',
                    feature.color === 'cinnabar'
                      ? 'text-[var(--cinnabar-600)]'
                      : 'text-[var(--hot-pink)]',
                    'opacity-60 cursor-not-allowed'
                  )}
                >
                  Get Notified
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
