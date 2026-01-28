import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background with subtle gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--bright-snow)] to-[var(--cinnabar-50)]/30" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-[var(--cinnabar-200)]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-[var(--hot-pink)]/10 rounded-full blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--cinnabar-900) 1px, transparent 1px),
                           linear-gradient(90deg, var(--cinnabar-900) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[var(--cinnabar-100)] shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-[var(--hot-pink)]" />
            <span className="text-sm font-medium text-[var(--cinnabar-700)]">
              Best Deals Guaranteed
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--cinnabar-950)] leading-[1.1]">
              Premium Brands.
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mt-2 leading-[1.1]">
              <span className="marketing-text-gradient">Filipino Prices.</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-xl sm:text-2xl text-[var(--graphite)]/70 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Your Gateway to Global Deals. Shop top Canadian brands with{' '}
            <span className="text-[var(--cinnabar-600)] font-semibold">free shipping</span>{' '}
            to the Philippines.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
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

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-[400ms]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--hot-pink)]" />
              <span className="text-sm text-[var(--graphite)]/60">100% Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--hot-pink)]" />
              <span className="text-sm text-[var(--graphite)]/60">Free Shipping to the Philippines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--hot-pink)]" />
              <span className="text-sm text-[var(--graphite)]/60">Flexible Payment Options</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
