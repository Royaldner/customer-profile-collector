'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Brands', href: '#brands' },
  { label: 'Shipping', href: '#shipping' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        const navHeight = 80
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: 'smooth',
        })
      }
      setMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.05),0_4px_20px_-4px_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
      )}
    >
      {/* Subtle top accent line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500',
          'bg-gradient-to-r from-transparent via-[var(--cinnabar-500)] to-transparent',
          isScrolled ? 'opacity-100' : 'opacity-0'
        )}
      />

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="relative flex items-center gap-3 group"
          >
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="Cangoods"
                width={44}
                height={44}
                className="transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-[var(--cinnabar-950)] hidden sm:block">
              Cangoods
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
                  'text-[var(--graphite)] hover:text-[var(--cinnabar-600)]',
                  'after:absolute after:bottom-1 after:left-4 after:right-4 after:h-[2px]',
                  'after:bg-[var(--cinnabar-500)] after:origin-left after:scale-x-0',
                  'after:transition-transform after:duration-300 hover:after:scale-x-100'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-[var(--graphite)] hover:text-[var(--cinnabar-600)] hover:bg-[var(--cinnabar-50)]"
            >
              <Link href="/customer/login">Log in</Link>
            </Button>
            <Button
              asChild
              className={cn(
                'bg-[var(--cinnabar-600)] hover:bg-[var(--cinnabar-700)]',
                'text-white font-medium px-5',
                'shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_-2px_rgba(196,8,8,0.25)]',
                'hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_20px_-4px_rgba(196,8,8,0.35)]',
                'transition-all duration-300'
              )}
            >
              <Link href="/customer/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              'lg:hidden p-2 -mr-2 rounded-lg transition-colors duration-200',
              'text-[var(--graphite)] hover:bg-[var(--cinnabar-50)] hover:text-[var(--cinnabar-600)]'
            )}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md border-l-0 bg-white p-0"
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--cinnabar-100)]">
            <SheetHeader className="p-0">
              <SheetTitle className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Cangoods"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold text-[var(--cinnabar-950)]">
                  Cangoods
                </span>
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <button
                className="p-2 -mr-2 rounded-lg text-[var(--graphite)] hover:bg-[var(--cinnabar-50)] hover:text-[var(--cinnabar-600)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col p-5 space-y-1">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'flex items-center justify-between py-4 px-4 -mx-4 rounded-xl',
                  'text-base font-medium text-[var(--graphite)]',
                  'hover:bg-[var(--cinnabar-50)] hover:text-[var(--cinnabar-600)]',
                  'transition-all duration-200',
                  'animate-in slide-in-from-right-5 fade-in duration-300'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
                <ArrowRight className="w-4 h-4 opacity-40" />
              </a>
            ))}
          </div>

          {/* Mobile Auth Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-[var(--cinnabar-100)] bg-[var(--bright-snow)]">
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className={cn(
                  'w-full h-12 bg-[var(--cinnabar-600)] hover:bg-[var(--cinnabar-700)]',
                  'text-white font-medium text-base',
                  'shadow-[0_4px_12px_-2px_rgba(196,8,8,0.3)]'
                )}
              >
                <Link href="/customer/signup">Get Started</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className={cn(
                  'w-full h-12 border-[var(--cinnabar-200)] text-[var(--cinnabar-700)]',
                  'hover:bg-[var(--cinnabar-50)] hover:border-[var(--cinnabar-300)]',
                  'font-medium text-base'
                )}
              >
                <Link href="/customer/login">Log in</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
