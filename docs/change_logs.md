# Change Logs

## [2026-01-12] - EPIC 8 Implementation Complete

### Changes
- **CP-39**: Created database migrations 006 and 007
- **CP-40**: Updated TypeScript types and Zod validation schemas
- **CP-41**: Updated API routes for new customer/address fields
- **CP-42**: Updated registration form UI (split name, COP option, courier filtering)
- **CP-43**: Updated customer dashboard for new fields
- **CP-44**: Updated admin dashboard for new fields
- **CP-45**: Updated all tests for new schema

### Features Implemented
1. **Split Name Fields**: `name` → `first_name` + `last_name` on customers
2. **Address Names**: Added `first_name` + `last_name` to delivery addresses
3. **Profile Address**: Added optional profile address columns to customers
4. **COP Delivery Method**: Added "Cash on Pickup" option
5. **Courier Filtering**: pickup (none), delivered (LBC/JRS), cod/cop (LBC only)

### Database Migrations
- `006_split_name_and_profile_address.sql` - Split name, add profile address
- `007_address_names_and_cop.sql` - Add names to addresses, add COP delivery method

### Files Created
- `supabase/migrations/006_split_name_and_profile_address.sql`
- `supabase/migrations/007_address_names_and_cop.sql`

### Files Modified
- `src/lib/types/index.ts` - Added first_name/last_name, profile address, COP
- `src/lib/validations/customer.ts` - Updated schemas, added COURIER_OPTIONS
- `src/app/api/customers/route.ts` - Handle new fields in POST
- `src/app/api/customers/[id]/route.ts` - Handle new fields in PUT
- `src/components/forms/steps/personal-info-step.tsx` - Split name inputs
- `src/components/forms/steps/delivery-method-step.tsx` - COP option, courier filtering
- `src/components/forms/address-form.tsx` - Added name fields to addresses
- `src/components/forms/steps/review-step.tsx` - Display new fields
- `src/components/forms/customer-form.tsx` - Updated defaults
- `src/app/customer/dashboard/page.tsx` - Full update for new fields
- `src/components/admin/customer-list.tsx` - Search by first/last name
- `src/components/admin/edit-customer-form.tsx` - Edit new fields
- `src/app/admin/customers/[id]/page.tsx` - Display new fields
- `test/customer-validation.test.ts` - 54 tests updated
- `test/admin-components.test.tsx` - 36 tests updated
- `test/db-schema.test.ts` - Updated test data

### Git
- **Commit:** `e63d90c CP-39-45: EPIC 8 - Customer profile enhancements`
- **Branch:** `feature/customer-profile-enhancements`

### Test Results
- 90/90 unit tests passing (customer-validation + admin-components)
- Build passes
- Lint passes (pre-existing warnings only)

### Notes
- Database migrations 006 and 007 have been run in Supabase
- Ready for push, PR, and merge

---

## [2026-01-12] - EPIC 8 Planning Session

### Changes
- **Planning**: Designed EPIC 8 (Customer Profile Enhancements)
- Created comprehensive implementation plan for 6 major changes
- Defined 7-step phase workflow (Branch → Build → Test → Review → Document → Merge → Tag)
- Mapped out 7 implementation phases (CP-39 through CP-45)

### Planned Features (EPIC 8)
1. Split `name` into `first_name` + `last_name` on customers table
2. Add profile address to customer (optional, single address)
3. Add `first_name` + `last_name` to delivery addresses (required)
4. Add `cop` (Cash on Pickup) delivery method
5. Conditional courier selection based on delivery method
6. "Use my profile name" and "Copy from profile address" UX features

### Delivery Method & Courier Matrix
| Method | Address | Couriers |
|--------|---------|----------|
| pickup | No | None |
| delivered | Yes | LBC, JRS |
| cod | Yes | LBC only |
| cop | Yes | LBC only |

### Files Modified
- `CLAUDE.md` - Added EPIC 8 section and branch name
- `docs/project_status.md` - Added EPIC 8 plan details
- `docs/change_logs.md` - Added planning session entry

### Plan File
- `C:\Users\Baroroy\.claude\plans\hidden-singing-harp.md`

### Pre-requisites Before Starting EPIC 8
- [ ] Merge `feature/courier-selection` to main
- [ ] Run migration `005_add_courier.sql` in Supabase

### Notes
- User clarified: Profile address is single address on customer (columns, not separate table)
- User clarified: COP address is customer's chosen courier pickup location (instruction only)
- User clarified: Address names are required but can use "Use my profile name" checkbox

---

## [2026-01-10] - Courier Selection Feature

### Changes
- **Feature**: Added admin-managed courier selection for Delivery/COD orders
- Created `couriers` table with LBC and JRS as default options
- Added courier dropdown in registration form (visible for delivery/cod only)
- Admin can add/edit/deactivate couriers via `/admin/couriers`
- Customer dashboard shows and allows editing courier preference
- Admin customer views display and allow editing courier

### Files Created
- `supabase/migrations/005_add_courier.sql` - Database migration
- `src/lib/validations/courier.ts` - Courier validation schemas
- `src/app/api/couriers/route.ts` - GET/POST couriers API
- `src/app/api/couriers/[id]/route.ts` - GET/PUT/DELETE courier API
- `src/app/admin/couriers/page.tsx` - Admin courier management page
- `src/components/admin/courier-list.tsx` - Courier list with CRUD
- `src/components/admin/courier-form-dialog.tsx` - Add/edit courier dialog

