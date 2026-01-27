import Image from 'next/image'
import { brands } from '@/data/brands'
import { cn } from '@/lib/utils'

export default function BrandsSection() {
  return (
    <section
      id="brands"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cinnabar-200)] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className={cn(
                'group relative aspect-[3/2] flex items-center justify-center',
                'bg-[var(--bright-snow)] rounded-2xl p-6 lg:p-8',
                'border border-transparent',
                'transition-all duration-300 ease-out',
                'hover:bg-white hover:border-[var(--cinnabar-100)]',
                'hover:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.12)]',
                'hover:-translate-y-1'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Image
                src={brand.logo}
                alt={brand.alt}
                width={120}
                height={60}
                className={cn(
                  'object-contain max-h-12 w-auto',
                  'opacity-60 grayscale',
                  'transition-all duration-300',
                  'group-hover:opacity-100 group-hover:grayscale-0'
                )}
              />
            </div>
          ))}
        </div>

        {/* More brands coming text */}
        <p className="text-center text-sm text-[var(--graphite)]/50 mt-10">
          + More brands coming soon
        </p>
      </div>
    </section>
  )
}
