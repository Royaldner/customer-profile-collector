# Project Status

**Last Updated:** 2026-02-02 13:00

## Overview

Customer Profile Collector - A customer profile collection system for a small business (Cangoods). EPIC 1-14 implemented. Zoho Books customer sync runs inline during registration.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** Inline Zoho sync merged, queue infrastructure removed

### Recent Work - Inline Zoho Sync (Remove Cron Queue)

Replaced cron-based background sync with inline execution during registration:

**Before:** Customer registers → queued in `zoho_sync_queue` → cron job processes later
**After:** Customer registers → Zoho sync runs immediately (non-blocking)

**Changes:**
- `syncCustomerToZoho()` replaces queue-based processing
- Cron endpoint deleted, queue table can be dropped
- Admin retry/manual sync still functional
- `vercel.json` now only has health keep-alive cron

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

### EPIC 13: App Structure & Landing Page (100% Complete)
- Route groups: (marketing), (customer), (admin), (shop) stub
- Beautiful landing page with 12 sections
- Sticky navbar with mobile hamburger menu
- Dark footer with contact and social links
- Cinnabar color theme applied to entire app

### EPIC 14: Automatic Zoho Books Customer Sync (100% Complete)
- Customer history step in registration (new/returning)
- **Inline sync during registration** (no longer cron-based)
- Auto-create Zoho contacts for new customers
- Auto-link returning customers to existing Zoho contacts
- Admin sync status visibility and retry controls
- "Sync Profile to Zoho" for admin-controlled data sync

## Deployment Pending

**Migration 012:**
- Run `012_drop_sync_queue.sql` in Supabase to drop the unused `zoho_sync_queue` table

## Database State

**Migrations (001-012):**
- 001-011: All applied
- 012: `012_drop_sync_queue.sql` — **PENDING** (drops `zoho_sync_queue` table)

## Git State

- **Current Branch:** `main`
- **Latest Commit:** Inline Zoho sync merged
- **Tags:** `epic-1-complete` through `epic-13-complete`

## Test Status

- **Unit Tests:** 91/104 passing (13 db-schema tests require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings only)

## Next Steps

1. **Run migration 012** in Supabase (drop queue table)
2. **Deploy to Vercel** — verify no cron-related issues
3. **Tag release** `epic-14-complete` after deployment verified

## Future Enhancements

- **EPIC 15:** Payment processing (PayMongo integration)
- **EPIC 16:** Product catalog and order creation
- **Future:** Blog/SEO, Multi-language, Referral program

## Key Files

| Feature | File |
|---------|------|
| Customer History Step | `src/components/forms/steps/customer-history-step.tsx` |
| Zoho Sync Service | `src/lib/services/zoho-sync.ts` |
| Zoho Books Service | `src/lib/services/zoho-books.ts` |
| Admin Sync Trigger | `src/app/api/admin/customers/[id]/zoho-sync/route.ts` |
| Zoho Section (Admin) | `src/components/admin/zoho-section.tsx` |
| Customer List | `src/components/admin/customer-list.tsx` |
| Health Keep-Alive | `src/app/api/health/route.ts` |
| Migration (drop queue) | `supabase/migrations/012_drop_sync_queue.sql` |
