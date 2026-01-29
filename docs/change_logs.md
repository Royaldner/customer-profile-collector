# Change Logs

## [2026-01-27 21:00] - EPIC 14: Automatic Zoho Books Customer Sync

### Summary
Implemented automatic customer sync to Zoho Books. New customers get Zoho contacts created automatically, returning customers get matched and linked to existing Zoho contacts.

### Changes

#### Registration Flow
- Added "Customer History" step asking if customer is new or returning
- `is_returning_customer` field stored on customer record
- Step appears between Personal Info and Delivery Method

#### Background Sync Processing
- Created `zoho_sync_queue` table for background job processing
- Cron job processes queue (configured for daily, attempting hourly)
- Retry logic with exponential backoff (5min, 15min, 1hr, max 3 attempts)
- Sync status tracking: pending → syncing → synced/failed/skipped

#### Zoho API Enhancements
- Added CREATE scope to OAuth (ZohoBooks.contacts.CREATE)
- `createContact()` - Creates new Zoho contact with profile address
- `updateContact()` - Updates existing Zoho contact with app data
- `searchContactByEmail()` - Exact email match search
- `findMatchingContact()` - Email-first, then name matching

#### Admin UI
- Sync status column in customer list with filter dropdown
- Sync status display in customer detail (icon + label)
- "Retry Sync" button for failed/skipped syncs
- "Link Manually" button for manual linking
- "Sync Profile to Zoho" button for pushing profile data to linked contacts

### Files Created
- `docs/post-mvp-features/EPIC-14-zoho-auto-sync.md` - Feature specification
- `supabase/migrations/011_zoho_sync.sql` - Database migration
- `src/lib/services/zoho-sync.ts` - Background sync processing service
- `src/app/api/cron/zoho-sync/route.ts` - Cron endpoint
- `src/app/api/admin/customers/[id]/zoho-sync/route.ts` - Manual sync trigger
- `src/components/forms/steps/customer-history-step.tsx` - New registration step

### Files Modified
- `src/lib/services/zoho-books.ts` - Added CREATE scope, createContact, updateContact, searchContactByEmail, findMatchingContact
- `src/lib/types/index.ts` - Added ZohoSyncStatus, sync fields to Customer
- `src/lib/types/zoho.ts` - Added ZohoSyncQueue interface
- `src/lib/validations/customer.ts` - Added is_returning_customer
- `src/components/forms/customer-form.tsx` - Added customer history step
- `src/components/forms/steps/index.ts` - Export new step
- `src/app/api/customers/route.ts` - Queue sync after customer creation
- `src/components/admin/zoho-section.tsx` - Sync status display, retry/sync buttons
- `src/components/admin/customer-list.tsx` - Sync status column and filter
- `src/app/(admin)/admin/customers/[id]/page.tsx` - Pass sync props to ZohoSection
- `vercel.json` - Added zoho-sync cron job

### Cron Job Issue
- Vercel Hobby tier cron limits are unclear from docs
- Hourly schedule failed deployment initially
- Currently set to daily (`0 0 * * *`) to test if it deploys
- May need to use external cron service (cron-job.org) for hourly syncs

### Deployment Steps
1. Run migration `011_zoho_sync.sql` in Supabase SQL Editor
2. Re-authorize Zoho Books to get CREATE scope (delete `zoho_tokens` row, reconnect)
3. Deploy to Vercel

### Git
- **Branch:** `feature/zoho-auto-sync`
- **PR:** #11 (merged to main)
- **Commits:** Multiple commits for cron configuration adjustments

### Notes
- New customers: Zoho contact created with name, email, phone, profile address
- Returning customers: Searched by email first, then name
- Ambiguous matches (multiple contacts found): Marked as 'skipped' for admin review
- Admin can manually trigger sync or link customers to Zoho contacts
- "Sync Profile to Zoho" allows admin to push profile data to existing Zoho contacts

---

## [2026-01-27 00:15] - Apply Cinnabar Theme to Entire App

### Summary
Extended the cinnabar color theme from marketing section to customer and admin sections for consistent branding across the entire application.

### Changes
- Updated `:root` CSS variables to use cinnabar palette
- Updated `.dark` mode to use cinnabar colors
- Consolidated color definitions (removed duplicate declarations)
- All sections now share the same visual identity

