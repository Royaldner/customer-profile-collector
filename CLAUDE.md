# Customer Profile Collector - Project Context

## Project Overview
A customer profile collection system for a small business client. Phase 1 of a future full e-commerce platform. Allows collecting customer information via a shareable form and managing customer data through an admin GUI.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL via Supabase
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Theme:** Red/white color scheme (oklch colors in globals.css)
- **Testing:** Vitest
- **Deployment:** Vercel

## Git Workflow
- **Branch naming:** `feature/{descriptive-name}`
- **Commits:** `CP-{n}: Brief description`
- **Merges:** Always use `--no-ff`
- **Tags:** `epic-{n}-complete`, `phase-{n}`, `v{major}.{minor}.{patch}`

### IMPORTANT: Before Starting Any New Phase/Epic
**ALWAYS create the feature branch FIRST before writing any code:**
```bash
git checkout develop
git checkout -b feature/{branch-name-from-table-below}
```
Never make changes directly on `main` or `develop` branches.

### Branch Names by Epic
| Epic | Branch Name |
|------|-------------|
| EPIC 1 | `feature/project-setup-infrastructure` |
| EPIC 2 | `feature/database-setup` |
| EPIC 3 | `feature/customer-registration-form` |
| EPIC 4 | `feature/admin-dashboard` |
| EPIC 5 | `feature/edit-delete-operations` |
| EPIC 6 | `feature/polish-deployment` |

## Progress Tracker

### Phase 1: Project Setup & Infrastructure (EPIC 1) ✅ COMPLETE
- [x] CP-1: Initialize Next.js project with TypeScript, Tailwind, ESLint, Turbopack
- [x] CP-2: Configure Supabase environment variables
- [x] CP-3: Setup Supabase client utilities + shadcn/ui with red/white theme
- [x] Setup Vitest testing framework
- [x] Git repository initialized with main/develop/feature branches
- [x] Pushed to GitHub: https://github.com/Royaldner/customer-profile-collector

**Status:** Merged to `main` and `develop`, tagged `epic-1-complete`

### Phase 2: Database Setup (EPIC 2) ✅ COMPLETE
- [x] CP-4: Design database schema + TypeScript types
- [x] CP-5: Create tables in Supabase (SQL migrations)
- [x] CP-6: Setup Row Level Security (RLS)

**Status:** Merged to `main` and `develop`, tagged `epic-2-complete`

### Phase 3: Customer Registration Form (EPIC 3) ✅ COMPLETE
- [x] CP-7: Build customer form UI with Zod validation
- [x] CP-8: Build address sub-form component
- [x] CP-9: Implement form submission API
- [x] CP-10: Build success page

**Status:** Merged to `main` and `develop`, tagged `epic-3-complete`

### Phase 4: Admin Dashboard (EPIC 4) ✅ COMPLETE
- [x] CP-11: Build customer list page
- [x] CP-12: Add search & filter
- [x] CP-13: Build customer detail view
- [x] Add admin login authentication

**Status:** Merged to `main` and `develop`, tagged `epic-4-complete`

### Phase 5: Edit & Delete (EPIC 5) ✅ COMPLETE
- [x] CP-14: Edit customer info
- [x] CP-15: Delete customer with confirmation
- [x] CP-16: Change default address

**Status:** Merged to `main` and `develop`, tagged `epic-5-complete`

### Phase 6: Polish & Deployment (EPIC 6) ✅ COMPLETE
- [x] CP-17: Add loading & error states
- [x] CP-18: Mobile responsiveness
- [x] CP-19: Deploy to Vercel

**Status:** Merged to `main` and `develop`, tagged `epic-6-complete`

## ALL PHASES COMPLETE - PROJECT READY FOR PRODUCTION

---

## Future Plans (Phase 2: Customer UX Enhancement)

### EPIC 7: Customer UX Enhancement (Planned)
Branch: `feature/customer-ux-enhancement`

#### 7.1 Google OAuth + Account System
- [ ] CP-20: Configure Google OAuth in Supabase
- [ ] CP-21: Create customer login page
- [ ] CP-22: Create customer dashboard
- [ ] CP-23: Implement OAuth callback handler
- [ ] CP-24: Add Google sign-in to registration

#### 7.2 Multi-Step Registration Form
- [ ] CP-25: Create Stepper UI component
- [ ] CP-26: Create Personal Info step
- [ ] CP-27: Create Delivery Method step (pickup/delivered/cod)
- [ ] CP-28: Create Address/Review step
- [ ] CP-29: Refactor CustomerForm to multi-step

