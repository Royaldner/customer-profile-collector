import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-[var(--cinnabar-600)] focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
