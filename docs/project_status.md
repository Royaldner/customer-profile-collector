# Project Status

**Last Updated:** 2026-01-26 16:00

## Overview

Customer Profile Collector - A customer profile collection system for a small business. EPIC 1-12 implemented, deployed, and live.

**Production URL:** https://customer-profile-registration.vercel.app

## Current State

**Branch:** `main`
**Status:** All features deployed and working

### Recent Work - EPIC 12 UI Redesign

Based on user feedback, the settings UI was redesigned from a collapsible drawer to a menu + full-screen views pattern:

**New UX Flow:**
1. **Dashboard** - Main view with orders, delivery preference, default address
2. **Hamburger menu (☰)** → Slide-in drawer with menu items
3. **Click menu item** → Full-screen view opens (like navigating to a new page)
4. **Back arrow (←)** → Returns to dashboard

**New Layout:**
```
Dashboard                    Settings Menu (slides in)
┌─────────────────────┐     ┌─────────────────────────────┐
│ Greeting        ☰   │     │ Settings                  ✕ │
├─────────────────────┤     ├─────────────────────────────┤
│ My Orders           │     │ 👤 Personal Information   → │
│ [Recent] [Completed]│     │ 📍 Delivery Addresses     → │
├─────────────────────┤     │ ℹ️  Account               → │
│ Delivery Preference │     │ ⚠️ Danger Zone           → │
│ [Delivery] • LBC    │     ├─────────────────────────────┤
├─────────────────────┤     │ [Sign Out]                  │
│ Default Address     │     └─────────────────────────────┘
│ Home - Juan Dela... │
│ [Manage Addresses→] │     Full-Screen View (when item clicked)
└─────────────────────┘     ┌─────────────────────────────┐
                            │ ← Personal Information      │
                            ├─────────────────────────────┤
                            │ First Name: Juan            │
                            │ Last Name: Dela Cruz        │
                            │ Email: juan@example.com     │
                            │ ... (full content)          │
                            │ [Edit] [Save]               │
                            └─────────────────────────────┘
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
- Hamburger menu with slide-in drawer
- Menu items open full-screen views
- Main view shows Orders, Delivery Preference, Default Address
- Full settings editing in full-screen views
- Dashboard page reduced from 1,286 to ~425 lines

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

- **Current Branch:** `main`
- **Latest Commits:**
  - `4384e16` - chore: remove unused settings-drawer component
  - `4649563` - fix: redesign settings as slide-in menu + full-screen views
  - `fbbe00d` - fix: add missing @radix-ui/react-collapsible dependency
  - `fb39db9` - EPIC 12: Customer Dashboard UI Restructuring (#9)
- **Tags:** `epic-1-complete` through `epic-12-complete` ✅

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
| Settings Menu | `src/components/customer/settings-menu.tsx` |
| Settings Full-Screen Views | `src/components/customer/settings-view.tsx` |
| Delivery Preference Card | `src/components/customer/delivery-preference-card.tsx` |
| Default Address Card | `src/components/customer/default-address-card.tsx` |
| Address Dialog | `src/components/customer/address-dialog.tsx` |
| Customer Dashboard | `src/app/customer/dashboard/page.tsx` |

## Future Enhancements

- **EPIC 13:** Payment processing (PayMongo integration)
- **EPIC 14:** Product catalog and order creation
