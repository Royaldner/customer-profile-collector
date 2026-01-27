# EPIC-13: App Structure & Landing Page

**Status:** Draft
**Created:** 2026-01-26
**Branch:** `feature/app-structure-landing-page`

## Problem Statement

The application has a minimal landing page (single card with registration link) that doesn't communicate the Cangoods business value proposition. As the platform evolves toward full e-commerce, the app structure needs reorganization using Next.js route groups to support marketing pages, customer app, admin dashboard, and future shop functionality.

## Goals

- [ ] Restructure app using Next.js route groups for scalability
- [ ] Create a conversion-optimized landing page with 12 sections
- [ ] Implement new color theme (cinnabar + hot-pink)
- [ ] Prepare route structure for future e-commerce features (EPIC 14-15)

## Non-Goals (Out of Scope)

- Product catalog or shop functionality (EPIC 15)
- Payment processing integration (EPIC 14)
- Blog/content management system
- Multi-language support
- Backend/API changes
- Updating customer/admin sections to cinnabar theme (decide later after seeing landing page)

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Restructure app with route groups: `(marketing)`, `(customer)`, `(admin)` | Must |
| R2 | Create marketing layout with sticky navbar and footer | Must |
| R3 | Landing page with 12 sections in priority order | Must |
| R4 | Sticky navbar with mobile hamburger menu | Must |
| R5 | All existing routes continue to work (no breaking changes) | Must |
| R6 | Sign Up/Login buttons link to existing auth system | Must |
| R7 | Responsive design (mobile-first) | Must |
| R8 | Smooth scroll navigation to sections | Should |
| R9 | FAQ accordion component | Should |
| R10 | Brand logos with hover effects | Should |
| R11 | "Coming soon" styling for Order Tracking and Price Watch | Should |

### Non-Functional

- **Performance:** Page load < 3 seconds, Lighthouse > 90
- **Accessibility:** WCAG AA compliant, skip link, focus states
- **SEO:** Proper meta tags, semantic HTML, heading hierarchy

---

## Technical Design

### Database Changes

None required.

### API Changes

None required.

### Route Group Structure

```
src/app/
├── (marketing)/                    # Marketing pages
│   ├── layout.tsx                  # Navbar + Footer
│   ├── page.tsx                    # Landing page (/)
│   ├── about/page.tsx              # Future: /about
│   ├── faq/page.tsx                # Future: /faq
│   └── contact/page.tsx            # Future: /contact
│
├── (customer)/                     # Customer-facing app
│   ├── layout.tsx                  # Customer layout
│   ├── register/                   # /register (existing)
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── customer/                   # /customer/* (existing)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── confirm/[token]/page.tsx    # Email confirmation
│   └── auth/callback/route.ts      # OAuth callback
│
├── (admin)/                        # Admin area
│   ├── layout.tsx
│   └── admin/                      # /admin/* (existing)
│       ├── page.tsx
│       ├── login/page.tsx
│       ├── customers/[id]/
│       ├── couriers/
│       ├── email-templates/
│       └── email-logs/
│
├── (shop)/                         # Future: E-commerce (stub)
│   └── .gitkeep
│
├── api/                            # API routes (unchanged)
└── layout.tsx                      # Root layout
```

### Color Palette

**Cinnabar (Primary - Red)**
```css
--cinnabar-50: #fee7e7;
--cinnabar-100: #fdcece;
--cinnabar-200: #fb9d9d;
--cinnabar-300: #f96c6c;
--cinnabar-400: #f73b3b;
--cinnabar-500: #f50a0a;
--cinnabar-600: #c40808;
--cinnabar-700: #930606;
--cinnabar-800: #620404;
--cinnabar-900: #310202;
--cinnabar-950: #220101;
```

**Secondary**
```css
--hot-pink: #ff66b3;
```

**Neutrals**
```css
--background: #f7f7f9;      /* bright-snow */
--foreground: #220101;      /* cinnabar-950 */
--muted: #2a2b2a;           /* graphite */
```

### Landing Page Section Order

