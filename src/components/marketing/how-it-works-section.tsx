import { steps } from '@/data/how-it-works'
import { cn } from '@/lib/utils'

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-[var(--graphite)]/60">
            From browsing to receiving — we make it easy
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[var(--cinnabar-200)] via-[var(--cinnabar-300)] to-[var(--cinnabar-200)] -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Step Number + Icon Container */}
                <div className="relative mb-6">
                  {/* Background circle */}
                  <div
                    className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center',
                      'bg-white border-2 border-[var(--cinnabar-200)]',
                      'shadow-[0_4px_20px_-4px_rgba(196,8,8,0.15)]',
                      'transition-all duration-300',
                      'hover:border-[var(--cinnabar-400)]',
                      'hover:shadow-[0_8px_30px_-4px_rgba(196,8,8,0.25)]',
                      'group'
                    )}
                  >
                    <step.icon
                      className={cn(
                        'w-8 h-8 text-[var(--cinnabar-500)]',
                        'transition-transform duration-300',
                        'group-hover:scale-110'
                      )}
                    />
                  </div>

                  {/* Step Number Badge */}
                  <div
                    className={cn(
                      'absolute -top-2 -right-2',
                      'w-7 h-7 rounded-full',
                      'bg-[var(--cinnabar-600)] text-white',
                      'flex items-center justify-center',
                      'text-xs font-bold',
                      'shadow-[0_2px_8px_-2px_rgba(196,8,8,0.5)]'
                    )}
                  >
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[var(--cinnabar-950)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--graphite)]/60 leading-relaxed max-w-[240px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
