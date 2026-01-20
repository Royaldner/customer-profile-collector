# Project Status

**Last Updated:** 2026-01-20

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-10 implemented and deployed to production.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** All features complete, delivery status enhancement merged

### Recent Fix: Google OAuth (2026-01-19)

**Issue:** Google OAuth was broken - login/signup failed with `auth_callback_error`

**Solution:**
1. Restored original server-side `route.ts` callback (was working before)
2. Added middleware redirect: `/?code=xxx` → `/auth/callback?code=xxx`
3. Added cache-control headers to prevent 304 responses

**Commits:** `e3456a2`, `0e9edcd`, `fee1f31`

**Status:** ✅ Working on production

### Known Issue (Priority: High)

**Auth User Not Deleted With Customer**

When admin deletes a customer, only the `customers` table record is removed. The linked Supabase `auth.users` record remains orphaned.

**Impact:**
- If the same email tries to register again, the browser may have a cached auth session
- Customer insert fails with FK violation: "Key is not present in table users"

**Solution:** When deleting a customer from admin, also delete their Supabase auth user if `user_id` exists.
- Requires `SUPABASE_SERVICE_ROLE_KEY` for admin operations

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

#### 7.1 Customer Authentication ✅
- Google OAuth configured and working
- Email/password signup (no email verification)
- Customer login, signup, forgot/reset password pages
- OAuth callback handler with cache prevention
- Customer dashboard with profile editing

#### 7.2 Multi-Step Registration Form ✅
- Stepper UI component with visual progress
- Step 1: Personal Info (first name, last name, email, phone, contact preference)
- Step 2: Delivery Method (pickup, delivered, cod, cop) with visual cards
- Step 3: Address (skipped for pickup orders)
- Step 4: Review & Submit
- Step-by-step validation before proceeding

#### 7.3 Philippine Address Autocomplete ✅
- LocationCombobox component for city/barangay search
- **PSGC GitLab API integration** (1,820 cities/municipalities from official source)
- Runtime API calls with memory + localStorage caching (7-day duration)
- Barangays API route (dynamic loading per city)
- Auto-fill province and region on city selection

#### 7.4 Supabase Keep-Alive ✅
- Health check API endpoint (`/api/health`)
- Vercel Cron job (weekly ping on Sundays)

### EPIC 10: Timezone & Status Reset (100% Complete)

#### 10.1 Timezone Standardization ✅
- All timestamps display in Montreal timezone (`America/Toronto`)
- Uses `en-CA` locale format
- Shared `formatDate()` utility in `src/lib/utils.ts`

#### 10.2 Three-State Delivery Status ✅
- **Pending** (gray) - Customer has not confirmed delivery address
- **Ready to Ship** (blue) - Customer confirmed, awaiting delivery
- **Delivered** (green) - Order has been delivered
- Status tracked via `delivery_confirmed_at` and `delivered_at` columns

#### 10.3 Single Customer Status Actions ✅
- "Reset to Pending" button on customer detail page (visible for Ready/Delivered)
- "Mark as Delivered" button on customer detail page (visible for Ready only)
- Confirmation dialogs before action

#### 10.4 Bulk Status Operations ✅
- Bulk "Reset to Pending" from customer list
- Bulk "Mark as Delivered" from customer list
- Uses existing checkbox selection pattern
- Confirmation dialogs with customer count

#### 10.5 Delivery Logs ✅
- `delivery_logs` table tracks all status changes
- Actions: `confirmed`, `delivered`, `reset`
- Optional notes field for each action
- "Delivery History" section on customer detail page
- Timestamps for each status change

### EPIC 8: Customer Profile Enhancements (100% Complete)

- Split `name` into `first_name` + `last_name`
- Profile address columns on customers table
- Address names (recipient first/last name)
- COP (Cash on Pickup) delivery method
- Courier filtering based on delivery method
- Visual courier selection cards
- "Copy from Profile" and "Use my profile name" features

### EPIC 9: Admin Email Notifications (100% Complete)

#### 9.1 Email Template Management
- Admin UI at `/admin/email-templates`
- CRUD operations for email templates
- Template variables: `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{confirm_button}}`, `{{update_profile_link}}`
- Toggle templates active/inactive