#### 7.3 Philippine Address Autocomplete
- [ ] CP-30: Install shadcn command & popover
- [ ] CP-31: Create LocationCombobox component
- [ ] CP-32: Prepare PSGC city data
- [ ] CP-33: Create barangays API route
- [ ] CP-34: Integrate comboboxes into AddressForm

### Key Decisions (EPIC 7)
- **Pick-up Orders**: Skip address section completely (not optional)
- **Customer Dashboard**: Google sign-in only (no magic link)
- **Delivery Methods**: pickup, delivered, cod

### New Data Model Fields (EPIC 7)

**Customer (additions)**
```
- user_id (UUID, optional, FK to auth.users)
- delivery_method (enum: 'pickup' | 'delivered' | 'cod')
```

**New Pages**
```
- /customer/login      # Customer login with Google OAuth
- /customer/dashboard  # View/edit own profile
- /auth/callback       # OAuth redirect handler
```

### Database Migrations Needed (EPIC 7)
```sql
-- Migration 003: Add auth user link
ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Migration 004: Add delivery method
ALTER TABLE customers ADD COLUMN delivery_method VARCHAR(20) NOT NULL DEFAULT 'delivered'
  CHECK (delivery_method IN ('pickup', 'delivered', 'cod'));
```

---

## Data Model

### Customer
```
- id (UUID, primary key)
- name (string, required)
- email (string, required, unique)
- phone (string, required)
- contact_preference (enum: 'email' | 'phone' | 'sms')
- created_at (timestamp)
- updated_at (timestamp)
```

### Address (Philippine Format)
```
- id (UUID, primary key)
- customer_id (UUID, foreign key → Customer)
- label (string, e.g., "Home", "Work", "Other")
- street_address (string, required)
- barangay (string, required)
- city (string, required)
- province (string, required)
- region (string, optional)
- postal_code (string, 4 digits, required)
- is_default (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)

Constraints:
- Each customer can have 1-3 addresses
- Exactly ONE address must be marked as is_default per customer
```

## Key Files Structure
```
src/
├── app/
│   ├── globals.css              # Red/white theme CSS variables
│   ├── layout.tsx
│   ├── page.tsx                 # Landing page with registration link
│   ├── register/
│   │   ├── page.tsx             # Customer registration form
│   │   └── success/
│   │       └── page.tsx         # Registration success page
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard (customer list)
│   │   ├── login/
│   │   │   └── page.tsx         # Admin login page
│   │   └── customers/
│   │       └── [id]/
│   │           ├── page.tsx     # Customer detail view
│   │           └── edit/
│   │               └── page.tsx # Customer edit page
│   └── api/
│       ├── customers/
│       │   ├── route.ts         # POST endpoint for customer creation
│       │   └── [id]/
│       │       └── route.ts     # GET/PUT/DELETE customer endpoints
│       ├── addresses/
│       │   └── [id]/
│       │       └── set-default/
│       │           └── route.ts # POST set default address
│       └── admin/
│           ├── login/
│           │   └── route.ts     # Admin login API
│           └── logout/
│               └── route.ts     # Admin logout API
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── forms/
│   │   ├── customer-form.tsx    # Main customer registration form
│   │   └── address-form.tsx     # Address sub-form with add/remove
│   └── admin/
│       ├── customer-list.tsx    # Customer list with search/filter
│       ├── logout-button.tsx    # Logout button component
│       ├── edit-customer-form.tsx        # Edit customer form
│       ├── delete-customer-dialog.tsx    # Delete confirmation dialog
│       └── set-default-address-button.tsx # Set default address button
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Session + admin auth middleware
│   ├── types/
│   │   └── index.ts             # Customer, Address types
│   ├── validations/
│   │   └── customer.ts          # Zod schemas for form validation
│   └── utils.ts
├── middleware.ts                # Next.js middleware
supabase/
├── schema.sql                   # Complete schema (run in SQL Editor)
└── migrations/
    ├── 001_create_tables.sql    # Tables, indexes, triggers
    └── 002_enable_rls.sql       # RLS policies
test/
├── setup.ts                     # Vitest setup
├── customer-validation.test.ts  # Zod schema tests (52 tests)
└── admin-components.test.tsx    # Admin component tests (36 tests)
```

