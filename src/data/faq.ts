export interface FAQItem {
  question: string
  answer: string
}

export const faqItems: FAQItem[] = [
  {
    question: 'How long does delivery take?',
    answer:
      'Delivery typically takes 10-12 weeks from order confirmation. This includes sourcing, quality inspection, and international shipping from Canada to the Philippines. We\'ll keep you updated every step of the way.',
  },
  {
    question: 'How does the 50/50 payment work?',
    answer:
      'Our 50/50 payment plan lets you pay 50% when you place your order, and the remaining 50% when your order is ready for delivery. This makes premium brands more accessible without the full upfront cost.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept BPI Bank Transfer and GCash. Credit card payments are coming soon. We also offer a flexible 50/50 payment plan where you pay 50% upfront and 50% upon delivery.',
  },
  {
    question: 'What if my item arrives damaged?',
    answer:
      'All items undergo thorough quality inspection before shipping. In the rare case that your item arrives damaged, please contact us within 48 hours with photos. We\'ll work with you to resolve the issue promptly.',
  },
  {
    question: 'Can I cancel or modify my order?',
    answer:
      'You can cancel or modify your order within 24 hours of placing it. After that, the order may already be in processing. Please contact us immediately if you need to make changes.',
  },
  {
    question: 'Are the products authentic?',
    answer:
      'Yes, 100%. We source all products directly from authorized Canadian retailers. Every item is inspected for authenticity and quality before it ships to you.',
  },
]
