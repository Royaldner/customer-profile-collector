# Project Status

**Last Updated:** 2026-01-12

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-7 complete plus Courier Selection feature. EPIC 8 (Customer Profile Enhancements) planned.

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
- Step 1: Personal Info (name, email, phone, contact preference)
- Step 2: Delivery Method (pickup, delivered, cod) with visual cards
- Step 3: Address (skipped for pickup orders)
- Step 4: Review & Submit
- Step-by-step validation before proceeding

#### 7.3 Philippine Address Autocomplete
- LocationCombobox component for city/barangay search
- PSGC city data integration
- Barangays API route
- Auto-fill province and region on city selection

#### 7.4 Supabase Keep-Alive
- Health check API endpoint (`/api/health`)
- Vercel Cron job (weekly ping on Sundays)

### Courier Selection Feature (NEW)

#### Admin Courier Management
- `/admin/couriers` page for managing courier options
- Add, edit, deactivate couriers
- Default couriers: LBC, JRS
- Soft-delete preserves existing customer data

#### Customer Courier Selection
- Courier dropdown in registration (Delivery/COD only)
- Displayed in review step
- Editable in admin and customer dashboards
- Required for delivery/cod, not needed for pickup

## Database State

**Migrations Applied:**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies

**Migration Pending:**
- 005_add_courier.sql - Couriers table and customer.courier column

## Key Files

| Feature | File |
|---------|------|
| Multi-Step Form | `src/components/forms/customer-form.tsx` |
| Stepper UI | `src/components/ui/stepper.tsx` |
| Delivery Method Step | `src/components/forms/steps/delivery-method-step.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Admin Courier Management | `src/app/admin/couriers/page.tsx` |
| Courier List Component | `src/components/admin/courier-list.tsx` |
| Courier Form Dialog | `src/components/admin/courier-form-dialog.tsx` |
| Couriers API | `src/app/api/couriers/route.ts` |

## Git State

- **Current Branch:** `feature/courier-selection`
- **Latest Commit:** `afdd629 CP-38: Add courier selection feature`
- **Status:** Committed locally, not pushed

## Next Steps (Immediate)

1. **Run Migration** - Execute `supabase/migrations/005_add_courier.sql` in Supabase SQL Editor
2. **Push to Remote** - `git push -u origin feature/courier-selection`
3. **Create PR** - Merge `feature/courier-selection` into `main`
4. **Deploy** - Vercel auto-deploys on merge to main

---

## EPIC 8: Customer Profile Enhancements (PLANNED)

**Branch:** `feature/customer-profile-enhancements`
**Plan File:** `C:\Users\Baroroy\.claude\plans\hidden-singing-harp.md`

### Summary of Changes

1. **Split Customer Name** - Replace `name` with `first_name` + `last_name`
2. **Add Profile Address** - Single address on customer record (optional)
3. **Add Names to Delivery Addresses** - `first_name` + `last_name` (required, with "use my name" option)
4. **Add COP Delivery Method** - Cash on Pickup (address = courier pickup location)
5. **Conditional Courier Selection**:
   - pickup: No courier
   - delivered: LBC or JRS
   - cod: LBC only
   - cop: LBC only

### Implementation Phases (CP-39 to CP-45)

| Phase | Description | Status |
|-------|-------------|--------|
| CP-39 | Database migrations | Pending |
| CP-40 | Types & validation schemas | Pending |
| CP-41 | API routes | Pending |
| CP-42 | Registration form | Pending |
| CP-43 | Customer dashboard | Pending |
| CP-44 | Admin dashboard | Pending |
| CP-45 | Testing | Pending |

### 7-Step Phase Workflow

1. Branch - Create `feature/customer-profile-enhancements` from develop
2. Build - Implement CP-39 through CP-45
3. Test - `npm test`, `npm run build`, `npm run lint`
4. Review - Code review
5. Document - Update docs/
6. Merge - Merge to develop → main with `--no-ff`
7. Tag - Tag `epic-8-complete`

### Files to Modify

**New Migrations:**
- `supabase/migrations/006_split_name_and_profile_address.sql`
- `supabase/migrations/007_address_names_and_cop.sql`

**Core Updates:**
- `src/lib/types/index.ts`
- `src/lib/validations/customer.ts`
- `src/app/api/customers/route.ts`
- `src/app/api/customers/[id]/route.ts`
- `src/app/api/customer/profile/route.ts`
- `src/app/api/customer/addresses/route.ts`
- `src/app/api/customer/addresses/[id]/route.ts`

**Frontend Updates:**
- `src/components/forms/steps/personal-info-step.tsx`
- `src/components/forms/steps/delivery-method-step.tsx`
- `src/components/forms/address-form.tsx`
- `src/components/forms/steps/review-step.tsx`
- `src/components/forms/customer-form.tsx`
- `src/app/customer/dashboard/page.tsx`
- `src/components/admin/customer-list.tsx`
- `src/components/admin/edit-customer-form.tsx`
- `src/app/admin/customers/[id]/page.tsx`

**Tests:**
- `test/customer-validation.test.ts`