| # | Section | Component | Description |
|---|---------|-----------|-------------|
| 1 | Hero | `HeroSection` | Headline, tagline, CTAs |
| 2 | Brands | `BrandsSection` | 12 brand logos in grid |
| 3 | Free Shipping | `FreeShippingSection` | Shipping + delivery options |
| 4 | How It Works | `HowItWorksSection` | 4-step process |
| 5 | Flexible Payment | `FlexiblePaymentSection` | 50/50 payment plan |
| 6 | Authenticity | `AuthenticitySection` | Trust guarantee |
| 7 | Payment Methods | `PaymentMethodsSection` | BPI, GCash, Credit Card |
| 8 | About | `AboutSection` | Company value props |
| 9 | FAQ | `FAQSection` | Accordion with Q&A |
| 10 | Order Tracking | `OrderTrackingSection` | Coming soon teaser |
| 11 | Price Watch | `PriceWatchSection` | Coming soon teaser |
| 12 | Footer | `Footer` | Contact, social, legal |

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/globals.css` | Modify | Update to cinnabar color palette |
| `src/app/(marketing)/layout.tsx` | Create | Marketing layout with navbar + footer |
| `src/app/(marketing)/page.tsx` | Create | New landing page |
| `src/app/(customer)/layout.tsx` | Create | Customer layout (move existing) |
| `src/app/(admin)/layout.tsx` | Create | Admin layout (move existing) |
| `src/components/marketing/` | Create | All marketing components |
| `src/data/` | Create | Static data files (brands, FAQ, etc.) |

### Dependencies

- `npx shadcn@latest add accordion` (if not installed)
- No new external dependencies

---

## User Experience

### User Flow

1. Visitor lands on homepage
2. Sees hero with value proposition
3. Scrolls through sections learning about service
4. Clicks "Get Started" → goes to /customer/signup
5. Or clicks "Login" → goes to /customer/login

### UI Changes

**Marketing Layout:**
- Sticky navbar with logo, nav links, Login/Sign Up buttons
- Mobile: hamburger menu with slide-out drawer
- Footer with contact info, social links, legal

**Landing Page Sections:**
- Full-width sections with alternating backgrounds
- Consistent spacing and typography
- Mobile-responsive layouts

---

## Implementation Plan

### Tasks

| ID | Task | Estimate |
|----|------|----------|
| CP-93 | Update globals.css with cinnabar color palette | S |
| CP-94 | Create route group structure and migrate existing routes | M |
| CP-95 | Create marketing layout with navbar component | M |
| CP-96 | Create marketing footer component | M |
| CP-97 | Create static data files (brands, FAQ, delivery options) | S |
| CP-98 | Create HeroSection component | M |
| CP-99 | Create BrandsSection component | M |
| CP-100 | Create FreeShippingSection component | M |
| CP-101 | Create HowItWorksSection component | M |
| CP-102 | Create FlexiblePaymentSection component | S |
| CP-103 | Create AuthenticitySection component | S |
| CP-104 | Create PaymentMethodsSection component | M |
| CP-105 | Create AboutSection component | S |
| CP-106 | Create FAQSection with accordion | M |
| CP-107 | Create OrderTrackingSection (coming soon) | S |
| CP-108 | Create PriceWatchSection (coming soon) | S |
| CP-109 | Assemble landing page with all sections | M |
| CP-110 | Add smooth scroll navigation | S |
| CP-111 | Mobile responsiveness testing and fixes | M |
| CP-112 | Accessibility audit (skip link, focus, contrast) | M |

### Phases

**Phase 1: Foundation (CP-93 to CP-97)**
- Color theme update
- Route group restructuring
- Marketing layout components
- Static data files

**Phase 2: Landing Page Sections (CP-98 to CP-108)**
- Build all 12 sections
- Individual component testing

**Phase 3: Integration & Polish (CP-109 to CP-112)**
- Assemble landing page
- Smooth scroll navigation
- Mobile responsiveness
- Accessibility audit

---

## Content

### Hero Section

| Element | Content |
|---------|---------|
| Headline | "Premium Brands. Filipino Prices." |
| Subheadline | "Shop top Canadian brands with free shipping to the Philippines" |
| Primary CTA | "Get Started" → /customer/signup |
| Secondary CTA | "Learn More" → scroll to How It Works |

### Brands (12 logos)

Coach, Michael Kors, Crocs, Fossil, Kirkland, On Running, Nike, Guess, Bath & Body Works, New Balance, Sephora, Puma

### How It Works (4 steps)

1. **Browse** - "Explore our curated deals on premium brands"
2. **Order** - "Create your profile and place your order"
3. **Ship** - "We ship directly from Canada to the Philippines"
4. **Receive** - "Get your items with flexible delivery options"

### Free Shipping & Delivery

- Headline: "Free Shipping to the Philippines. Your Way."
- Delivery Timeline: 4-8 weeks from order confirmation
- Options: Pick-up, Delivered, COD, COP

### Flexible Payment

- Headline: "Shop Now, Pay Your Way"
- Model: 50% downpayment, 50% on delivery

### Authenticity Guarantee

- Headline: "100% Authentic. Inspected Before It Ships."
- Points: Authorized retailers, quality inspection, defect checking

### Payment Methods

- BPI Bank Transfer
- GCash
- Credit Card (Coming Soon)

### FAQ (6 questions)

1. How long does delivery take?
2. What payment methods do you accept?
3. What if my item arrives damaged?
4. Can I cancel or modify my order?
5. Are the products authentic?
6. How does the 50/50 payment work?

### Footer/Contact

- Email: hello@cangoods.ph (placeholder)
- Phone: +63 XXX XXX XXXX (placeholder)
- WhatsApp: +63 XXX XXX XXXX (placeholder)
- Social: Facebook, Instagram
- Legal: Privacy Policy, Terms of Service
- Trademark disclaimer for brand logos

---

## Assets Required

### Main Logo

- `public/logo.png` ✅ Ready

### Brand Logos (10 ready, 2 pending)

| Brand | File | Status |
|-------|------|--------|
| Coach | `coach.png` | ✅ Ready |
| Michael Kors | `michael-kors.svg` | ✅ Ready |
| Crocs | `crocs.svg` | ✅ Ready |
| Fossil | `fossil.svg` | ✅ Ready |
| Nike | `nike.svg` | ✅ Ready |
| Guess | `guess.svg` | ✅ Ready |
| On | `on.svg` | ✅ Ready |
| Bath & Body Works | `bath-body-works.svg` | ✅ Ready |
| New Balance | `new-balance.svg` | ✅ Ready |
| Puma | `puma.svg` | ✅ Ready |
| Kirkland | `kirkland.svg` | ⏳ To be added |
| Sephora | `sephora.svg` | ⏳ To be added |

### Payment Method Icons

| Method | Icon | Status |
|--------|------|--------|
| BPI | Lucide `Building2` | Fallback |
| GCash | Lucide `Smartphone` | Fallback |
| Credit Card | Lucide `CreditCard` | Fallback |

*Note: Can add custom SVG icons later if available*

---

## Migration Strategy

### URL Preservation

All existing URLs must continue to work:

| URL | Current | New |
|-----|---------|-----|
| `/` | `src/app/page.tsx` | `src/app/(marketing)/page.tsx` |
| `/register` | `src/app/register/` | `src/app/(customer)/register/` |
| `/customer/*` | `src/app/customer/` | `src/app/(customer)/customer/` |
| `/admin/*` | `src/app/admin/` | `src/app/(admin)/admin/` |
| `/confirm/*` | `src/app/confirm/` | `src/app/(customer)/confirm/` |
| `/auth/*` | `src/app/auth/` | `src/app/(customer)/auth/` |
| `/api/*` | `src/app/api/` | `src/app/api/` (unchanged) |

---

## Acceptance Criteria

- [ ] Route groups created: `(marketing)`, `(customer)`, `(admin)`
- [ ] All existing URLs continue to work
- [ ] Landing page displays all 12 sections in correct order
- [ ] Navbar is sticky with working mobile hamburger menu
- [ ] Navigation links scroll smoothly to sections
- [ ] Brand logos display in responsive grid
- [ ] FAQ accordion expands/collapses correctly
- [ ] "Coming Soon" badge on Order Tracking and Price Watch
- [ ] Sign Up/Login buttons link to auth system
- [ ] Footer displays contact info and social links
- [ ] Cinnabar color theme applied throughout
- [ ] Page loads < 3 seconds
- [ ] Lighthouse scores > 90 (Performance, Accessibility)
- [ ] All existing functionality preserved
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Tests pass

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing routes during migration | High | Test each route after moving |
| Color theme conflicts with existing components | Medium | Gradual migration, visual testing |
| Brand logo usage concerns | Low | Trademark disclaimer in footer |
| Mobile menu UX issues | Medium | Test on real devices |

---

## Open Questions

- [x] Should the existing app components (customer dashboard, admin) also update to cinnabar theme? → **No, marketing section only for now. Decide later.**
- [x] Any specific brand logo restrictions or preferences? → **10 brands ready, Kirkland & Sephora to be added later**
- [ ] Contact information placeholders - when will real data be available?

---

## Future Considerations

This structure prepares for:

| Future EPIC | Route Group | Features |
|-------------|-------------|----------|
| EPIC 14 | `(shop)/` | Payment processing |
| EPIC 15 | `(shop)/` | Product catalog, cart, checkout |
| Future | `(marketing)/blog/` | SEO content |
| Future | - | Multi-language (i18n) |

---

*Last updated: 2026-01-26*
