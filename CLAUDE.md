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
- **Deployment:** Vercel (planned)

## Git Workflow
- **Branch naming:** `feature/{descriptive-name}`
- **Commits:** `CP-{n}: Brief description`
- **Merges:** Always use `--no-ff`
- **Tags:** `epic-{n}-complete`, `phase-{n}`, `v{major}.{minor}.{patch}`

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

### Phase 3: Customer Registration Form (EPIC 3) ⏳ PENDING
- [ ] CP-7: Build customer form UI with Zod validation
- [ ] CP-8: Build address sub-form component
- [ ] CP-9: Implement form submission API
- [ ] CP-10: Build success page

### Phase 4: Admin Dashboard (EPIC 4) ⏳ PENDING
- [ ] CP-11: Build customer list page
- [ ] CP-12: Add search & filter
- [ ] CP-13: Build customer detail view

### Phase 5: Edit & Delete (EPIC 5) ⏳ PENDING
- [ ] CP-14: Edit customer info
- [ ] CP-15: Delete customer with confirmation
- [ ] CP-16: Change default address

### Phase 6: Polish & Deployment (EPIC 6) ⏳ PENDING
- [ ] CP-17: Add loading & error states
- [ ] CP-18: Mobile responsiveness
- [ ] CP-19: Deploy to Vercel

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
│   ├── page.tsx
│   ├── register/                # (Phase 3)
│   ├── admin/                   # (Phase 4-5)
│   └── api/customers/           # (Phase 3-5)
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── forms/                   # (Phase 3)
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Session middleware
│   ├── types/
│   │   └── index.ts             # Customer, Address types
│   ├── validations/             # (Phase 3)
│   └── utils.ts
├── middleware.ts                # Next.js middleware
supabase/
├── schema.sql                   # Complete schema (run in SQL Editor)
└── migrations/
    ├── 001_create_tables.sql    # Tables, indexes, triggers
    └── 002_enable_rls.sql       # RLS policies
test/
└── setup.ts                     # Vitest setup
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

## RLS Policies (for Phase 2)
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Public policies (tighten later with auth)
CREATE POLICY "Allow public insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON addresses FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON customers FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON addresses FOR DELETE USING (true);
```

## Notes
- Using shadcn/ui with sonner (toast is deprecated)
- Next.js 16 shows middleware deprecation warning (still functional)
- Supabase credentials in `.env.local` (gitignored)
- Full project plan available in `customer-profile-collector-plan.md` (gitignored)
