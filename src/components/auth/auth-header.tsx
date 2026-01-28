import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <Image
              src="/logo.svg"
              alt="Cangoods"
              width={36}
              height={36}
              className="rounded-lg transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="text-lg font-semibold text-[var(--cinnabar-950)] hidden sm:block">
              Cangoods
            </span>
          </Link>

          {/* Return to Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--cinnabar-600)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
