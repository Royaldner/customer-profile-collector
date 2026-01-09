# Project Status

**Last Updated:** 2026-01-09

## Overview

Customer Profile Collector - A customer profile collection system for a small business. Phase 1 complete, Phase 2 (EPIC 7) partially complete.

## Recent Development

Documentation sync session - Updated CLAUDE.md progress tracker to reflect actual EPIC 7 completion status. Multi-step registration form (CP-27 to CP-31) identified as remaining work.

## Completed Features

### EPIC 1-6: Core Application (100% Complete)
- Project setup with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- Database schema with customers and addresses tables
- Customer registration form with Zod validation
- Admin dashboard with search, filter, CRUD operations
- Admin authentication (cookie-based)
- Mobile responsiveness
- Deployed to Vercel

### EPIC 7.1: Customer Authentication (100% Complete)
- [x] CP-20: Google OAuth configured in Supabase
- [x] CP-21: Customer login page (Google + Email/Password)
- [x] CP-22: Customer signup page
- [x] CP-23: OAuth callback handler (`/auth/callback`)
- [x] CP-24: Forgot/reset password flow
- [x] CP-25: Customer dashboard with profile editing
- [x] CP-26: Auth options added to registration flow

### EPIC 7.3: Philippine Address Autocomplete (100% Complete)
- [x] CP-32: shadcn command & popover installed
- [x] CP-33: LocationCombobox component created
- [x] CP-34: PSGC city data prepared
- [x] CP-35: Barangays API route created
- [x] CP-36: Comboboxes integrated into AddressForm

### EPIC 7.4: Supabase Keep-Alive (100% Complete)
- [x] CP-37: Health check API endpoint (`/api/health`)
- [x] CP-38: Vercel Cron job (weekly ping on Sundays)

## In Progress

### EPIC 7.2: Multi-Step Registration Form (0% Complete)
Current registration form is single-page. Needs refactoring to multi-step wizard.

**Remaining Tasks:**
- [ ] CP-27: Create Stepper UI component
- [ ] CP-28: Create Personal Info step
- [ ] CP-29: Create Delivery Method step (pickup/delivered/cod)
- [ ] CP-30: Create Address/Review step
- [ ] CP-31: Refactor CustomerForm to multi-step

**Design Notes:**
- Step 1: Personal Info (name, email, phone, contact preference)
- Step 2: Delivery Method (pickup, delivered, cod)
- Step 3: Address (skip if pickup selected)
- Step 4: Review & Submit

## Next Steps

1. **Implement Multi-Step Form (CP-27 to CP-31)**
   - Create reusable Stepper component
   - Split form into step components
   - Handle conditional address step based on delivery method
   - Add form state persistence across steps

2. **After EPIC 7 Complete:**
   - Merge feature branch to main
   - Tag as `epic-7-complete`
   - Run full test suite
   - Deploy to production

## Known Issues

1. **Google OAuth** - Requires Supabase Dashboard configuration (Client ID/Secret from Google Cloud Console)
2. **Customer Profile Linking** - New signups need to link `auth.users.id` to `customers.user_id`

## Database State

**Migrations Applied:**
- 001_create_tables.sql - Base schema
- 002_enable_rls.sql - RLS policies
- 003_add_customer_fields.sql - Added `user_id` and `delivery_method` to customers
- 004_customer_auth_rls.sql - Customer self-access policies

## Key Files

| Feature | File |
|---------|------|
| Customer Login | `src/app/customer/login/page.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Registration Form | `src/app/register/page.tsx` |
| Address Autocomplete | `src/components/ui/location-combobox.tsx` |
| Health Check | `src/app/api/health/route.ts` |
| Cron Config | `vercel.json` |

## Git State

- **Current Branch:** `feature/customer-ux-enhancement`
- **Main Branch:** `93a4a88 fix: Add password visibility toggle to admin login`
- **Feature Branch HEAD:** Contains docs updates for session continuity
