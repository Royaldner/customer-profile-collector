# Project Status

**Last Updated:** 2026-01-14 (Session 4 - EPIC-9 Implementation)

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-9 implemented. Admin email notification system complete (pending API key configuration).

## Current State

**Branch:** `feature/admin-email-notifications`
**Status:** EPIC-9 implementation complete, ready for commit/merge

### Pending Deployment Steps
1. Run `supabase/migrations/008_email_notifications.sql` in Supabase
2. Add `RESEND_API_KEY` to Vercel environment variables
3. Commit and push branch
4. Create PR and merge to main

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

#### 8.1-8.7 Summary
- Split `name` into `first_name` + `last_name`
- Profile address columns on customers table
- Address names (recipient first/last name)
- COP (Cash on Pickup) delivery method
- Courier filtering based on delivery method
- Visual courier selection cards
- "Copy from Profile" and "Use my profile name" features

### EPIC 9: Admin Email Notifications (100% Complete - Pending Deployment)

#### 9.1 Email Template Management
- Admin UI at `/admin/email-templates`
- CRUD operations for email templates
- Template variables: `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{confirm_button}}`, `{{update_profile_link}}`
- Toggle templates active/inactive

#### 9.2 Email Sending
- Bulk send from customer list (checkbox selection)
- Single send from customer detail page
- Rate limiting: 100 emails per day
- Scheduled send option (processed by hourly cron)

#### 9.3 One-Click Delivery Confirmation
- Customers click link in email to confirm delivery address
- Secure 32-byte confirmation tokens with 30-day expiry
- Updates `delivery_confirmed_at` timestamp on customer record
- Customer-facing thank you page at `/confirm/[token]`

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

**All Migrations Applied (001-007):**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table and `customer.courier` column
- 006_split_name_and_profile_address.sql - Split name, profile address columns
- 007_address_names_and_cop.sql - Address names, COP delivery method

**Pending Migration (008):**
- 008_email_notifications.sql - Email templates, logs, confirmation tokens, delivery_confirmed_at

## Current Schema

**customers table:**
- `id`, `first_name`, `last_name`, `email`, `phone`
- `contact_preference` (email/phone/sms)
- `delivery_method` (pickup/delivered/cod/cop)
- `courier` (lbc/jrs/null)
- `user_id` (FK to auth.users, optional)
- `profile_street_address`, `profile_barangay`, `profile_city`, `profile_province`, `profile_region`, `profile_postal_code` (all optional)
- `delivery_confirmed_at` (timestamp, null until confirmed) - **NEW in 008**
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

**email_templates table (NEW in 008):**
- `id`, `name`, `display_name`, `subject`, `body`, `variables`, `is_active`
- `created_at`, `updated_at`

**email_logs table (NEW in 008):**
- `id`, `template_id`, `customer_id`, `recipient_email`, `recipient_name`
- `subject`, `body`, `status` (pending/scheduled/sent/failed)
- `scheduled_for`, `sent_at`, `error_message`
- `created_at`

**confirmation_tokens table (NEW in 008):**
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

## Git State

- **Current Branch:** `feature/admin-email-notifications`
- **Latest Main Commit:** `bdc2fe3 Merge feature/admin-improvements`
- **Status:** Feature branch with all EPIC-9 changes, uncommitted

## Git Workflow Rules

**CRITICAL:** Never merge/push to `main` or `develop` without explicit user permission.
1. Create feature branch for all changes
2. Commit on feature branch
3. Ask user before merging
4. Only merge after user confirms

## Test Status

- **Unit Tests:** 94/104 passing
  - customer-validation.test.ts: 54 tests
  - admin-components.test.tsx: 39 tests (updated for new columns)
  - db-schema.test.ts: 1/11 passing (10 require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings)

## Next Steps

1. **Immediate:** Commit EPIC-9 changes on feature branch
2. **Deploy:** Run migration 008, add RESEND_API_KEY, merge to main
3. **Verify:** Test email sending in production

## Future Enhancements (Ideas)

- Order management system (Phase 2)
- Additional email providers (SendGrid, Mailgun fallback)
- Email open/click tracking
- Customer notification preferences
