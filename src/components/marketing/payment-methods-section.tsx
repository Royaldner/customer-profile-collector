import { paymentMethods } from '@/data/payment-methods'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PaymentMethodsSection() {
  return (
    <section
      id="payment-methods"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
            Payment Options
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
            Pay How You Prefer
          </h2>
          <p className="mt-4 text-lg text-[var(--graphite)]/60">
            Multiple secure payment options for your convenience
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {paymentMethods.map((method, index) => (
            <div
              key={method.name}
              className={cn(
                'relative p-8 rounded-2xl text-center',
                'bg-[var(--bright-snow)]',
                'border border-[var(--cinnabar-100)]/50',
                'transition-all duration-300',
                'hover:border-[var(--cinnabar-200)]',
                'hover:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.1)]',
                'group',
                !method.available && 'opacity-75'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Coming Soon Badge */}
              {method.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[var(--hot-pink)] text-white">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'inline-flex items-center justify-center',
                  'w-16 h-16 rounded-2xl mb-5 mx-auto',
                  method.available
                    ? 'bg-[var(--cinnabar-50)] text-[var(--cinnabar-600)]'
                    : 'bg-gray-100 text-gray-400',
                  'transition-all duration-300',
                  method.available &&
                    'group-hover:bg-[var(--cinnabar-600)] group-hover:text-white'
                )}
              >
                <method.icon className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3
                className={cn(
                  'text-lg font-semibold mb-2',
                  method.available
                    ? 'text-[var(--cinnabar-950)]'
                    : 'text-gray-500'
                )}
              >
                {method.name}
              </h3>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  method.available
                    ? 'text-[var(--graphite)]/60'
                    : 'text-gray-400'
                )}
              >
                {method.description}
              </p>

              {/* Available indicator */}
              {method.available && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Available Now
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="w-full flex flex-col py-8 items-center gap-4">
            <span className="text-lg text-[var(--graphite)]/60">Login to your account to see your payment methods</span>
          </div>
        <div className="mt-2 flex justify-center flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button
              asChild
              size="lg"
              className={cn(
                'h-14 px-8 text-base font-semibold',
                'bg-[var(--cinnabar-600)] hover:bg-[var(--cinnabar-700)]',
                'shadow-[0_4px_14px_-2px_rgba(196,8,8,0.4)]',
                'hover:shadow-[0_6px_20px_-2px_rgba(196,8,8,0.5)]',
                'transition-all duration-300'
              )}
            >
              <Link href="/customer/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                'h-14 px-8 text-base font-semibold',
                'border-[var(--cinnabar-200)] text-[var(--cinnabar-700)]',
                'hover:bg-[var(--cinnabar-50)] hover:border-[var(--cinnabar-300)]',
                'transition-all duration-300'
              )}
            >
              <a href="#how-it-works">Learn More</a>
            </Button>
          </div>
      </div>
    </section>
  )
}
