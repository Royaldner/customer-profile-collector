import { Heart, Globe, Users, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const values = [
  {
    icon: ShoppingBag,
    title: 'Best Deals',
    description:
      'We find the lowest possible price for a quality product',
  },
  {
    icon: Heart,
    title: 'Passion for Quality',
    description:
      'We curate only the best products from brands we believe in.',
  },
  {
    icon: Globe,
    title: 'Bridging Continents',
    description:
      'Bringing Canadian excellence to Filipino homes.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description:
      'Your satisfaction drives everything we do.',
  },
 
]

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-20 lg:py-28 bg-[var(--bright-snow)] overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[var(--cinnabar-100)]/20 to-transparent rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
            About Cangoods
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
            Bringing Canada&apos;s Best to You
          </h2>
          <p className="mt-6 text-lg text-[var(--graphite)]/70 leading-relaxed">
            Cangoods was born from a simple idea: everyone deserves access to premium
            brands at fair prices. We source authentic products from Canada and deliver
            them straight to your door with flexible payment options.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={cn(
                'relative p-6 rounded-2xl bg-white',
                'border border-[var(--cinnabar-100)]/50',
                'text-center',
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
                  'w-14 h-14 rounded-2xl mb-5 mx-auto',
                  'bg-gradient-to-br from-[var(--cinnabar-50)] to-[var(--cinnabar-100)]',
                  'text-[var(--cinnabar-600)]',
                  'transition-all duration-300',
                  'group-hover:from-[var(--cinnabar-600)] group-hover:to-[var(--cinnabar-700)]',
                  'group-hover:text-white'
                )}
              >
                <value.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--cinnabar-950)] mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-[var(--graphite)]/60 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
