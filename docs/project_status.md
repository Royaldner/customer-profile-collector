# Project Status

**Last Updated:** 2026-01-16 19:40

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-9 implemented and deployed to production.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** EPIC-9 complete, Google OAuth broken (in progress fix)

### Known Issue #1 (Priority: Critical)

**Google OAuth Redirect Not Working**

- **Status:** In Progress (documented, solution identified)
- **Issue Doc:** `docs/issues/ISSUE-google-oauth-redirect.md`

**Symptoms:**
- Google login redirects to `/customer/login?error=auth_callback_error`
- Google signup redirects to `/customer/login?error=auth_callback_error`
- Email/password auth works fine

**Root Cause:**
1. Supabase ignores `redirectTo` parameter, redirects to root `/?code=xxx`
2. PKCE code verifier stored in browser, not accessible server-side
3. Server-side code exchange fails: "both auth code and code verifier should be non-empty"

**Next Steps:**
1. Create client-side `/auth/callback/page.tsx` with Suspense boundary
2. Keep middleware redirect from `/?code=xxx` to `/auth/callback`
3. Exchange code on client where verifier is accessible

**Additional Notes:**
- Next.js 16 shows deprecation warning: `middleware.ts` → `proxy`
- May need to address middleware migration in future

### Known Issue #2 (Priority: High)

**Auth User Not Deleted With Customer**

When admin deletes a customer, only the `customers` table record is removed. The linked Supabase `auth.users` record remains orphaned.

**Impact:**
- If the same email tries to register again, the browser may have a cached auth session
- Customer insert fails with FK violation: "Key is not present in table users"
- Users see: "Unable to create customer: Key is not present in table users"

**Root Cause:**
1. User registers → creates `auth.users` + `customers` records (linked via `user_id`)
2. Admin deletes customer → only `customers` record deleted
3. `auth.users` record remains
4. Re-registration with same email causes session/FK mismatch

**Solution:** When deleting a customer from admin, also delete their Supabase auth user if `user_id` exists.

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

#### 7.1 Customer Authentication
- Google OAuth configured and working
- Email/password signup (no email verification)
- Customer login, signup, forgot/reset password pages
- OAuth callback handler
- Customer dashboard with profile editing

#### 7.2 Multi-Step Registration Form
- Stepper UI component with visual progress
- Step 1: Personal Info (first name, last name, email, phone, contact preference)
- Step 2: Delivery Method (pickup, delivered, cod, cop) with visual cards
- Step 3: Address (skipped for pickup orders)
- Step 4: Review & Submit
- Step-by-step validation before proceeding

#### 7.3 Philippine Address Autocomplete
- LocationCombobox component for city/barangay search
- **PSGC GitLab API integration** (1,820 cities/municipalities from official source)
- Runtime API calls with memory + localStorage caching (7-day duration)
- Barangays API route (dynamic loading per city)
- Auto-fill province and region on city selection

#### 7.4 Supabase Keep-Alive
- Health check API endpoint (`/api/health`)
- Vercel Cron job (weekly ping on Sundays)

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

**All Migrations Applied (001-008):**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table and `customer.courier` column
- 006_split_name_and_profile_address.sql - Split name, profile address columns
- 007_address_names_and_cop.sql - Address names, COP delivery method
- 008_email_notifications.sql - Email templates, logs, confirmation tokens, delivery_confirmed_at

## Current Schema

**customers table:**
- `id`, `first_name`, `last_name`, `email`, `phone`
- `contact_preference` (email/phone/sms)
- `delivery_method` (pickup/delivered/cod/cop)
- `courier` (lbc/jrs/null)
- `user_id` (FK to auth.users, optional)
- `profile_street_address`, `profile_barangay`, `profile_city`, `profile_province`, `profile_region`, `profile_postal_code` (all optional)
- `delivery_confirmed_at` (timestamp, null until confirmed)
- `created_at`, `updated_at`

**addresses table:**
- `id`, `customer_id` (FK)
- `first_name`, `last_name` (recipient name)
- `label`, `street_address`, `barangay`, `city`, `province`, `region`, `postal_code`
- `is_default`
- `created_at`, `updated_at`

**couriers table:**
- `id`, `name`, `code`, `is_active`
- `created_at`, `updated_at`

**email_templates table:**
- `id`, `name`, `display_name`, `subject`, `body`, `variables`, `is_active`
- `created_at`, `updated_at`

**email_logs table:**
- `id`, `template_id`, `customer_id`, `recipient_email`, `recipient_name`
- `subject`, `body`, `status` (pending/scheduled/sent/failed)
- `scheduled_for`, `sent_at`, `error_message`
- `created_at`

**confirmation_tokens table:**
- `id`, `customer_id`, `token`, `expires_at`, `used_at`
- `created_at`

## Key Files

| Feature | File |
|---------|------|
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
| Customer Delete API | `src/app/api/customers/[id]/route.ts` |

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
- **Latest Commits:** Bug fixes and error handling improvements
- **Tags:** `epic-1-complete` through `epic-9-complete` ✅

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
