# Project Status

**Last Updated:** 2026-01-20

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-11 implemented. EPIC 11 pending deployment.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `feature/zoho-books-integration`
**Status:** EPIC 11 implementation complete, pending PR merge and deployment

### EPIC 11 - Zoho Books Integration (Implementation Complete)

**Feature Spec:** `docs/post-mvp-features/EPIC-11-zoho-books-integration.md`

**Goal:** Display customer orders/invoices from Zoho Books in:
- Customer dashboard (self-service order tracking)
- Admin customer detail page (full customer context)

**Implementation Complete:**
- [x] Phase 1: Foundation - Database migration, OAuth callback, Zoho service
- [x] Phase 2: Customer Linking - Admin UI to link customers to Zoho contacts
- [x] Phase 3: Admin Orders View - Display invoices in admin customer detail
- [x] Phase 4: Customer Orders View - Display invoices in customer dashboard
- [x] Phase 5: Documentation and PR

**Deployment Steps (After PR Merge):**
1. Run migration `010_zoho_integration.sql` in Supabase SQL Editor
2. Add environment variables to Vercel (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_ORG_ID, ZOHO_REDIRECT_URI)
3. Complete OAuth flow to connect Zoho Books

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

**Migrations (001-010):**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table
- 006_split_name_and_profile_address.sql - Split name, profile address
- 007_address_names_and_cop.sql - Address names, COP delivery method
- 008_email_notifications.sql - Email templates, logs, tokens
- 009_delivery_status_logs.sql - `delivered_at`, `delivery_logs` table ✅
- 010_zoho_integration.sql - `zoho_contact_id`, `zoho_tokens`, `zoho_cache` (pending)

**Next Migration:** Apply 010_zoho_integration.sql after PR merge

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

- **Current Branch:** `feature/zoho-books-integration`
- **Latest Commits (on feature branch):**
  - `dc0d465` - feat(zoho): add Phase 4 customer orders display in dashboard
  - `c8b55aa` - feat(zoho): add Phase 3 admin orders display from Zoho Books
  - `c28e643` - feat(zoho): add Phase 2 customer linking to Zoho Books
  - `9a498f5` - feat(zoho): add Phase 1 foundation for Zoho Books integration
  - `f0c572a` - docs(zoho): add EPIC 11 Zoho Books integration planning
- **Tags:** `epic-1-complete` through `epic-10-complete` ✅ (epic-11-complete pending)

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

1. **Merge EPIC 11 PR** - Review and merge to main
2. **Apply Migration 010** - Run in Supabase SQL Editor
3. **Add Zoho Env Vars to Vercel** - ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_ORG_ID, ZOHO_REDIRECT_URI
4. **Complete OAuth Flow** - Connect to Zoho Books via admin
5. **Tag epic-11-complete** - After successful deployment

## Future Enhancements

- **EPIC 12:** Payment processing (PayMongo integration)
- **EPIC 13:** Product catalog and order creation