### Theme Applied
- **Primary**: Cinnabar-600 (#c40808)
- **Accent**: Cinnabar-500 (#f50a0a)
- **Borders**: Cinnabar-100 (subtle red tint)
- **Text**: Cinnabar-950 (dark red-black)
- **Backgrounds**: White with bright-snow accents

### Files Modified
- `src/app/globals.css` - Unified cinnabar theme for entire app

### Notes
- Customer login, signup, dashboard now match landing page aesthetic
- Admin pages also updated with consistent branding
- Dark mode updated with cinnabar accents

---

## [2026-01-26 23:45] - EPIC 13 Implementation: App Structure & Landing Page

### Summary
Implemented EPIC 13 - complete restructuring of the app with Next.js route groups and a beautiful, conversion-optimized landing page for Cangoods.

### Changes

#### Route Group Structure (CP-93-94)
- Created route groups: `(marketing)`, `(customer)`, `(admin)`, `(shop)` stub
- Migrated all existing routes to appropriate groups while preserving URLs
- Added cinnabar color palette to globals.css for marketing section
- Created marketing-specific CSS utilities (gradients, section styling)

#### Marketing Layout (CP-95-96)
- **Navbar**: Sticky with scroll detection, glassmorphism effect, mobile hamburger menu
- **Footer**: Dark theme with contact info, social links, legal, trademark disclaimer
- Skip-to-main-content link for accessibility

#### Static Data Files (CP-97)
- `src/data/brands.ts` - 10 brand logos with metadata
- `src/data/how-it-works.ts` - 4-step process with icons
- `src/data/delivery-options.ts` - Shipping info and delivery methods
- `src/data/faq.ts` - 6 FAQ items
- `src/data/payment-methods.ts` - BPI, GCash, Credit Card (coming soon)

#### Landing Page Sections (CP-98-108)
All 12 sections implemented with beautiful, premium UI:
1. **HeroSection** - Gradient background, animated CTAs, trust indicators
2. **BrandsSection** - Logo grid with grayscale-to-color hover effects
3. **ShippingSection** - Delivery options cards with icons
4. **HowItWorksSection** - 4-step process with connection line
5. **PaymentSection** - 50/50 payment visualization on cinnabar gradient
6. **AuthenticitySection** - Trust badge with floating elements
7. **PaymentMethodsSection** - Available payment options with "coming soon" badges
8. **AboutSection** - Company values grid
9. **FAQSection** - Accordion with sticky header
10. **ComingSoonSection** - Order tracking & price watch teasers

#### Polish & Accessibility (CP-109-112)
- Smooth scroll behavior (`scroll-smooth` on html)
- SEO-friendly metadata (title template, description, keywords)
- Skip-to-main-content accessibility link
- Fixed lint errors (unescaped entities)

### Files Created
- `src/app/(marketing)/layout.tsx` - Marketing layout
- `src/app/(marketing)/page.tsx` - Landing page
- `src/app/(customer)/layout.tsx` - Customer layout
- `src/app/(admin)/layout.tsx` - Admin layout
- `src/app/(shop)/.gitkeep` - Shop stub
- `src/components/marketing/navbar.tsx`
- `src/components/marketing/footer.tsx`
- `src/components/marketing/hero-section.tsx`
- `src/components/marketing/brands-section.tsx`
- `src/components/marketing/shipping-section.tsx`
- `src/components/marketing/how-it-works-section.tsx`
- `src/components/marketing/payment-section.tsx`
- `src/components/marketing/authenticity-section.tsx`
- `src/components/marketing/payment-methods-section.tsx`
- `src/components/marketing/about-section.tsx`
- `src/components/marketing/faq-section.tsx`
- `src/components/marketing/coming-soon-section.tsx`
- `src/components/marketing/index.ts`
- `src/data/*.ts` - All static data files
- `src/components/ui/accordion.tsx` - shadcn accordion

### Files Modified
- `src/app/globals.css` - Added cinnabar color palette and marketing utilities
- `src/app/layout.tsx` - Updated metadata, added scroll-smooth

### Commits
- `79d3306` - CP-93-96: Route groups, marketing layout, navbar & footer
- `6bd81c8` - CP-97-109: Static data and landing page sections
- `dd2851c` - CP-110-112: Polish, accessibility, and metadata

### Test Results
- 94/104 tests passing (10 db-schema tests require live database)
- Build passing
- Lint passing (pre-existing warnings only)

### Notes
- Beautiful, premium UI with cinnabar theme and hot-pink accents
- Smooth animations and hover effects throughout
- Mobile-responsive with hamburger menu
- All existing routes preserved and working

---

## [2026-01-26 20:00] - EPIC 13 Planning: App Structure & Landing Page

### Summary
Planned EPIC 13 for restructuring the app with Next.js route groups and creating a conversion-optimized landing page for the Cangoods business.

### Changes

#### Feature Specification Created
- Created comprehensive EPIC-13 spec document
- Defined route group structure: `(marketing)`, `(customer)`, `(admin)`, `(shop)` stub
- Planned 12-section landing page with priority-based ordering
- Defined new color theme: Cinnabar (red) + Hot Pink (secondary)

#### Landing Page Section Order (Finalized)
1. Hero
2. Brands (12 logos)
3. Free Shipping & Delivery
4. How It Works (4 steps)
5. Flexible Payment (50/50 plan)
6. Authenticity Guarantee
7. Payment Methods (BPI, GCash, CC)
8. About
9. FAQ
10. Order Tracking (coming soon)
11. Price Watch (coming soon)
12. Footer/Contact

#### Assets Added
- `public/logo.png` - Main landing page logo
- `public/brands/` - 10 brand logos (Coach, Michael Kors, Crocs, Fossil, Nike, Guess, On, Bath & Body Works, New Balance, Puma)
- Kirkland and Sephora logos to be added later

#### Color Theme Defined
```
Cinnabar (Primary):
  50: #fee7e7, 100: #fdcece, 200: #fb9d9d, 300: #f96c6c,
  400: #f73b3b, 500: #f50a0a, 600: #c40808, 700: #930606,
  800: #620404, 900: #310202, 950: #220101

Secondary: Hot Pink #ff66b3
```

### Files Created
- `docs/post-mvp-features/EPIC-13-app-structure-and-landing-page.md`
- `public/brands/` directory with 10 brand logos
- `public/logo.png`

### Key Decisions
- Cinnabar theme applies to marketing section only (for now)
- Customer/Admin sections keep existing theme until landing page is reviewed
- 10 brands ready, 2 (Kirkland, Sephora) to be added later
- Payment icons use Lucide fallbacks (no custom SVGs yet)
- Task IDs: CP-93 through CP-112 (20 tasks)

### Notes
- PRD and Tech Spec from separate Cangoods landing project were used as reference
- Adapted from Vite+React spec to Next.js App Router with route groups
- Ready for `/phase-workflow` to begin implementation

---

## [2026-01-26 16:00] - EPIC 12 UI Redesign: Menu + Full-Screen Views

### Summary
Based on user feedback, redesigned the settings UI from a collapsible drawer to a slide-in menu with full-screen views for each section.

### Changes

#### New UX Pattern
1. **Hamburger menu** → Opens slide-in drawer with menu items
2. **Click menu item** → Drawer closes, full-screen view opens (like navigating to a new page)
3. **Back arrow** → Returns to dashboard

#### New Components Created
- `src/components/customer/settings-menu.tsx` - Slide-in drawer with menu items (Personal Info, Addresses, Account, Danger Zone, Sign Out)
- `src/components/customer/settings-view.tsx` - Full-screen views for each settings section

#### Deleted Files
- `src/components/customer/settings-drawer.tsx` - Replaced by new menu + view pattern

#### Dashboard Changes
- Added `activeView` state to track which full-screen view is showing
- When `activeView` is set, renders `SettingsViewComponent` instead of dashboard
- When `activeView` is null, shows normal dashboard with `SettingsMenu` drawer

### Files Created
- `src/components/customer/settings-menu.tsx`
- `src/components/customer/settings-view.tsx`

### Files Modified
- `src/app/customer/dashboard/page.tsx` - Uses new components, manages view state

### Files Deleted
- `src/components/customer/settings-drawer.tsx`

### Commits
- `fbbe00d` - fix: add missing @radix-ui/react-collapsible dependency
- `47571f6` - fix: change settings drawer to full-screen view for better UX
- `302489d` - fix: force full-screen styles on settings view
- `4649563` - fix: redesign settings as slide-in menu + full-screen views
- `4384e16` - chore: remove unused settings-drawer component

### Notes
- User feedback: original collapsible drawer was cramped and didn't look good
- New pattern: menu for navigation, full-screen for content editing
- All functionality preserved with better UX

---

## [2026-01-26 12:00] - EPIC 12 Complete: PR Merged & Tagged

### Summary
EPIC 12 PR #9 merged to main and tagged `epic-12-complete`. Fixed Vercel deployment issue with missing dependency.

### Changes
- Merged PR #9 via squash merge
- Tagged release `epic-12-complete`
- Deleted feature branch `feature/dashboard-ui-restructure`
- Fixed missing `@radix-ui/react-collapsible` dependency that blocked Vercel deployment

### Commits
- `fb39db9` - EPIC 12: Customer Dashboard UI Restructuring (#9)
- `fbbe00d` - fix: add missing @radix-ui/react-collapsible dependency

### Notes
- Package was installed locally but package.json changes weren't included in PR
- Vercel deployment failed until dependency was committed

---

## [2026-01-26] - EPIC 12: Customer Dashboard UI Restructuring

### Summary
Restructured the customer dashboard from a 1,286-line monolith into focused main view with slide-out settings drawer. Dashboard reduced to 322 lines with all functionality preserved.

### Changes

#### New Components Created
- `src/components/customer/dashboard-header.tsx` - Header with greeting and hamburger menu
- `src/components/customer/settings-drawer.tsx` - Slide-out drawer with collapsible sections
- `src/components/customer/delivery-preference-card.tsx` - Delivery method/courier card with inline edit
- `src/components/customer/default-address-card.tsx` - Shows only default address
- `src/components/customer/address-dialog.tsx` - Address add/edit modal extracted from page

#### UI Changes Installed
- `src/components/ui/sheet.tsx` - shadcn Sheet component for drawer
- `src/components/ui/collapsible.tsx` - shadcn Collapsible for expandable sections

#### Dashboard Restructuring
**Main Dashboard (visible on load):**
- Header with greeting + hamburger menu (☰)
- Orders section (CustomerOrdersSection)
- Delivery Preference card with inline editing
- Default Address card with "Manage Addresses" link

**Settings Drawer (slides from right):**
- Personal Information (collapsible, editable)
- Delivery Addresses (collapsible, full CRUD)
- Account Info (collapsible)
- Danger Zone (collapsible)
- Sign Out button

### Files Created
- `src/components/ui/sheet.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/customer/dashboard-header.tsx`
- `src/components/customer/settings-drawer.tsx`
- `src/components/customer/delivery-preference-card.tsx`
- `src/components/customer/default-address-card.tsx`
- `src/components/customer/address-dialog.tsx`

### Files Modified
- `src/app/customer/dashboard/page.tsx` - Refactored from 1,286 to 322 lines

### Commits
- `41358d1` - CP-86: Install shadcn Sheet and Collapsible components
- `6234da6` - CP-87: Create DashboardHeader component
- `7c1aa43` - CP-88: Create SettingsDrawer component
- `341cde7` - CP-89: Create DeliveryPreferenceCard component
- `7eecb0c` - CP-90: Create DefaultAddressCard component
- `b1e3316` - CP-91: Refactor dashboard page to use new components

### Test Results
- Build passes
- 94/104 tests passing (10 db-schema tests require live database - pre-existing)
- All functionality preserved

### Notes
- Dashboard page reduced from 1,286 lines to 322 lines (75% reduction)
- All edit/save flows preserved (profile, delivery, addresses)
- "Manage Addresses" on main view opens drawer to addresses section
- Address dialog still works as modal (used from drawer context)
- Mobile responsive with hamburger menu pattern

---

## [2026-01-24] - Customer Login Bug Fixes

### Summary
Fixed three critical bugs affecting customer registration and password reset flows.

### Issues Resolved

#### 1. Pickup Order Registration Freeze
- **Symptom:** Registration form froze when selecting "Pickup" delivery method
- **Root Cause:** Zod validates address fields before running refine function - empty address objects failed field validation
- **Fix:** Clear addresses array completely when pickup is selected (`form.setValue('addresses', [])`)
- **File:** `src/components/forms/customer-form.tsx`

#### 2. Form Auto-Submit on Step Navigation
- **Symptom:** Clicking "Next" from address step immediately submitted the form
- **Root Cause:** Conditional button rendering (submit vs next) caused React to preserve button state
- **Fix:** Single `type="button"` with explicit `onClick` handler that calls `form.trigger()` and `onSubmit()` manually
- **File:** `src/components/forms/customer-form.tsx`

#### 3. Password Reset Link "Expired" Error
- **Symptom:** Clicking password reset link from email showed "Link expired" error
- **Root Cause:** `redirectTo` went directly to `/customer/reset-password` without going through auth callback to establish session
- **Fix:** Changed redirect to `/auth/callback?next=/customer/reset-password`
- **File:** `src/app/customer/forgot-password/page.tsx`

### Files Modified
- `src/components/forms/customer-form.tsx` - Pickup address clearing + auto-submit prevention
- `src/app/customer/forgot-password/page.tsx` - Password reset redirect fix

### Commits
- `c423a3b` - fix(auth): resolve pickup registration freeze and password reset issues

### Key Learnings
1. **Zod field validation runs before refine:** When using conditional validation (like addresses optional for pickup), clear the array entirely rather than leaving empty objects
2. **React button type matters:** Use `type="button"` with explicit onClick for multi-step forms to prevent accidental submissions
3. **Supabase password reset flow:** Reset tokens need to go through auth callback to establish session before reaching the reset page

---

## [2026-01-21] - Zoho Orders Display Enhancement

### Summary
Enhanced order line items display to show description, unit, and rate information from Zoho Books invoices.

### Changes

#### Line Item Display Enhancement
- Added `description` field to show item/product descriptions
- Added `unit` field to show unit of measurement (e.g., "pcs", "kg")
- Now displays rate (unit price) with quantity breakdown
- New format: `Name` → `Description` → `2 pcs × ₱100.00` → `₱200.00`

#### Full Invoice Details Fetch
- **Issue:** Zoho Books list endpoint (`/invoices`) doesn't return `description` and `unit` in line items
- **Fix:** Created `getInvoicesWithDetails()` that fetches full invoice details for each invoice
- Fetches list first (for filtering), then enriches with detail endpoint data
- Results are cached (10-min memory, 1-hour DB) to minimize API calls

### Files Modified
- `src/lib/types/zoho.ts` - Added `description` and `unit` to `OrderDisplay.items`
- `src/lib/services/zoho-books.ts` - Added `getInvoicesWithDetails()` function
- `src/components/orders/order-card.tsx` - Updated display layout for line items
- `src/app/api/customer/orders/route.ts` - Uses `getInvoicesWithDetails`
- `src/app/api/admin/customers/[id]/orders/route.ts` - Uses `getInvoicesWithDetails`

### Commits
- `991f470` - feat(zoho): add description, unit, and rate to order line items
- `8198f53` - fix(zoho): fetch full invoice details for line item data

---

## [2026-01-21] - EPIC 11: Zoho Books Integration - Production Debugging

### Summary
Debugged and fixed multiple issues discovered after deploying EPIC 11 (Zoho Books integration) to production. All issues have been resolved and logged to the debug knowledge base.

### Issues Resolved

#### 1. Zoho OAuth "invalid client" Error
- **Root Cause:** API client was created in Zoho API Console under a different Zoho account than the one with Zoho Books access
- **Fix:** Create API client under the SAME Zoho account that owns the Zoho Books organization
- **Prevention:** Document in setup instructions that the API client must be created under the same account

#### 2. Contact Search Returns Same 25 Results Regardless of Query
- **Root Cause:** Aggressive caching (10-min memory + 1-hr DB) and generic `search_text` parameter
- **Fix:**
  - Removed caching from `searchContacts` function
  - Changed from `search_text` to `contact_name_contains` parameter
  - Added Cache-Control headers to prevent browser caching

#### 3. Invoice Status Error (400 - "Invalid value passed for status")
- **Root Cause:** Zoho Books API doesn't accept comma-separated status values
- **Fix:** Removed status parameter from API call, filter client-side based on `INVOICE_FILTER_STATUSES` mapping

#### 4. Multiple "Cannot read properties of undefined" Errors
- **Root Cause:** Zoho Books list endpoints return minimal data - invoices don't include `line_items` array, and numeric fields may be undefined
- **Fixes Applied:**
  - `result.invoices || []` in API routes
  - `data.invoices || []` in getInvoices service
  - `invoice.line_items || []` in transformInvoiceToOrder
  - `amount ?? 0` in formatCurrency function
  - `(order.balance ?? 0) > 0` in balance comparisons
  - `(order.items || []).map()` in rendering

### Files Modified
- `src/lib/services/zoho-books.ts` - Removed search caching, removed status filter, added defensive checks
- `src/app/api/zoho/contacts/route.ts` - Added Cache-Control headers
- `src/lib/types/zoho.ts` - Added defensive check for line_items
- `src/components/orders/order-card.tsx` - Added null coalescing for undefined values
- `src/app/api/admin/customers/[id]/orders/route.ts` - Added defensive checks
- `src/app/api/customer/orders/route.ts` - Added defensive checks

### Commits
- `69da7bc` - docs: update documentation for EPIC 11 Zoho Books integration
- (debugging fixes committed during session)

### Issue Logs
All issues have been logged to `~/.claude/issuelogs/index.jsonl` for future reference:
- Zoho OAuth "invalid client" error (auth issue)
- Zoho contact search caching (api issue)
- Zoho invoice status filter (api issue)
- Multiple undefined property errors (error issue)

### Key Learnings
1. **Same Account Rule:** Zoho API client must be under the same account as Zoho Books organization
2. **No Search Caching:** Search endpoints should not be cached - users need real-time results
3. **Specific Filters:** Use specific filter parameters (`contact_name_contains`) instead of generic search (`search_text`)
4. **Defensive Coding:** External APIs often return incomplete data - always use defensive checks (`|| []`, `?? 0`, `?.`)
5. **List vs Detail Endpoints:** Zoho list endpoints return less data than detail endpoints - test with real production data

---

## [2026-01-20] - EPIC 11: Zoho Books Integration - Implementation

### Summary
Implemented Zoho Books integration to display customer orders/invoices in both the customer dashboard and admin customer detail page. Customers can now view their order history, and admins can see customer orders when viewing profiles.

### Implementation Phases

**Phase 1: Foundation**
- Created migration `010_zoho_integration.sql` (zoho_contact_id, zoho_tokens, zoho_cache tables)
- Created Zoho TypeScript types (`src/lib/types/zoho.ts`)
- Built Zoho Books service with OAuth token management and caching (`src/lib/services/zoho-books.ts`)
- Created OAuth callback route (`/api/zoho/callback`)
- Created auth status endpoint (`/api/zoho/auth`)

**Phase 2: Customer Linking**
- Created contacts search endpoint (`/api/zoho/contacts`)
- Created link/unlink endpoints (`/api/admin/customers/[id]/zoho-link`)
- Built ZohoLinkDialog component for searching and selecting Zoho contacts
- Built ZohoSection component for admin customer detail page

**Phase 3: Admin Orders Display**
- Created admin orders endpoint (`/api/admin/customers/[id]/orders`)
- Built OrderCard component for invoice display
- Built OrdersDisplay component with Recent/Completed tabs
- Integrated orders into admin customer detail page

**Phase 4: Customer Orders Display**
- Created customer orders endpoint (`/api/customer/orders`)
- Built CustomerOrdersSection component for dashboard
- Integrated orders into customer dashboard

### Files Created
- `supabase/migrations/010_zoho_integration.sql`
- `src/lib/types/zoho.ts`
- `src/lib/services/zoho-books.ts`
- `src/app/api/zoho/auth/route.ts`
- `src/app/api/zoho/callback/route.ts`
- `src/app/api/zoho/contacts/route.ts`
- `src/app/api/admin/customers/[id]/zoho-link/route.ts`
- `src/app/api/admin/customers/[id]/orders/route.ts`
- `src/app/api/customer/orders/route.ts`
- `src/components/admin/zoho-link-dialog.tsx`
- `src/components/admin/zoho-section.tsx`
- `src/components/orders/order-card.tsx`
- `src/components/orders/orders-display.tsx`
- `src/components/orders/customer-orders-section.tsx`

### Files Modified
- `src/lib/types/index.ts` - Added `zoho_contact_id` to Customer interface
- `src/app/admin/customers/[id]/page.tsx` - Added ZohoSection
- `src/app/customer/dashboard/page.tsx` - Added CustomerOrdersSection

### Test Results
- 94/104 tests passing (10 db-schema tests require live database)
- Build passes

### Deployment Steps
1. Run migration `010_zoho_integration.sql` in Supabase SQL Editor
2. Add environment variables to Vercel:
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET`
   - `ZOHO_ORG_ID`
   - `ZOHO_REDIRECT_URI`
3. Complete OAuth flow by visiting `/api/zoho/auth` (POST) to get authorization URL

### Notes
- Zoho region: Canada (uses `.com` API domain)
- Read-only integration (no writes to Zoho)
- Caching: 10-min memory + 1-hour database to stay under API limits
- Customers see "not linked" message until admin links them to Zoho contact

---

## [2026-01-20] - Infrastructure Updates

### Summary
Applied pending migration and resolved known issue.

### Changes
- ✅ **Migration 009 Applied** - `delivery_status_logs.sql` now live in Supabase
  - `delivered_at` column on customers table
  - `delivery_logs` table for audit trail
- ✅ **Auth User Deletion Fixed** - Admin delete now properly removes linked Supabase auth user

### Notes
- Three-state delivery status fully operational
- No more FK violations when re-registering with previously deleted email

---

## [2026-01-20] - EPIC 11: Zoho Books Integration - Planning

### Summary
Planned and documented EPIC 11 feature for integrating Zoho Books to display customer orders/invoices in the application. This enables customers to view their order history and payment status directly in their dashboard, and admins to see customer orders when viewing profiles.

### Planning Completed
- Discussed integration approach and OAuth 2.0 flow
- Confirmed Zoho Books free tier API limits (1,000 calls/day) are sufficient
- Created comprehensive feature specification
- Set up Zoho API credentials in `.env.local`

### Feature Overview
- **Customer Dashboard**: View own invoices (Recent + Completed tabs)
- **Admin Customer Detail**: View any customer's invoices
- **Customer Linking**: Admin links app customers to Zoho Books contacts
- **Caching**: 10-min memory + 1-hour database cache to minimize API calls

### Files Created
- `docs/post-mvp-features/EPIC-11-zoho-books-integration.md` - Feature specification

### Files Modified
- `.env.local` - Added Zoho API credentials (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_ORG_ID, ZOHO_REDIRECT_URI)

### Next Steps
1. Create database migration (010_zoho_integration.sql)
2. Build OAuth callback route
3. Create Zoho Books API service
4. Implement customer linking UI
5. Build orders display components

### Notes
- Zoho region: Canada (uses `.com` API domain)
- Read-only integration (no writes to Zoho in MVP)
- Payment processing deferred to future feature

---

## [2026-01-20] - Delivery Status Enhancement

### Summary
Enhanced delivery status from two-state (Pending/Ready) to three-state (Pending/Ready/Delivered) with full audit trail via delivery logs.

### Changes

#### Database (Migration 009)
- Added `delivered_at` column to customers table
- Created `delivery_logs` table for tracking all status changes
- Created `delivery_action` enum: `confirmed`, `delivered`, `reset`
- Added RLS policies for delivery logs

#### API Updates
- `POST /api/customers/[id]/mark-delivered` - Now sets `delivered_at` timestamp instead of resetting to pending
- `POST /api/customers/[id]/reset-status` - Clears both `delivery_confirmed_at` and `delivered_at`
- `POST /api/admin/bulk-mark-delivered` - Bulk sets `delivered_at` timestamp
- `POST /api/admin/bulk-reset-status` - Bulk clears both status fields
- All endpoints create entries in `delivery_logs` table

#### UI Updates
- Three-state status badges: Pending (gray) → Ready (blue) → Delivered (green)
- "Mark as Delivered" button visible when status is "Ready to Ship"
- "Reset to Pending" button visible when status is "Ready" or "Delivered"
- Added "Delivery History" card to customer detail page showing all status changes with timestamps

### Files Created
- `supabase/migrations/009_delivery_status_logs.sql`

### Files Modified
- `src/lib/types/index.ts` - Added `DeliveryAction`, `DeliveryLog` types
- `src/app/api/customers/[id]/mark-delivered/route.ts`
- `src/app/api/customers/[id]/reset-status/route.ts`
- `src/app/api/admin/bulk-mark-delivered/route.ts`
- `src/app/api/admin/bulk-reset-status/route.ts`
- `src/components/admin/customer-list.tsx` - Three-state badges
- `src/components/admin/status-action-buttons.tsx` - Updated button visibility logic
- `src/app/admin/customers/[id]/page.tsx` - Added delivery history display

### Test Results
- Build passes

---

## [2026-01-19] - EPIC 10: Timezone & Status Reset

### Summary
Implemented timezone standardization to Montreal (Eastern Time) and added admin ability to reset customer "Ready to Ship" status.

### Changes

#### Phase 1: Timezone (CP-76, CP-77)
- Added shared `formatDate()` utility in `src/lib/utils.ts`
- Uses `America/Toronto` timezone with `en-CA` locale
- Updated 6 components to use shared function:
  - `src/components/admin/customer-list.tsx`
  - `src/components/admin/courier-list.tsx`
  - `src/components/admin/email-log-list.tsx`
  - `src/components/admin/email-template-list.tsx`
  - `src/app/admin/customers/[id]/page.tsx`
  - `src/app/customer/dashboard/page.tsx`

#### Phase 2: Single Customer Status Reset (CP-78, CP-79, CP-80)
- Created `POST /api/customers/[id]/reset-status` endpoint
- Created `POST /api/customers/[id]/mark-delivered` endpoint
- Added `StatusActionButtons` component to customer detail page
- Buttons only visible when status is "Ready to Ship"
- Confirmation dialogs before action

#### Phase 3: Bulk Status Operations (CP-81, CP-82, CP-83, CP-84)
- Created `POST /api/admin/bulk-reset-status` endpoint
- Created `POST /api/admin/bulk-mark-delivered` endpoint
- Created `BulkStatusDialog` component with confirmation dialogs
- Added bulk action buttons to customer list (next to Send Email)

#### Phase 4: Tests (CP-85)
- Added `next/navigation` mock to test setup
- Updated locale test description to reflect Montreal timezone

### Files Created
- `src/app/api/customers/[id]/reset-status/route.ts`
- `src/app/api/customers/[id]/mark-delivered/route.ts`
- `src/app/api/admin/bulk-reset-status/route.ts`
- `src/app/api/admin/bulk-mark-delivered/route.ts`
- `src/components/admin/status-action-buttons.tsx`
- `src/components/admin/bulk-status-dialog.tsx`

### Test Results
- 94 passed / 10 failed (pre-existing DB connection tests)
- Build passes

---

## [2026-01-19] - Google OAuth Fix - RESOLVED

### Problem
Google OAuth was broken - both login and signup failed with `auth_callback_error`.

### Root Cause Discovery
After investigating commit history, discovered that:
1. **Original server-side `route.ts` callback WAS working** on production
2. The PKCE "fix" attempts (client-side `page.tsx` + `proxy.ts`) actually broke OAuth
3. Supabase ignores `redirectTo` parameter and redirects to `/?code=xxx` instead of `/auth/callback`
4. Browser caching (304 responses) caused first login attempts to fail

### Solution Applied

| Commit | Fix |
|--------|-----|
| `e3456a2` | Restored original server-side `route.ts` callback |
| `0e9edcd` | Added middleware redirect: `/?code=xxx` → `/auth/callback?code=xxx` |
| `fee1f31` | Added `Cache-Control: no-store` headers + `force-dynamic` export |

### Files Modified
- `src/app/auth/callback/route.ts` - Restored server-side callback with cache prevention
- `src/app/auth/callback/page.tsx` - Deleted (broken client-side approach)
- `src/middleware.ts` - Restored from `proxy.ts`
- `src/proxy.ts` - Deleted
- `src/lib/supabase/middleware.ts` - Added OAuth code redirect logic

### Current State
- ✅ Google OAuth working on production
- ✅ Login flow: Google → `/?code=xxx` → middleware redirects → `/auth/callback` → dashboard
- ⚠️ Browser caching may still cause issues on some browsers (cache headers should help)

### Key Learnings
1. The original implementation was working - don't "fix" what isn't broken
2. PKCE code verifier IS accessible server-side through Supabase cookies
3. The real issue was Supabase ignoring `redirectTo`, not PKCE
4. Always add cache-control headers to auth callback routes

---

## [2026-01-16 19:40] - Google OAuth Redirect Issue Investigation

### Problem
Google OAuth login/signup redirects users to `/customer/login?error=auth_callback_error` instead of proper destination.

### Root Cause Analysis
1. **Supabase ignores `redirectTo` parameter** - Despite setting `redirectTo: /auth/callback`, Supabase redirects to root `/?code=xxx`
2. **PKCE code verifier not accessible server-side** - The code verifier is stored in browser (localStorage/cookies set by client JS), server-side middleware cannot access it
3. **Code exchange fails** - Error: "both auth code and code verifier should be non-empty"

### Attempted Solutions

| Commit | Approach | Result |
|--------|----------|--------|
| `be92293` | Standardize OAuth redirect URLs to `/auth/callback` | ❌ Supabase still redirects to root |
| `4175128` | Middleware redirects `/?code=xxx` to `/auth/callback` | ❌ Loses PKCE context |
| `cc0a36e` | Exchange code directly in middleware | ❌ Code verifier not accessible |
| `3803209` | Add debug logging | Confirmed code verifier missing |
| `052caf4` | Client-side callback page | ❌ Build error: `useSearchParams()` needs Suspense |
| `71fcdcf` | Reverted client-side approach | Current state |

### Next Plan (Option A Recommended)
1. Fix client-side callback with Suspense boundary wrapper
2. Keep middleware redirect to `/auth/callback`
3. Handle code exchange on client where code verifier is accessible

### Additional Issues Discovered
- Next.js 16 deprecation warning: `middleware.ts` should migrate to `proxy`

### Files Created
- `docs/issues/ISSUE-google-oauth-redirect.md` - Detailed issue documentation

### Current State
- Google OAuth is **not working** - both login and signup fail with auth_callback_error
- Email/password auth works fine
- Issue documented, ready to fix in next session

---

## [2026-01-16] - Bug Fixes & Investigation

### Changes
- **Fixed email confirmation links** - Discovered `NEXT_PUBLIC_APP_URL` was incorrectly set to `customer-profile-collector` instead of `customer-profile-registration` in Vercel
- **Tagged EPIC-9** - Created and pushed `epic-9-complete` tag
- **Pushed unpushed commit** - Synced local main with origin
- **Improved API error messages** - Customer creation now shows specific database error details instead of generic "Failed to create customer"
- **Identified auth/customer deletion mismatch** - Root cause of registration FK errors found

### Root Cause Analysis: Registration FK Violation

**Problem:** When registering with an email that was previously used and deleted from admin, users get "Unable to create customer: Key is not present in table users"

**Cause:**
1. User registers with email → creates `auth.users` record + `customers` record
2. Admin deletes customer → only deletes from `customers` table
3. `auth.users` record remains (orphaned)
4. User tries to register again with same email
5. Browser has cached auth session with old `user_id`
6. Customer insert fails because of FK constraint mismatch

**Solution Needed:** When deleting a customer from admin, also delete their linked Supabase auth user (if `user_id` exists)

### Files Modified
- `src/app/api/customers/route.ts` - Improved error messages for FK violations and general errors

### Git
- **Commits:**
  - `c0ef36e` - fix: Improve error messages in customer creation API
  - `50901c6` - Revert "fix: Retry customer creation without user_id if FK violation"
- **Tags:** `epic-9-complete` created and pushed

### Known Issue (To Fix)
- **Auth user not deleted with customer** - Admin delete only removes customer record, not the linked Supabase auth user
- This causes registration issues when the same email is reused

---

## [2026-01-15] - EPIC-9: Admin Email Notifications - DEPLOYED

### Changes
- **CP-62**: Created database migration for email_templates, email_logs, confirmation_tokens tables
- **CP-63**: Added TypeScript types and Zod validation schemas for email features
- **CP-64**: Created Resend email service wrapper with rate limiting (100/day)
- **CP-65**: Built email templates API (CRUD endpoints)
- **CP-66**: Built send email API with bulk send and token generation
- **CP-67**: Built confirmation API for token validation and customer update
- **CP-68**: Built email logs API with history filtering and pagination
- **CP-69**: Created email templates admin page with CRUD UI
- **CP-70**: Created email logs admin page with filtering and detail view
- **CP-71**: Updated customer list with checkboxes, bulk select, "Ready to Ship" column
- **CP-72**: Updated customer detail with Send Email button and Ready to Ship badge
- **CP-73**: Created customer-facing confirmation thank you page
- **CP-74**: Set up Vercel cron job for scheduled email processing
- **CP-75**: Updated admin-components tests for new table structure

### Features Implemented

#### Email Template Management
- Admin UI at `/admin/email-templates` for creating/editing templates
- Template variables: `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{confirm_button}}`, `{{update_profile_link}}`
- Toggle templates active/inactive

#### Email Sending
- Bulk send from customer list (checkbox selection)
- Single send from customer detail page
- Rate limiting: 100 emails per day
- Scheduled send option (processed by daily cron at 8 AM UTC)
- **HTML emails with styled buttons** (green for confirm, red for update profile)

#### One-Click Delivery Confirmation
- Customers click button in email to confirm delivery address
- Secure 32-byte confirmation tokens with 30-day expiry
- Updates `delivery_confirmed_at` timestamp on customer record

#### Ready to Ship Status
- New column in customer list showing "Ready" (green) or "Pending" (yellow)
- Based on `delivery_confirmed_at` being set or null
- Badge in customer detail header

### Database Migration (008_email_notifications.sql)
- `email_templates` table with name, subject, body, variables
- `email_logs` table with status tracking (pending/scheduled/sent/failed)
- `confirmation_tokens` table with expiry and used_at tracking
- Added `delivery_confirmed_at` column to customers
- **RLS policies added** for email_templates, email_logs, confirmation_tokens

### Files Created
- `supabase/migrations/008_email_notifications.sql`
- `src/lib/services/resend.ts` - Email service with HTML buttons and rate limiting
- `src/lib/validations/email.ts` - Email validation schemas
- `src/app/api/admin/email-templates/route.ts` - GET/POST templates
- `src/app/api/admin/email-templates/[id]/route.ts` - GET/PUT/DELETE template
- `src/app/api/admin/send-email/route.ts` - POST bulk send
- `src/app/api/confirm/[token]/route.ts` - GET confirmation handler
- `src/app/api/admin/email-logs/route.ts` - GET email history
- `src/app/api/admin/email-logs/daily-count/route.ts` - GET daily count
- `src/app/api/cron/send-scheduled-emails/route.ts` - Cron processor
- `src/app/admin/email-templates/page.tsx` - Templates admin page
- `src/app/admin/email-logs/page.tsx` - Email logs admin page
- `src/components/admin/email-template-list.tsx` - Template CRUD list
- `src/components/admin/email-template-form-dialog.tsx` - Template form
- `src/components/admin/email-log-list.tsx` - Email history list
- `src/components/admin/send-email-dialog.tsx` - Bulk send dialog
- `src/components/admin/send-single-email-button.tsx` - Single send button
- `src/app/confirm/[token]/page.tsx` - Confirmation thank you page
- `src/components/ui/alert.tsx` - shadcn alert component
- `src/components/ui/textarea.tsx` - shadcn textarea component

### Files Modified
- `src/lib/types/index.ts` - Added EmailTemplate, EmailLog, ConfirmationToken types
- `src/app/admin/page.tsx` - Added Email Templates and Email Logs nav links
- `src/components/admin/customer-list.tsx` - Checkbox selection, Ready to Ship column
- `src/app/admin/customers/[id]/page.tsx` - Send Email button, Ready to Ship badge
- `vercel.json` - Daily cron for scheduled emails (0 8 * * *)
- `test/admin-components.test.tsx` - Updated tests for new columns
- `.env.example` - Added RESEND_API_KEY

### Git
- **Branch:** `feature/admin-email-notifications`
- **PR:** #4 (merged)
- **Status:** ✅ Merged to main and deployed

### Deployment Notes
- Migration 008 applied to Supabase
- RESEND_API_KEY added to Vercel environment
- NEXT_PUBLIC_APP_URL needs to be set to `https://customer-profile-registration.vercel.app`
- Cron changed from hourly to daily (Vercel Hobby tier limitation)

### Test Results
- 94/104 tests passing (10 db-schema tests require live database)
- Build passes
- All admin-components tests updated and passing (39 tests)

### Known Issue (To Fix Next Session)
- **Confirmation page 404**: The `/confirm/[token]` route returns 404 on production
- Production URL is `https://customer-profile-registration.vercel.app` (not collector)
- Route exists in build output and works locally
- Requires investigation in next session

---

## [2026-01-14] - Admin Page Improvements

### Changes
- **CP-60**: Enhanced admin customer detail view to display all customer information
- **CP-61**: Added conditional courier logic to admin edit form

### Features Implemented

#### Admin Customer Detail View (CP-60)
- Display all customer fields: first name, last name, email, phone, contact preference
- Show delivery method and courier selection
- Display profile address when available
- Improved layout for better readability

#### Admin Courier Conditional Logic (CP-61)
- Courier field visibility based on delivery method:
  - **pickup**: No courier field shown
  - **delivered**: LBC + JRS available
  - **cod/cop**: LBC only
- Auto-clears courier when switching to incompatible delivery method
- Consistent with registration form behavior

### Files Modified
- `src/app/admin/customers/[id]/page.tsx` - Enhanced detail view display
- `src/components/admin/edit-customer-form.tsx` - Conditional courier logic

### Git
- **Commit:** `3db8bba CP-60, CP-61: Admin improvements`
- **Merged:** `bdc2fe3 Merge feature/admin-improvements`

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - Address Validation Error Display Fix

### Changes
- **CP-59**: Improved address validation error messages in customer dashboard

### Features Implemented
- Show specific field errors when address validation fails (e.g., "barangay: Barangay is required")
- Added console logging for debugging address save issues
- Better user feedback when required fields are missing

### Files Modified
- `src/app/customer/dashboard/page.tsx` - Enhanced error handling in `handleSaveAddress`

### Notes
- Users now see exactly which field failed validation instead of generic "Validation failed" message
- Helps identify when barangay field is empty after selecting a city

---

## [2026-01-12] - PSGC API Integration

### Changes
- **CP-58**: Integrated official PSGC GitLab API for Philippine location data

### Features Implemented

#### PSGC API Client Service
- Created `src/lib/services/psgc.ts` with caching (memory + localStorage, 7-day duration)
- Runtime API calls to `https://psgc.gitlab.io/api/` for always up-to-date data
- Combined cities (186) + municipalities (1,634) = 1,820 total locations
- Barangays loaded dynamically per city/municipality

#### React Hooks for Location Data
- Created `src/hooks/use-psgc-locations.ts`
- `usePSGCLocations()` - loads and searches city/municipality data
- `useBarangays()` - loads barangays for selected location
- Helper functions: `locationToComboboxOption()`, `barangayToComboboxOption()`

#### Updated All Address Forms
- Registration Form (address-form.tsx, personal-info-step.tsx)
- Customer Dashboard (address modal and profile address)
- Admin Edit Form (edit-customer-form.tsx)
- All use PSGC API with loading states

### Files Created
- `src/lib/services/psgc.ts` - PSGC API client with caching
- `src/hooks/use-psgc-locations.ts` - React hooks for consuming PSGC data

### Files Modified
- `src/app/api/barangays/route.ts` - Uses PSGC API instead of static data
- `src/components/forms/address-form.tsx` - PSGC hook integration
- `src/components/forms/steps/personal-info-step.tsx` - PSGC hook integration
- `src/app/customer/dashboard/page.tsx` - PSGC hook integration
- `src/components/admin/edit-customer-form.tsx` - PSGC hook integration

### Data Improvement
- **Before**: 126 cities (static local file)
- **After**: 1,820 cities/municipalities from official PSGC GitLab API

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - Admin Edit Form Autocomplete

### Changes
- **CP-57**: Added city/barangay autocomplete to admin edit customer form

### Features Implemented

#### City/Barangay Autocomplete in Admin Form
- Added LocationCombobox for city/municipality selection with search
- Added LocationCombobox for barangay (with Input fallback)
- Province and region auto-fill when city is selected
- Province/region become readonly when using autocomplete
- Consistent UX across all forms (registration, customer dashboard, admin)

### Files Modified
- `src/components/admin/edit-customer-form.tsx`

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - Customer Dashboard UI Fixes

### Changes
- **CP-56**: Fixed 4 UI issues in customer dashboard

### Features Implemented

#### 1. Dynamic Greeting
- Replaced static "My Profile" heading with time-based greeting
- "Good Morning/Afternoon/Evening, [Name]!"
- Uses client-side rendering to avoid hydration mismatch

#### 2. Button Overlap Fix
- Moved "Use my address" button below dialog title
- Previously overlapped with X close button in top-right corner
- Now displays cleanly under the description

#### 3. City/Barangay Autocomplete in Address Modal
- Added LocationCombobox for city selection with search
- Barangay dropdown auto-populates based on selected city
- Province and region auto-fill when city is selected
- Fallback to text input when no barangays available

#### 4. Profile Address Editing
- Added profile address section in Personal Information edit mode
- Includes city/barangay autocomplete
- Optional - can be left empty
- Province/region auto-fill when city selected

### Files Modified
- `src/app/customer/dashboard/page.tsx` - All 4 fixes

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - Customer Dashboard Enhancements

### Changes
- **CP-51**: Added profile address display in Personal Information section
- **CP-52**: Changed courier selection to visual cards (matching delivery preference)
- **CP-53**: Added conditional courier logic based on delivery method
- **CP-54**: Added "Use my address" button in address dialog

### Features Implemented

#### 1. Profile Address Display
- Shows in Personal Information section (view mode)
- Displays street, barangay, city, province, postal code, region
- Only visible when profile address exists

#### 2. Visual Courier Selection
- Replaced dropdown with styled radio cards
- Icons: Package for LBC, Truck for JRS
- Description text per courier
- Matches delivery preference card styling

#### 3. Conditional Courier Logic
- Filters couriers based on delivery method:
  - `pickup`: No courier section
  - `delivered`: LBC + JRS
  - `cod/cop`: LBC only
- Auto-clears courier when switching to incompatible method
- Message when only LBC available

#### 4. "Use my address" Button
- Added to address dialog header
- Copies profile name + full address to form
- Only shows when profile address exists

### Files Modified
- `src/app/customer/dashboard/page.tsx` - All 4 changes

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - Registration Form UX Enhancements

### Changes
- **CP-46**: Added profile address input to registration form
- **CP-47**: Added "Copy from Profile" button to address form
- **CP-48**: Added "Use my profile name" checkbox to address form
- **CP-49**: Changed courier selection from dropdown to visual cards

### Features Implemented

#### 1. Profile Address Section (Personal Info Step)
- Optional profile address input during registration
- Uses Philippine address autocomplete (city/barangay comboboxes)
- Auto-fills province and region when city is selected
- Stored in customer's `profile_*` columns

#### 2. "Copy from Profile" Button
- Appears on each delivery address card when profile address exists
- Copies customer name + full profile address in one click
- Also checks the "Use my profile name" checkbox

#### 3. "Use my profile name" Checkbox
- Shows when customer has first/last name entered
- When checked: auto-fills recipient name, fields become readonly
- When unchecked: allows manual entry for different recipients
- State tracked per address (each address independent)

#### 4. Visual Courier Selection
- Changed from dropdown to visual radio cards
- Matches delivery method UI style (icons, descriptions)
- Shows LBC/JRS with appropriate availability messaging

### Files Modified
- `src/components/forms/steps/personal-info-step.tsx` - Profile address section
- `src/components/forms/address-form.tsx` - "Copy from Profile" + "Use my profile name"
- `src/components/forms/steps/delivery-method-step.tsx` - Visual courier cards

### Git
- **Branch:** `feature/registration-form-ux`

### Test Results
- 90/90 unit tests passing
- Build passes

---

## [2026-01-12] - EPIC 8 Implementation Complete

### Changes
- **CP-39**: Created database migrations 006 and 007
- **CP-40**: Updated TypeScript types and Zod validation schemas
- **CP-41**: Updated API routes for new customer/address fields
- **CP-42**: Updated registration form UI (split name, COP option, courier filtering)
- **CP-43**: Updated customer dashboard for new fields
- **CP-44**: Updated admin dashboard for new fields
- **CP-45**: Updated all tests for new schema

### Features Implemented
1. **Split Name Fields**: `name` → `first_name` + `last_name` on customers
2. **Address Names**: Added `first_name` + `last_name` to delivery addresses
3. **Profile Address**: Added optional profile address columns to customers
4. **COP Delivery Method**: Added "Cash on Pickup" option
5. **Courier Filtering**: pickup (none), delivered (LBC/JRS), cod/cop (LBC only)

### Database Migrations
- `006_split_name_and_profile_address.sql` - Split name, add profile address
- `007_address_names_and_cop.sql` - Add names to addresses, add COP delivery method

### Files Created
- `supabase/migrations/006_split_name_and_profile_address.sql`
- `supabase/migrations/007_address_names_and_cop.sql`

### Files Modified
- `src/lib/types/index.ts` - Added first_name/last_name, profile address, COP
- `src/lib/validations/customer.ts` - Updated schemas, added COURIER_OPTIONS
- `src/app/api/customers/route.ts` - Handle new fields in POST
- `src/app/api/customers/[id]/route.ts` - Handle new fields in PUT
- `src/components/forms/steps/personal-info-step.tsx` - Split name inputs
- `src/components/forms/steps/delivery-method-step.tsx` - COP option, courier filtering
- `src/components/forms/address-form.tsx` - Added name fields to addresses
- `src/components/forms/steps/review-step.tsx` - Display new fields
- `src/components/forms/customer-form.tsx` - Updated defaults
- `src/app/customer/dashboard/page.tsx` - Full update for new fields
- `src/components/admin/customer-list.tsx` - Search by first/last name
- `src/components/admin/edit-customer-form.tsx` - Edit new fields
- `src/app/admin/customers/[id]/page.tsx` - Display new fields
- `test/customer-validation.test.ts` - 54 tests updated
- `test/admin-components.test.tsx` - 36 tests updated
- `test/db-schema.test.ts` - Updated test data

### Git
- **Commit:** `e63d90c CP-39-45: EPIC 8 - Customer profile enhancements`
- **Branch:** `feature/customer-profile-enhancements`

### Test Results
- 90/90 unit tests passing (customer-validation + admin-components)
- Build passes
- Lint passes (pre-existing warnings only)

### Notes
- Database migrations 006 and 007 have been run in Supabase
- Ready for push, PR, and merge

---

## [2026-01-12] - EPIC 8 Planning Session

### Changes
- **Planning**: Designed EPIC 8 (Customer Profile Enhancements)
- Created comprehensive implementation plan for 6 major changes
- Defined 7-step phase workflow (Branch → Build → Test → Review → Document → Merge → Tag)
- Mapped out 7 implementation phases (CP-39 through CP-45)

### Planned Features (EPIC 8)
1. Split `name` into `first_name` + `last_name` on customers table
2. Add profile address to customer (optional, single address)
3. Add `first_name` + `last_name` to delivery addresses (required)
4. Add `cop` (Cash on Pickup) delivery method
5. Conditional courier selection based on delivery method
6. "Use my profile name" and "Copy from profile address" UX features

### Delivery Method & Courier Matrix
| Method | Address | Couriers |
|--------|---------|----------|
| pickup | No | None |
| delivered | Yes | LBC, JRS |
| cod | Yes | LBC only |
| cop | Yes | LBC only |

### Files Modified
- `CLAUDE.md` - Added EPIC 8 section and branch name
- `docs/project_status.md` - Added EPIC 8 plan details
- `docs/change_logs.md` - Added planning session entry

### Plan File
- `C:\Users\Baroroy\.claude\plans\hidden-singing-harp.md`

### Pre-requisites Before Starting EPIC 8
- [ ] Merge `feature/courier-selection` to main
- [ ] Run migration `005_add_courier.sql` in Supabase

### Notes
- User clarified: Profile address is single address on customer (columns, not separate table)
- User clarified: COP address is customer's chosen courier pickup location (instruction only)
- User clarified: Address names are required but can use "Use my profile name" checkbox

---

## [2026-01-10] - Courier Selection Feature

### Changes
- **Feature**: Added admin-managed courier selection for Delivery/COD orders
- Created `couriers` table with LBC and JRS as default options
- Added courier dropdown in registration form (visible for delivery/cod only)
- Admin can add/edit/deactivate couriers via `/admin/couriers`
- Customer dashboard shows and allows editing courier preference
- Admin customer views display and allow editing courier

### Files Created
- `supabase/migrations/005_add_courier.sql` - Database migration
- `src/lib/validations/courier.ts` - Courier validation schemas
- `src/app/api/couriers/route.ts` - GET/POST couriers API
- `src/app/api/couriers/[id]/route.ts` - GET/PUT/DELETE courier API
- `src/app/admin/couriers/page.tsx` - Admin courier management page
- `src/components/admin/courier-list.tsx` - Courier list with CRUD
- `src/components/admin/courier-form-dialog.tsx` - Add/edit courier dialog

### Files Modified
- `supabase/schema.sql` - Added couriers table
- `src/lib/types/index.ts` - Added Courier interface, updated Customer
- `src/lib/validations/customer.ts` - Added courier validation
- `src/components/forms/steps/delivery-method-step.tsx` - Added courier dropdown
- `src/components/forms/steps/review-step.tsx` - Display courier in review
- `src/app/api/customers/route.ts` - Handle courier in POST
- `src/app/api/customers/[id]/route.ts` - Handle courier in PUT
- `src/app/api/customer/profile/route.ts` - Handle courier in PUT
- `src/app/admin/page.tsx` - Added link to courier management
- `src/app/admin/customers/[id]/page.tsx` - Display courier in detail view
- `src/components/admin/edit-customer-form.tsx` - Edit courier in admin form
- `src/app/customer/dashboard/page.tsx` - Display/edit courier in profile
- `test/customer-validation.test.ts` - Added courier to test data
- `test/db-schema.test.ts` - Added delivery_method to test data

### Git
- **Commit:** `afdd629 CP-38: Add courier selection feature`
- **Branch:** `feature/courier-selection`
- **Status:** Committed locally, not pushed

### Deployment Steps
1. Run `supabase/migrations/005_add_courier.sql` in Supabase SQL Editor
2. `git push -u origin feature/courier-selection`
3. Create PR and merge to `main`
4. Vercel auto-deploys on merge

### Notes
- Courier is required for delivery/cod orders, not needed for pickup
- Admins can deactivate couriers (soft-delete) to hide from dropdowns
- Existing customer data is preserved when courier is deactivated

---

## [2026-01-09 Session 2] - EPIC 7 Complete

### Changes
- **CP-27**: Created Stepper UI component (`src/components/ui/stepper.tsx`)
- **CP-28**: Created Personal Info step component
- **CP-29**: Created Delivery Method step component with visual cards
- **CP-30**: Created Address step and Review step components
- **CP-31**: Refactored CustomerForm to multi-step wizard
- Configured Google OAuth in Supabase Dashboard
- Disabled email verification for simpler signup flow
- Updated all documentation to reflect EPIC 7 completion

### Files Created
- `src/components/ui/stepper.tsx` - Reusable stepper component
- `src/components/forms/steps/personal-info-step.tsx` - Step 1
- `src/components/forms/steps/delivery-method-step.tsx` - Step 2
- `src/components/forms/steps/address-step.tsx` - Step 3
- `src/components/forms/steps/review-step.tsx` - Step 4
- `src/components/forms/steps/index.ts` - Barrel export

### Files Modified
- `src/components/forms/customer-form.tsx` - Multi-step wizard implementation
- `CLAUDE.md` - Marked EPIC 7 as complete
- `docs/project_status.md` - Updated project status
- `docs/change_logs.md` - Added session entry

### Notes
- All EPIC 7 sections now complete (7.1, 7.2, 7.3, 7.4)
- Build passing with no errors
- Ready to merge to main and tag `epic-7-complete`

---

## [2026-01-09 14:50]

### Changes
- Updated EPIC 7 progress tracker in CLAUDE.md to reflect actual completion status
- Marked EPIC 7.1 (Customer Authentication) as complete
- Marked EPIC 7.3 (Philippine Address Autocomplete) as complete
- Marked EPIC 7.4 (Supabase Keep-Alive) as complete
- Noted EPIC 7.2 (Multi-Step Registration Form) as NOT STARTED

### Files Modified
- `CLAUDE.md` - Updated progress tracker
- `docs/change_logs.md` - Added session entry
- `docs/project_status.md` - Updated current state

### Notes
- Build passing, no TODO/FIXME comments in codebase
- Stashed work from previous session was cleared

---

## [2026-01-07 Session]

### Changes
- Reviewed EPIC 7 implementation status
- Verified customer authentication system is fully implemented (CP-20 to CP-26)
- Verified Philippine address autocomplete is complete (CP-32 to CP-36)
- Verified Supabase keep-alive is configured (CP-37 to CP-38)
- Identified multi-step registration form (CP-27 to CP-31) as NOT implemented
- Created docs/ folder for project documentation

### Files Verified
- `src/app/customer/login/page.tsx` - Customer login (Google + Email/Password)
- `src/app/customer/signup/page.tsx` - Customer signup
- `src/app/customer/dashboard/page.tsx` - Customer dashboard with profile editing
- `src/app/customer/forgot-password/page.tsx` - Password reset request
- `src/app/customer/reset-password/page.tsx` - Password reset completion
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/components/ui/location-combobox.tsx` - Philippine address autocomplete
- `src/app/api/health/route.ts` - Health check endpoint
- `vercel.json` - Cron job configuration for keep-alive
- `supabase/migrations/003_add_customer_fields.sql` - user_id and delivery_method columns
- `supabase/migrations/004_customer_auth_rls.sql` - Customer auth RLS policies

### Notes
- CLAUDE.md tracker shows all EPIC 7 tasks as incomplete but most are actually done
- The feature branch `feature/customer-ux-enhancement` was already merged to main
- Multi-step registration form is the only remaining work for EPIC 7
