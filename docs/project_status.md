# Project Status

**Last Updated:** 2026-01-12

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-8 complete. All major features implemented.

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

#### 8.1 Split Customer Name
- Replaced `name` with `first_name` + `last_name` columns
- Migration automatically splits existing names on first space
- All forms, displays, and search updated

#### 8.2 Profile Address
- Optional profile address columns on customers table
- `profile_street_address`, `profile_barangay`, `profile_city`, etc.
- Future use: "Copy from profile" functionality

#### 8.3 Address Names
- Added `first_name` + `last_name` to delivery addresses (required)
- Allows different recipient names per address
- Defaults to customer name on migration

#### 8.4 COP Delivery Method
- Added "Cash on Pickup" option
- Customer provides courier pickup location address
- Informational banner explains COP workflow

#### 8.5 Courier Filtering
- **pickup**: No courier required
- **delivered**: LBC or JRS available
- **cod/cop**: LBC only
- Visual card selection (not dropdown)

#### 8.6 Registration Form UX (CP-46 to CP-49)
- **Profile Address Input**: Optional home address during registration with autocomplete
- **"Copy from Profile" Button**: One-click copy of name + address to delivery address
- **"Use my profile name" Checkbox**: Auto-fill recipient name from profile (per address)
- **Visual Courier Selection**: Radio cards instead of dropdown for better UX

#### 8.7 Customer Dashboard UX (CP-51 to CP-54)
- **Profile Address Display**: Shows in Personal Information section when exists
- **Visual Courier Cards**: Replaced dropdown with styled radio cards (matches delivery preference)
- **Conditional Courier Logic**: Filters based on delivery method (pickup: none, delivered: LBC/JRS, cod/cop: LBC only)
- **"Use my address" Button**: One-click copy in address dialog

### Courier Management (From CP-38)
- Admin courier management at `/admin/couriers`
- Add, edit, deactivate couriers
- Default couriers: LBC, JRS
- Soft-delete preserves existing customer data

## Database State

**All Migrations Applied:**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method`
- 004_customer_auth_rls.sql - Customer self-access policies
- 005_add_courier.sql - Couriers table and `customer.courier` column
- 006_split_name_and_profile_address.sql - Split name, profile address columns
- 007_address_names_and_cop.sql - Address names, COP delivery method

## Current Schema

**customers table:**
- `id`, `first_name`, `last_name`, `email`, `phone`
- `contact_preference` (email/phone/sms)
- `delivery_method` (pickup/delivered/cod/cop)
- `courier` (lbc/jrs/null)
- `user_id` (FK to auth.users, optional)
- `profile_street_address`, `profile_barangay`, `profile_city`, `profile_province`, `profile_region`, `profile_postal_code` (all optional)
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

## Key Files

| Feature | File |
|---------|------|
| Types & Interfaces | `src/lib/types/index.ts` |
| Validation Schemas | `src/lib/validations/customer.ts` |
| PSGC API Client | `src/lib/services/psgc.ts` |
| PSGC React Hooks | `src/hooks/use-psgc-locations.ts` |
| Multi-Step Form | `src/components/forms/customer-form.tsx` |
| Personal Info Step | `src/components/forms/steps/personal-info-step.tsx` |
| Delivery Method Step | `src/components/forms/steps/delivery-method-step.tsx` |
| Address Form | `src/components/forms/address-form.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Admin Customer List | `src/components/admin/customer-list.tsx` |
| Admin Edit Form | `src/components/admin/edit-customer-form.tsx` |

### CP-56: Customer Dashboard UI Fixes
- **Dynamic Greeting**: Time-based greeting (Good Morning/Afternoon/Evening)
- **Button Overlap Fix**: "Use my address" moved below dialog title
- **City/Barangay Autocomplete**: Added to address modal
- **Profile Address Editing**: Added to Personal Information edit mode

### CP-57: Admin Edit Form Autocomplete
- **City/Barangay Autocomplete**: Added LocationCombobox to admin edit customer form
- Consistent UX across all forms (registration, customer dashboard, admin)

### CP-58: PSGC API Integration
- **Official PSGC GitLab API**: Replaced static 126 cities with 1,820 locations from official source
- **Runtime API calls**: Always up-to-date data from `https://psgc.gitlab.io/api/`
- **Caching**: Memory + localStorage with 7-day duration
- **React Hooks**: `usePSGCLocations()` and `useBarangays()` for easy consumption

### CP-59: Address Validation Error Display
- **Specific field errors**: Shows exactly which field failed (e.g., "barangay: Barangay is required")
- **Console logging**: Logs form data for debugging address save issues

## Git State

- **Current Branch:** `main`
- **Latest Commit:** CP-59: Improve address validation error display
- **Status:** Up to date with origin/main, all changes deployed

## Git Workflow Rules

**CRITICAL:** Never merge/push to `main` or `develop` without explicit user permission.
1. Create feature branch for all changes
2. Commit on feature branch
3. Ask user before merging
4. Only merge after user confirms

## Test Status

- **Unit Tests:** 90/90 passing
  - customer-validation.test.ts: 54 tests
  - admin-components.test.tsx: 36 tests
- **Integration Tests:** 10 tests (require live database)
- **Build:** Passing
- **Lint:** Passing (pre-existing warnings)

## Future Enhancements (Ideas)

- Order management system (Phase 2)
