# Project Status

**Last Updated:** 2026-02-02 16:15

## Overview

Customer Profile Collector - A customer profile collection system for a small business (Cangoods). EPIC 1-14 implemented. Zoho Books customer sync runs inline during registration.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `feature/how-to-pay` (ready for merge)
**Status:** EPIC 15 implemented, pending QR images and merge

### Recent Work - EPIC 15: How to Pay (Implementation Complete)

Implemented payment instructions UI with two entry points:

- **Settings entry**: "How to Pay" menu item with Wallet icon (between Account and Danger Zone)
- **Pay Now entry**: Button on order cards with balance > 0 in Recent tab
- **Payment modals**: GCash + BPI dialogs with QR codes, instructions, copiable fields
- **Order context**: Pay Now adds copiable Invoice Number + Amount with "50% required upon order" note
- **Clipboard**: Copy-to-clipboard with execCommand fallback + sonner toast feedback
- **Tests**: 16 unit tests covering clipboard, modal, view, and Pay Now button

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

## Planned Features

### EPIC 15: How to Pay (Implementation Complete, Pending Merge)
- Payment instructions UI with GCash + BPI modals
- QR codes + copiable account details
- "Pay Now" button on order cards with invoice/amount context
- Clipboard utility with fallback for mobile browsers
- 16 tests passing
- **Pending:** QR code images (`public/images/gcash-qr.png`, `public/images/bpi-qr.png`) — modals work without them

## Deployment Pending

**Migration 012:**
- Run `012_drop_sync_queue.sql` in Supabase to drop the unused `zoho_sync_queue` table

## Database State

**Migrations (001-012):**
- 001-011: All applied
- 012: `012_drop_sync_queue.sql` — **PENDING** (drops `zoho_sync_queue` table)

## Git State

- **Current Branch:** `feature/how-to-pay`
- **Latest Commit:** feat(payments): add How to Pay view with GCash/BPI payment modals
- **Tags:** `epic-1-complete` through `epic-13-complete`

## Test Status

- **Unit Tests:** 107/120 passing (13 db-schema tests require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings only)

## Next Steps

1. **Run migration 012** in Supabase (drop queue table)
2. **Provide QR images** for EPIC 15 (`public/images/gcash-qr.png`, `public/images/bpi-qr.png`)
3. **Merge EPIC 15** — PR from `feature/how-to-pay` to `main`
4. **Tag releases** `epic-14-complete` and `epic-15-complete` after deployment verified

## Key Files

| Feature | File |
|---------|------|
| EPIC 15 Spec | `docs/post-mvp-features/EPIC-15-how-to-pay.md` |
| Payment Config | `src/lib/constants/payment-methods.ts` |
| Payment Modal | `src/components/customer/payment-modal.tsx` |
| How to Pay View | `src/components/customer/how-to-pay-view.tsx` |
| Clipboard Utility | `src/lib/utils/clipboard.ts` |
| Customer History Step | `src/components/forms/steps/customer-history-step.tsx` |
| Zoho Sync Service | `src/lib/services/zoho-sync.ts` |
| Zoho Books Service | `src/lib/services/zoho-books.ts` |
| Order Card | `src/components/orders/order-card.tsx` |
| Customer Orders Section | `src/components/orders/customer-orders-section.tsx` |
| Settings Menu | `src/components/customer/settings-menu.tsx` |
| Settings View | `src/components/customer/settings-view.tsx` |
| Health Keep-Alive | `src/app/api/health/route.ts` |
| Migration (drop queue) | `supabase/migrations/012_drop_sync_queue.sql` |
