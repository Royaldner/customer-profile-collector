import { Wallet, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PaymentSection() {
  return (
    <section
      id="payment"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--cinnabar-600)] via-[var(--cinnabar-700)] to-[var(--cinnabar-800)]" />

      {/* Decorative Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Accent blob */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--hot-pink)]/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-200)] mb-3">
              Flexible Payment
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Shop Now,{' '}
              <span className="text-[var(--hot-pink)]">Pay Your Way</span>
            </h2>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
              Our 50/50 payment plan makes premium brands accessible. Pay half now,
              half when your order is ready for delivery.
            </p>

            {/* Benefits List */}
            <ul className="mt-8 space-y-4">
              {[
                'No hidden fees or interest',
                'Secure payment processing',
                'Full transparency on costs',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--hot-pink)] flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Payment Visual */}
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              {/* Card Container */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/20">
                {/* 50/50 Split Visualization */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="flex-1 text-center">
                    <div
                      className={cn(
                        'w-20 h-20 mx-auto rounded-2xl mb-4',
                        'bg-white/20 backdrop-blur-sm',
                        'flex items-center justify-center'
                      )}
                    >
                      <span className="text-3xl font-bold text-white">50%</span>
                    </div>
                    <p className="text-sm font-medium text-white/80">On Order</p>
                  </div>

                  <ArrowRight className="w-6 h-6 text-[var(--hot-pink)]" />

                  <div className="flex-1 text-center">
                    <div
                      className={cn(
                        'w-20 h-20 mx-auto rounded-2xl mb-4',
                        'bg-[var(--hot-pink)]/20 backdrop-blur-sm',
                        'border border-[var(--hot-pink)]/30',
                        'flex items-center justify-center'
                      )}
                    >
                      <span className="text-3xl font-bold text-[var(--hot-pink)]">50%</span>
                    </div>
                    <p className="text-sm font-medium text-white/80">On Delivery</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/20 my-8" />

                {/* Example Calculation */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Order Total</span>
                    <span className="text-white font-medium">₱5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Pay Now (50%)</span>
                    <span className="text-white font-medium">₱2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Pay Later (50%)</span>
                    <span className="text-[var(--hot-pink)] font-medium">₱2,500</span>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute -top-3 right-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--hot-pink)] text-white text-xs font-semibold shadow-lg">
                    <Wallet className="w-3.5 h-3.5" />
                    No Interest
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
