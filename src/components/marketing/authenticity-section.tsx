import { Shield, Eye, BadgeCheck, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: BadgeCheck,
    title: 'Authorized Retailers',
    description: 'Sourced exclusively from official Canadian retailers',
  },
  {
    icon: Eye,
    title: 'Quality Inspection',
    description: 'Every item inspected before shipping to you',
  },
  {
    icon: Shield,
    title: 'Defect Checking',
    description: 'Thorough examination for any manufacturing issues',
  },
  {
    icon: Award,
    title: 'Authenticity Guarantee',
    description: '100% genuine products or your money back',
  },
]

export default function AuthenticitySection() {
  return (
    <section
      id="authenticity"
      className="relative py-20 lg:py-28 bg-[var(--bright-snow)] overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-[var(--cinnabar-100)]/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left - Badge Visual */}
          <div className="flex justify-center lg:justify-start mb-12 lg:mb-0">
            <div className="relative">
              {/* Main Badge */}
              <div
                className={cn(
                  'w-64 h-64 sm:w-80 sm:h-80 rounded-full',
                  'bg-gradient-to-br from-white to-[var(--cinnabar-50)]',
                  'border-4 border-[var(--cinnabar-200)]',
                  'shadow-[0_20px_60px_-20px_rgba(196,8,8,0.3)]',
                  'flex flex-col items-center justify-center',
                  'relative'
                )}
              >
                <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--cinnabar-500)] mb-4" />
                <span className="text-2xl sm:text-3xl font-bold text-[var(--cinnabar-950)]">
                  100%
                </span>
                <span className="text-lg sm:text-xl font-semibold text-[var(--cinnabar-600)]">
                  Authentic
                </span>

                {/* Decorative ring */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-[var(--cinnabar-200)]" />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center border border-[var(--cinnabar-100)]">
                <BadgeCheck className="w-8 h-8 text-[var(--cinnabar-500)]" />
              </div>
              <div className="absolute -bottom-2 -left-4 w-14 h-14 rounded-xl bg-[var(--cinnabar-600)] shadow-lg flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
              Trust & Quality
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
              Inspected Before It Ships
            </h2>
            <p className="mt-4 text-lg text-[var(--graphite)]/60 leading-relaxed">
              Every product goes through our rigorous quality control process.
              We don&apos;t just sell brands — we guarantee authenticity.
            </p>

            {/* Feature Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg',
                      'bg-[var(--cinnabar-50)]',
                      'flex items-center justify-center'
                    )}
                  >
                    <feature.icon className="w-5 h-5 text-[var(--cinnabar-600)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--cinnabar-950)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--graphite)]/60 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