## Commands
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run Vitest
npm run test:coverage # Test coverage
```

## Database Schema (for Phase 2)
```sql
-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  contact_preference VARCHAR(20) NOT NULL CHECK (contact_preference IN ('email', 'phone', 'sms')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table (Philippine Format)
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  street_address VARCHAR(500) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  postal_code VARCHAR(4) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);

-- Ensure only one default address per customer
CREATE UNIQUE INDEX idx_one_default_address
ON addresses(customer_id)
WHERE is_default = TRUE;
```

## RLS Policies
Row Level Security is enabled on all tables. See `supabase/migrations/002_enable_rls.sql` for policy details.

## Agents to Use During Implementation

**IMPORTANT: ALWAYS use the agents listed below for each phase. This is mandatory, not optional.**

| Phase | Agent | Purpose |
|-------|-------|---------|
| All phases | `code-reviewer` | Review code after each epic completion |
| Phase 1 | `build-engineer` | Project setup validation |
| Phase 2 | `build-engineer` | Database/Supabase setup |
| Phase 3-5 | `qa-expert` | Test writing guidance |
| Phase 6 | `documentation-engineer` | README and docs |
| All phases | `git-workflow-manager` | Branch/merge assistance |

### Agent Execution Strategy
**Run these agents in parallel (in background) to improve time efficiency:**

1. **At the START of each phase:**
   - Launch `documentation-engineer` in background to update README as you implement

2. **At the END of each phase (before merging):**
   - Launch `qa-expert` in background to write tests
   - Continue with other work while tests are being written
   - Review test results before merging

3. **After merging to main:**
   - Run `code-reviewer` for final review

**Example parallel execution:**
```
# Start phase - launch documentation-engineer in background
Task(subagent_type="documentation-engineer", run_in_background=true)

# Implement features...

# End phase - launch qa-expert in background
Task(subagent_type="qa-expert", run_in_background=true)

# Continue with git operations while qa-expert runs
# Check AgentOutputTool for results before final merge
```

## TypeScript Types (for Phase 2)
```typescript
// src/lib/types/index.ts
export type ContactPreference = 'email' | 'phone' | 'sms'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  contact_preference: ContactPreference
  created_at: string
  updated_at: string
  addresses?: Address[]
}

export interface Address {
  id: string
  customer_id: string
  label: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}
```

## Zod Validation Schema (for Phase 3)
```typescript
// src/lib/validations/customer.ts
import { z } from 'zod'

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().default('USA'),
  is_default: z.boolean().default(false),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  contact_preference: z.enum(['email', 'phone', 'sms']),
  addresses: z.array(addressSchema)
    .min(1, 'At least one address is required')
    .max(3, 'Maximum 3 addresses allowed')
    .refine(
      (addresses) => addresses.filter(a => a.is_default).length === 1,
      'Exactly one address must be set as default'
    ),
})
```

## Testing Strategy

| Phase | Tests to Add | Coverage Target |
|-------|-------------|-----------------|
| Phase 2 | Zod schema tests (10-15) | 100% on schemas |
| Phase 3 | API POST tests (8-12) | 80% on routes |
| Phase 5 | API PUT/DELETE tests (10-12) | 80% on routes |
| Phase 6 | Final coverage check | 65% overall |

## Quick Reference: Git Commands

```bash
# Start any phase (example: Phase 2)
git checkout develop
git checkout -b feature/database-setup

# Commit a story
git add .
git commit -m "CP-{n}: Description"

# Complete a phase
git checkout develop
git merge --no-ff feature/database-setup -m "Merge feature/database-setup: Database setup complete"
git tag -a epic-2-complete -m "EPIC 2 completed"

# View progress
git log --oneline --grep="^CP-"
git tag -l "epic-*"
```

## Admin Authentication
- Login page: `/admin/login`
- Protected routes: All `/admin/*` routes (except login)
- Session: 24-hour httpOnly cookie
- Configure credentials via environment variables (see `.env.example`)

## UI Customizations
- Home page title: "Customer Profile Registration"
- Contact preference options: Email, SMS (Phone removed)
- Address section title: "Delivery Address"

## Notes
- Using shadcn/ui with sonner (toast is deprecated)
- Next.js 16 shows middleware deprecation warning (still functional)
- Supabase credentials in `.env.local` (gitignored)
- Admin credentials in `.env.local` (gitignored)
- Full project plan available in `customer-profile-collector-plan.md` (gitignored)
