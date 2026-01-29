'use client'

import { faqItems } from '@/data/faq'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Left - Header */}
          <div className="lg:col-span-4 mb-12 lg:mb-0">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--cinnabar-500)] mb-3">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cinnabar-950)] tracking-tight">
                Common Questions
              </h2>
              <p className="mt-4 text-lg text-[var(--graphite)]/60 leading-relaxed">
                Everything you need to know about ordering from Cangoods.
              </p>

              {/* Contact CTA */}
              <div className="mt-8 p-6 rounded-2xl bg-[var(--bright-snow)] border border-[var(--cinnabar-100)]">
                <p className="text-sm text-[var(--graphite)]/70 mb-3">
                  Still have questions?
                </p>
                <a
                  href="mailto:hello@cangoods.ph"
                  className={cn(
                    'inline-flex items-center gap-2',
                    'text-[var(--cinnabar-600)] font-medium',
                    'hover:text-[var(--cinnabar-700)]',
                    'transition-colors duration-200'
                  )}
                >
                  Contact us →
                </a>
              </div>
            </div>
          </div>

          {/* Right - Accordion */}
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className={cn(
                    'rounded-2xl border border-[var(--cinnabar-100)]/50',
                    'bg-[var(--bright-snow)]',
                    'px-6 overflow-hidden',
                    'transition-all duration-300',
                    'data-[state=open]:border-[var(--cinnabar-200)]',
                    'data-[state=open]:bg-white',
                    'data-[state=open]:shadow-[0_8px_30px_-8px_rgba(196,8,8,0.1)]'
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      'py-5 text-left text-base font-semibold',
                      'text-[var(--cinnabar-950)]',
                      'hover:text-[var(--cinnabar-600)]',
                      'hover:no-underline',
                      '[&[data-state=open]>svg]:text-[var(--cinnabar-500)]',
                      '[&>svg]:text-[var(--graphite)]/40',
                      '[&>svg]:transition-colors'
                    )}
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className={cn(
                      'pb-5 text-[var(--graphite)]/70',
                      'leading-relaxed'
                    )}
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
