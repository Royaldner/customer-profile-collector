# Project Status

**Last Updated:** 2026-01-27 21:00

## Overview

Customer Profile Collector - A customer profile collection system for a small business (Cangoods). EPIC 1-14 implemented. Automatic Zoho Books customer sync now available.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** EPIC 14 merged, testing Vercel cron deployment

### Recent Work - EPIC 14: Automatic Zoho Books Customer Sync

Implemented automatic customer sync to Zoho Books:

**Registration Flow:**
- New "Customer History" step asking if new or returning customer
- Selection stored in `is_returning_customer` field

**Background Processing:**
- `zoho_sync_queue` table for job processing
- Cron job processes pending syncs (daily schedule due to Vercel limits)
- Retry logic with exponential backoff (max 3 attempts)

**Sync Logic:**
- New customers → Create Zoho contact with profile address
- Returning customers → Search by email, then name
- Single match → Auto-link
- Multiple matches → Mark as 'skipped' for admin review
- No match → Mark as 'failed'

**Admin UI:**
- Sync status column in customer list
- Sync status filter dropdown
- Retry Sync / Link Manually buttons
- "Sync Profile to Zoho" button for linked customers

### Cron Job Issue (In Progress)

Vercel Hobby tier cron limits are causing deployment failures:
- Hourly cron (`0 * * * *`) failed
- Currently testing daily cron (`0 0 * * *`)
- May need external cron service (cron-job.org) for more frequent syncs

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
- Background sync queue with cron processing
- Auto-create Zoho contacts for new customers
- Auto-link returning customers to existing Zoho contacts
- Admin sync status visibility and retry controls
- "Sync Profile to Zoho" for admin-controlled data sync

## Deployment Pending

**EPIC 14 requires:**
1. Run migration `011_zoho_sync.sql` in Supabase
2. Re-authorize Zoho Books for CREATE scope (delete `zoho_tokens`, reconnect)
3. Resolve Vercel cron deployment issue

## Database State

**Migrations (001-011):**
- 001-010: All applied
- 011: `011_zoho_sync.sql` - **PENDING** (needs to be run in Supabase)

## Git State

- **Current Branch:** `main`
- **Latest Commit:** EPIC 14 merged
- **Tags:** `epic-1-complete` through `epic-13-complete` ✅

## Test Status

- **Unit Tests:** 94/104 passing (10 db-schema tests require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings only)

## Next Steps

1. **Resolve Vercel cron issue** - Test if daily schedule deploys
2. **Run migration 011** in Supabase
3. **Re-authorize Zoho** for CREATE scope
4. **Consider external cron** (cron-job.org) for hourly sync if needed
5. **Tag release** `epic-14-complete` after deployment verified

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
| Cron Endpoint | `src/app/api/cron/zoho-sync/route.ts` |
| Admin Sync Trigger | `src/app/api/admin/customers/[id]/zoho-sync/route.ts` |
| Zoho Section (Admin) | `src/components/admin/zoho-section.tsx` |
| Customer List | `src/components/admin/customer-list.tsx` |
| Migration | `supabase/migrations/011_zoho_sync.sql` |
