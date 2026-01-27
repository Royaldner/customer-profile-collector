import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, Phone, MessageCircle } from 'lucide-react'

const footerLinks = {
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Our Brands', href: '#brands' },
    { label: 'FAQ', href: '#faq' },
  ],
  support: [
    { label: 'Shipping Info', href: '#shipping' },
    { label: 'Payment Options', href: '#payment-methods' },
    { label: 'Track Order', href: '#order-tracking' },
    { label: 'Contact Us', href: '#contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/cangoods', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/cangoods', label: 'Instagram' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[var(--cinnabar-950)] text-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--cinnabar-900)]/20 to-transparent pointer-events-none" />

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cinnabar-700)] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Cangoods"
                    width={48}
                    height={48}
                    className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-2xl font-semibold tracking-tight">
                  Cangoods
                </span>
              </Link>

              <p className="mt-5 text-[15px] leading-relaxed text-white/70 max-w-sm">
                Premium Canadian brands delivered to your doorstep in the Philippines.
                Authentic products, flexible payments, free shipping.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all duration-300 hover:bg-[var(--hot-pink)] hover:text-white hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
                {/* Company */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[15px] text-white/70 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[15px] text-white/70 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Get in Touch
                  </h3>
                  <ul className="mt-4 space-y-3">
                    <li>
                      <a
                        href="mailto:hello@cangoods.ph"
                        className="inline-flex items-center gap-2.5 text-[15px] text-white/70 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        hello@cangoods.ph
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+639XXXXXXXXX"
                        className="inline-flex items-center gap-2.5 text-[15px] text-white/70 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        +63 9XX XXX XXXX
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/639XXXXXXXXX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 text-[15px] text-white/70 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                      >
                        <MessageCircle className="h-4 w-4 flex-shrink-0" />
                        WhatsApp
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-white/50">
              &copy; {currentYear} Cangoods. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/50 transition-colors duration-200 hover:text-[var(--hot-pink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trademark Disclaimer */}
          <p className="mt-6 text-center text-xs text-white/30 max-w-3xl mx-auto leading-relaxed">
            All brand names, logos, and trademarks displayed on this website are the property of their respective owners.
            Cangoods is an independent reseller and is not affiliated with, endorsed by, or sponsored by any of the brands shown.
          </p>
        </div>
      </div>
    </footer>
  )
}