#### 9.2 Email Sending
- Bulk send from customer list (checkbox selection)
- Single send from customer detail page
- Rate limiting: 100 emails per day
- Scheduled send option (processed by daily cron at 8 AM UTC)
- HTML emails with styled buttons (green for confirm, red for update profile)

#### 9.3 One-Click Delivery Confirmation
- Customers click button in email to confirm delivery address
- Secure 32-byte confirmation tokens with 30-day expiry
- Updates `delivery_confirmed_at` timestamp on customer record
- Customer-facing thank you page at `/confirm/[token]` ✅ Working

#### 9.4 Ready to Ship Status
- New column in customer list showing "Ready" (green) or "Pending" (yellow)
- Based on `delivery_confirmed_at` being set or null
- Badge in customer detail header

#### 9.5 Email History
- Admin UI at `/admin/email-logs`
- Filter by status (all, sent, scheduled, pending, failed)
- Pagination
- View email details (subject, body, error messages)
- Daily email count with rate limit display

### Courier Management (From CP-38)
- Admin courier management at `/admin/couriers`
- Add, edit, deactivate couriers
- Default couriers: LBC, JRS
- Soft-delete preserves existing customer data

## Database State

**Migrations (001-009):**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table and `customer.courier` column
- 006_split_name_and_profile_address.sql - Split name, profile address columns
- 007_address_names_and_cop.sql - Address names, COP delivery method
- 008_email_notifications.sql - Email templates, logs, confirmation tokens, delivery_confirmed_at
- 009_delivery_status_logs.sql - `delivered_at` column, `delivery_logs` table ⚠️ **PENDING**

## Key Files

| Feature | File |
|---------|------|
| OAuth Callback | `src/app/auth/callback/route.ts` |
| Supabase Middleware | `src/lib/supabase/middleware.ts` |
| Types & Interfaces | `src/lib/types/index.ts` |
| Validation Schemas | `src/lib/validations/customer.ts`, `src/lib/validations/email.ts` |
| PSGC API Client | `src/lib/services/psgc.ts` |
| Resend Email Service | `src/lib/services/resend.ts` |
| Multi-Step Form | `src/components/forms/customer-form.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Admin Customer List | `src/components/admin/customer-list.tsx` |
| Email Templates UI | `src/components/admin/email-template-list.tsx` |
| Email Logs UI | `src/components/admin/email-log-list.tsx` |
| Send Email Dialog | `src/components/admin/send-email-dialog.tsx` |
| Confirmation Page | `src/app/confirm/[token]/page.tsx` |

## Environment Variables (Vercel)

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `ADMIN_USERNAME` | ✅ Set |
| `ADMIN_PASSWORD` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `NEXT_PUBLIC_APP_URL` | ✅ Set to `https://customer-profile-registration.vercel.app` |

## Git State

- **Current Branch:** `main`
- **Latest Commits:**
  - `5756e7e` - feat(admin): Add three-state delivery status and delivery logs (#7)
  - `acae505` - feat(admin): EPIC 10 - Timezone and Status Reset (#6)
  - `58e5cb5` - docs: Update change_logs and project_status for Google OAuth fix
- **Tags:** `epic-1-complete` through `epic-10-complete` ✅

## Test Status

- **Unit Tests:** 94/104 passing
  - customer-validation.test.ts: 54 tests
  - admin-components.test.tsx: 39 tests
  - db-schema.test.ts: 1/11 passing (10 require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings)

## Next Steps

1. **Fix auth user deletion** - When admin deletes a customer with `user_id`, also delete from `auth.users`
   - Use Supabase Admin API to delete auth user
   - Requires `SUPABASE_SERVICE_ROLE_KEY` for admin operations

## Future Enhancements (Ideas)

- Order management system (Phase 2)
- Additional email providers (SendGrid, Mailgun fallback)
- Email open/click tracking
- Customer notification preferences
- Timezone-based status reset (see `docs/post-mvp-features/EPIC-10-timezone-and-status-reset.md`)
