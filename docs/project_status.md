# Project Status

**Last Updated:** 2026-01-26 20:00

## Overview

Customer Profile Collector - A customer profile collection system for a small business (Cangoods). EPIC 1-12 implemented and deployed. EPIC 13 (App Structure & Landing Page) planned and ready for implementation.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** EPIC 13 planned, ready for implementation

### Recent Work - EPIC 13 Planning

Planned comprehensive restructuring of the app with Next.js route groups and a new conversion-optimized landing page:

**Route Group Structure:**
```
src/app/
├── (marketing)/     # Landing page, future about/faq/contact
├── (customer)/      # Registration, dashboard, auth
├── (admin)/         # Admin dashboard
├── (shop)/          # Future: e-commerce (stub)
└── api/             # Unchanged
```

**Landing Page Sections (12):**
1. Hero → 2. Brands → 3. Free Shipping → 4. How It Works → 5. Flexible Payment → 6. Authenticity → 7. Payment Methods → 8. About → 9. FAQ → 10. Order Tracking → 11. Price Watch → 12. Footer

**New Color Theme (Marketing Only):**
- Primary: Cinnabar (red palette)
- Secondary: Hot Pink (#ff66b3)
- Customer/Admin sections keep existing theme for now

## Completed Features

### EPIC 1-6: Core Application (100% Complete)
- Project setup with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- Database schema with customers and addresses tables
- Customer registration form with Zod validation
- Admin dashboard with search, filter, CRUD operations
- Admin authentication (cookie-based)
- Mobile responsiveness
- Deployed to Vercel

### EPIC 7: Customer UX Enhancement (100% Complete)
- Google OAuth + Email/Password authentication
- Multi-step registration form with stepper UI
- Philippine address autocomplete (PSGC API)
- Supabase keep-alive cron job

### EPIC 8: Customer Profile Enhancements (100% Complete)
- Split `name` into `first_name` + `last_name`
- Profile address columns on customers table
- Address names (recipient first/last name)
- COP (Cash on Pickup) delivery method
- Courier filtering based on delivery method

### EPIC 9: Admin Email Notifications (100% Complete)
- Email template management
- Bulk/single email sending via Resend
- One-click delivery confirmation
- Ready to Ship status tracking
- Email history and logs

### EPIC 10: Timezone & Status Reset (100% Complete)
- Montreal timezone (`America/Toronto`) for all timestamps
- Three-state delivery status (Pending → Ready → Delivered)
- Single and bulk status actions
- Delivery logs audit trail

### EPIC 11: Zoho Books Integration (100% Complete)
- Customer orders display from Zoho Books
- Admin customer linking to Zoho contacts
- OAuth token management with caching
- Invoice display with line item details

### EPIC 12: Dashboard UI Restructuring (100% Complete)
- Hamburger menu with slide-in drawer
- Menu items open full-screen views
- Main view shows Orders, Delivery Preference, Default Address
- Full settings editing in full-screen views
- Dashboard page reduced from 1,286 to ~425 lines

## In Progress

### EPIC 13: App Structure & Landing Page (Planned)
**Branch:** `feature/app-structure-landing-page`
**Spec:** `docs/post-mvp-features/EPIC-13-app-structure-and-landing-page.md`

**Tasks (CP-93 to CP-112):**
- [ ] CP-93: Update globals.css with cinnabar color palette
- [ ] CP-94: Create route group structure and migrate existing routes
- [ ] CP-95-96: Create marketing layout (navbar + footer)
- [ ] CP-97: Create static data files
- [ ] CP-98-108: Build all 12 landing page sections
- [ ] CP-109-112: Integration, smooth scroll, mobile, accessibility

**Assets Ready:**
- `public/logo.png` ✅
- `public/brands/` - 10 logos ✅ (Kirkland, Sephora pending)

**Next Action:** Run `/phase-workflow` to start implementation

## Database State

**Migrations (001-010):**
- 001_create_tables.sql ✅
- 002_enable_rls.sql ✅
- 003_add_customer_fields.sql ✅
- 004_customer_auth_rls.sql ✅
- 005_add_courier.sql ✅
- 006_split_name_and_profile_address.sql ✅
- 007_address_names_and_cop.sql ✅
- 008_email_notifications.sql ✅
- 009_delivery_status_logs.sql ✅
- 010_zoho_integration.sql ✅

**All migrations applied.** No new migrations needed for EPIC 13.

## Git State

- **Current Branch:** `main`
- **Tags:** `epic-1-complete` through `epic-12-complete` ✅

## Test Status

- **Unit Tests:** 94/104 passing
- **Build:** Passing
- **Lint:** Passing

## Future Enhancements

- **EPIC 14:** Payment processing (PayMongo integration)
- **EPIC 15:** Product catalog and order creation
- **Future:** Blog/SEO, Multi-language, Referral program

## Key Files

| Feature | File |
|---------|------|
| EPIC 13 Spec | `docs/post-mvp-features/EPIC-13-app-structure-and-landing-page.md` |
| Landing Page Logo | `public/logo.png` |
| Brand Logos | `public/brands/*.svg` |
| Current Landing | `src/app/page.tsx` (to be replaced) |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Admin Dashboard | `src/app/admin/page.tsx` |
