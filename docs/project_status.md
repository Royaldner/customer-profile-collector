# Project Status

**Last Updated:** 2026-01-26

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-12 implemented. Dashboard UI restructuring complete.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `feature/dashboard-ui-restructure`
**Status:** EPIC 12 implementation complete, ready for PR/merge

### EPIC 12 - Customer Dashboard UI Restructuring (✅ COMPLETE)

**Feature Spec:** `docs/post-mvp-features/EPIC-12-dashboard-ui-restructuring.md`

**Goal:** Restructure customer dashboard from 1,286-line monolith into focused main view with slide-out settings drawer.

**Implementation Complete:**
- [x] CP-86: Install shadcn Sheet and Collapsible components
- [x] CP-87: Create DashboardHeader component
- [x] CP-88: Create SettingsDrawer component
- [x] CP-89: Create DeliveryPreferenceCard component
- [x] CP-90: Create DefaultAddressCard component
- [x] CP-91: Refactor dashboard page to use new components
- [x] CP-92: Test all functionality and verify build

**Results:**
- Dashboard page reduced from 1,286 lines to 322 lines (75% reduction)
- 6 new customer components created
- All functionality preserved
- Build passes
- 94/104 tests passing (pre-existing db-schema tests require live database)

**New Dashboard Layout:**
```
Main View                    Settings Drawer (slide from right)
┌─────────────────────┐     ┌─────────────────────────────┐
│ Greeting        ☰   │     │ Settings                  ✕ │
├─────────────────────┤     ├─────────────────────────────┤
│ My Orders           │     │ ▼ Personal Information      │
│ [Recent] [Completed]│     │   Name, Email, Phone...     │
│                     │     │   [Edit]                    │
├─────────────────────┤     │ ▼ Delivery Addresses        │
│ Delivery Preference │     │   Address cards with CRUD   │
│ [Delivery] • LBC    │     │   [+ Add Address]           │
│ [Edit]              │     │ ▶ Account                   │
├─────────────────────┤     │ ▶ Danger Zone               │
│ Default Address     │     │ [Sign Out]                  │
│ Home - Juan Dela... │     └─────────────────────────────┘
│ [Manage Addresses→] │
└─────────────────────┘
```

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
- Slide-out settings drawer with hamburger menu
- Collapsible sections (Personal Info, Addresses, Account, Danger Zone)
- Main view shows Orders, Delivery Preference, Default Address only
- Full address CRUD moved to drawer
- Dashboard page reduced from 1,286 to 322 lines

## Database State

**Migrations (001-010):**
- 001_create_tables.sql - Base schema ✅
- 002_enable_rls.sql - RLS policies ✅
- 003_add_customer_fields.sql - `user_id` and `delivery_method` ✅
- 004_customer_auth_rls.sql - Customer self-access policies ✅
- 005_add_courier.sql - Couriers table ✅
- 006_split_name_and_profile_address.sql - Split name, profile address ✅
- 007_address_names_and_cop.sql - Address names, COP delivery method ✅
- 008_email_notifications.sql - Email templates, logs, tokens ✅
- 009_delivery_status_logs.sql - `delivered_at`, `delivery_logs` table ✅
- 010_zoho_integration.sql - `zoho_contact_id`, `zoho_tokens`, `zoho_cache` ✅

**All migrations applied.** Database is up to date.

## Git State

- **Current Branch:** `feature/dashboard-ui-restructure`
- **Latest Commits:**
  - `b1e3316` - CP-91: Refactor dashboard page to use new components
  - `7eecb0c` - CP-90: Create DefaultAddressCard component
  - `341cde7` - CP-89: Create DeliveryPreferenceCard component
  - `7c1aa43` - CP-88: Create SettingsDrawer component
  - `6234da6` - CP-87: Create DashboardHeader component
  - `41358d1` - CP-86: Install shadcn Sheet and Collapsible components
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
| Dashboard Header | `src/components/customer/dashboard-header.tsx` |
| Settings Drawer | `src/components/customer/settings-drawer.tsx` |
| Delivery Preference Card | `src/components/customer/delivery-preference-card.tsx` |
| Default Address Card | `src/components/customer/default-address-card.tsx` |
| Address Dialog | `src/components/customer/address-dialog.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |
| Sheet Component | `src/components/ui/sheet.tsx` |
| Collapsible Component | `src/components/ui/collapsible.tsx` |

## Next Steps

1. **Create PR** - `feature/dashboard-ui-restructure` → `main`
2. **Merge and deploy** - Vercel auto-deploys on merge
3. **Tag release** - `epic-12-complete`
4. **Manual testing** - Verify all flows work in production

## Future Enhancements

- **EPIC 13:** Payment processing (PayMongo integration)
- **EPIC 14:** Product catalog and order creation