### Files Modified
- `supabase/schema.sql` - Added couriers table
- `src/lib/types/index.ts` - Added Courier interface, updated Customer
- `src/lib/validations/customer.ts` - Added courier validation
- `src/components/forms/steps/delivery-method-step.tsx` - Added courier dropdown
- `src/components/forms/steps/review-step.tsx` - Display courier in review
- `src/app/api/customers/route.ts` - Handle courier in POST
- `src/app/api/customers/[id]/route.ts` - Handle courier in PUT
- `src/app/api/customer/profile/route.ts` - Handle courier in PUT
- `src/app/admin/page.tsx` - Added link to courier management
- `src/app/admin/customers/[id]/page.tsx` - Display courier in detail view
- `src/components/admin/edit-customer-form.tsx` - Edit courier in admin form
- `src/app/customer/dashboard/page.tsx` - Display/edit courier in profile
- `test/customer-validation.test.ts` - Added courier to test data
- `test/db-schema.test.ts` - Added delivery_method to test data

### Git
- **Commit:** `afdd629 CP-38: Add courier selection feature`
- **Branch:** `feature/courier-selection`
- **Status:** Committed locally, not pushed

### Deployment Steps
1. Run `supabase/migrations/005_add_courier.sql` in Supabase SQL Editor
2. `git push -u origin feature/courier-selection`
3. Create PR and merge to `main`
4. Vercel auto-deploys on merge

### Notes
- Courier is required for delivery/cod orders, not needed for pickup
- Admins can deactivate couriers (soft-delete) to hide from dropdowns
- Existing customer data is preserved when courier is deactivated

---

## [2026-01-09 Session 2] - EPIC 7 Complete

### Changes
- **CP-27**: Created Stepper UI component (`src/components/ui/stepper.tsx`)
- **CP-28**: Created Personal Info step component
- **CP-29**: Created Delivery Method step component with visual cards
- **CP-30**: Created Address step and Review step components
- **CP-31**: Refactored CustomerForm to multi-step wizard
- Configured Google OAuth in Supabase Dashboard
- Disabled email verification for simpler signup flow
- Updated all documentation to reflect EPIC 7 completion

### Files Created
- `src/components/ui/stepper.tsx` - Reusable stepper component
- `src/components/forms/steps/personal-info-step.tsx` - Step 1
- `src/components/forms/steps/delivery-method-step.tsx` - Step 2
- `src/components/forms/steps/address-step.tsx` - Step 3
- `src/components/forms/steps/review-step.tsx` - Step 4
- `src/components/forms/steps/index.ts` - Barrel export

### Files Modified
- `src/components/forms/customer-form.tsx` - Multi-step wizard implementation
- `CLAUDE.md` - Marked EPIC 7 as complete
- `docs/project_status.md` - Updated project status
- `docs/change_logs.md` - Added session entry

### Notes
- All EPIC 7 sections now complete (7.1, 7.2, 7.3, 7.4)
- Build passing with no errors
- Ready to merge to main and tag `epic-7-complete`

---

## [2026-01-09 14:50]

### Changes
- Updated EPIC 7 progress tracker in CLAUDE.md to reflect actual completion status
- Marked EPIC 7.1 (Customer Authentication) as complete
- Marked EPIC 7.3 (Philippine Address Autocomplete) as complete
- Marked EPIC 7.4 (Supabase Keep-Alive) as complete
- Noted EPIC 7.2 (Multi-Step Registration Form) as NOT STARTED

### Files Modified
- `CLAUDE.md` - Updated progress tracker
- `docs/change_logs.md` - Added session entry
- `docs/project_status.md` - Updated current state

### Notes
- Build passing, no TODO/FIXME comments in codebase
- Stashed work from previous session was cleared

---

## [2026-01-07 Session]

### Changes
- Reviewed EPIC 7 implementation status
- Verified customer authentication system is fully implemented (CP-20 to CP-26)
- Verified Philippine address autocomplete is complete (CP-32 to CP-36)
- Verified Supabase keep-alive is configured (CP-37 to CP-38)
- Identified multi-step registration form (CP-27 to CP-31) as NOT implemented
- Created docs/ folder for project documentation

### Files Verified
- `src/app/customer/login/page.tsx` - Customer login (Google + Email/Password)
- `src/app/customer/signup/page.tsx` - Customer signup
- `src/app/customer/dashboard/page.tsx` - Customer dashboard with profile editing
- `src/app/customer/forgot-password/page.tsx` - Password reset request
- `src/app/customer/reset-password/page.tsx` - Password reset completion
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/components/ui/location-combobox.tsx` - Philippine address autocomplete
- `src/app/api/health/route.ts` - Health check endpoint
- `vercel.json` - Cron job configuration for keep-alive
- `supabase/migrations/003_add_customer_fields.sql` - user_id and delivery_method columns
- `supabase/migrations/004_customer_auth_rls.sql` - Customer auth RLS policies

### Notes
- CLAUDE.md tracker shows all EPIC 7 tasks as incomplete but most are actually done
- The feature branch `feature/customer-ux-enhancement` was already merged to main
- Multi-step registration form is the only remaining work for EPIC 7
