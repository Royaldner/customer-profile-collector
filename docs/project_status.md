# Project Status

**Last Updated:** 2026-01-20

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-10 implemented and deployed to production. EPIC 11 (Zoho Books Integration) in planning.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** EPIC 11 planning complete, ready for implementation

### In Progress: EPIC 11 - Zoho Books Integration

**Feature Spec:** `docs/post-mvp-features/EPIC-11-zoho-books-integration.md`

**Goal:** Display customer orders/invoices from Zoho Books in:
- Customer dashboard (self-service order tracking)
- Admin customer detail page (full customer context)

**Planning Complete:**
- [x] OAuth 2.0 flow documented
- [x] API limits confirmed (1,000 calls/day free tier - sufficient)
- [x] Feature spec created
- [x] Zoho API credentials configured in `.env.local`

**Implementation Phases:**
1. Foundation - Database migration, OAuth callback, Zoho service
2. Customer Linking - Admin UI to link customers to Zoho contacts
3. Admin Orders View - Display invoices in admin customer detail
4. Customer Orders View - Display invoices in customer dashboard
5. Polish - Testing, error handling, documentation

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

## Database State

**Migrations (001-009):**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table
- 006_split_name_and_profile_address.sql - Split name, profile address
- 007_address_names_and_cop.sql - Address names, COP delivery method
- 008_email_notifications.sql - Email templates, logs, tokens
- 009_delivery_status_logs.sql - `delivered_at`, `delivery_logs` table ✅

**Next Migration:** 010_zoho_integration.sql (EPIC 11)

## Environment Variables

### Currently Set (Vercel)

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `ADMIN_USERNAME` | ✅ Set |
| `ADMIN_PASSWORD` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `NEXT_PUBLIC_APP_URL` | ✅ Set |

### Needed for EPIC 11 (Local Only - Not Yet in Vercel)

| Variable | Status |
|----------|--------|
| `ZOHO_CLIENT_ID` | ✅ Set locally |
| `ZOHO_CLIENT_SECRET` | ✅ Set locally |
| `ZOHO_ORG_ID` | ✅ Set locally |
| `ZOHO_REDIRECT_URI` | ✅ Set locally |

## Git State

- **Current Branch:** `main`
- **Latest Commits:**
  - `a49da7d` - docs: Update documentation for delivery status enhancement
  - `5756e7e` - feat(admin): Add three-state delivery status and delivery logs (#7)
  - `acae505` - feat(admin): EPIC 10 - Timezone and Status Reset (#6)
- **Tags:** `epic-1-complete` through `epic-10-complete` ✅

## Test Status

- **Unit Tests:** 94/104 passing
  - customer-validation.test.ts: 54 tests
  - admin-components.test.tsx: 39 tests
  - db-schema.test.ts: 1/11 passing (10 require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings)

## Key Files

| Feature | File |
|---------|------|
| OAuth Callback | `src/app/auth/callback/route.ts` |
| Supabase Middleware | `src/lib/supabase/middleware.ts` |
| Types & Interfaces | `src/lib/types/index.ts` |
| Validation Schemas | `src/lib/validations/customer.ts` |
| PSGC API Client | `src/lib/services/psgc.ts` |
| Resend Email Service | `src/lib/services/resend.ts` |
| Multi-Step Form | `src/components/forms/customer-form.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Admin Customer List | `src/components/admin/customer-list.tsx` |
| Admin Customer Detail | `src/app/admin/customers/[id]/page.tsx` |

## Next Steps

1. **Start EPIC 11 Phase 1** - Database migration and OAuth flow
2. **EPIC 11 Phase 2** - Customer linking UI
3. **EPIC 11 Phase 3-4** - Orders display in admin and customer views

## Future Enhancements

- **EPIC 11:** Zoho Books Integration (in progress)
- **EPIC 12:** Payment processing (PayMongo integration)
- **EPIC 13:** Product catalog and order creation
