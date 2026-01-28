import Image from 'next/image'
import { brands } from '@/data/brands'
import { cn } from '@/lib/utils'

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  // Reverse brand order on the second row so adjacent logos differ
  const items = reverse ? [...brands].reverse() : brands

  return (
    <div className="flex gap-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <div
        className={cn(
          'flex shrink-0 items-center gap-8 py-4',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        {items.map((brand) => (
          <div
            key={brand.name}
            className={cn(
              'group flex items-center justify-center',
              'bg-[var(--bright-snow)] rounded-2xl px-8 py-5',
              'border border-transparent',
              'transition-all duration-300 ease-out',
              'hover:bg-white hover:border-[var(--cinnabar-100)]',
              'hover:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.12)]',
              'shrink-0'
            )}
          >
            <Image
              src={brand.logo}
              alt={brand.alt}
              width={120}
              height={60}
              className={cn(
                'object-contain h-8 w-auto',
                'opacity-50 grayscale',
                'transition-all duration-300',
                'group-hover:opacity-100 group-hover:grayscale-0'
              )}
            />
          </div>
        ))}
      </div>
      {/* Duplicate for seamless loop */}
      <div
        aria-hidden
        className={cn(
          'flex shrink-0 items-center gap-8 py-4',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        {items.map((brand) => (
          <div
            key={`dup-${brand.name}`}
            className={cn(
              'group flex items-center justify-center',
              'bg-[var(--bright-snow)] rounded-2xl px-8 py-5',
              'border border-transparent',
              'transition-all duration-300 ease-out',
              'hover:bg-white hover:border-[var(--cinnabar-100)]',
              'hover:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.12)]',
              'shrink-0'
            )}
          >
            <Image
              src={brand.logo}
              alt={brand.alt}
              width={120}
              height={60}
              className={cn(
                'object-contain h-8 w-auto',
                'opacity-50 grayscale',
                'transition-all duration-300',
                'group-hover:opacity-100 group-hover:grayscale-0'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BrandsSection() {
  return (
    <section
      id="brands"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cinnabar-200)] to-transparent" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 px-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
          Trusted Brands
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
          Premium Brands You Love
        </h2>
        <p className="mt-4 text-lg text-[var(--graphite)]/60">
          Authentic products sourced directly from authorized Canadian retailers
        </p>
      </div>

      {/* Marquee Rows */}
      <div className="space-y-4">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>

      {/* More brands coming text */}
      <p className="text-center text-sm text-[var(--graphite)]/50 mt-10">
        + More brands coming soon
      </p>
    </section>
  )
}
