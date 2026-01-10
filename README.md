# Customer Profile Collector

A customer profile collection system for small businesses. Phase 1 of a future full e-commerce platform. Allows collecting customer information via a shareable form and managing customer data through an admin GUI.

## Features

### Current (Completed - Phase 1)
- Customer registration form with validation
- Philippine address format support (Barangay, Province, Region)
- Multiple addresses per customer (1-3)
- Default address management
- Contact preference selection (Email, SMS)
- Admin dashboard with customer management
- Search and filter functionality
- Customer detail view
- Edit/delete customer operations
- Mobile-responsive design
- Admin authentication
- Success confirmation page
- Red/white themed UI

### Planned (Phase 2: Customer UX Enhancement)
- Google OAuth sign-in for customers
- Customer dashboard (view/edit own profile)
- 3-step registration wizard
- Delivery method selection (Pick-up, Delivery, COD)
- Philippine address autocomplete (PSGC data)
- Searchable city/barangay dropdowns

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Supabase](https://supabase.com/) | - | PostgreSQL database |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | - | UI components |
| [Zod](https://zod.dev/) | 4.x | Schema validation |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Form handling |
| [Vitest](https://vitest.dev/) | - | Testing |

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Royaldner/customer-profile-collector.git
cd customer-profile-collector
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the contents of `supabase/schema.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── app/
│   ├── api/customers/     # API routes
│   ├── register/          # Registration pages
│   └── admin/             # Admin pages (Phase 4-5)
├── components/
│   ├── ui/                # shadcn/ui components
│   └── forms/             # Form components
└── lib/
    ├── supabase/          # Supabase client utilities
    ├── types/             # TypeScript types
    └── validations/       # Zod schemas
```

## Database Schema

### Customers Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Customer name |
| email | VARCHAR(255) | Unique email address |
| phone | VARCHAR(50) | Phone number |
| contact_preference | VARCHAR(20) | 'email', 'phone', or 'sms' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Addresses Table (Philippine Format)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| customer_id | UUID | Foreign key to customers |
| label | VARCHAR(100) | e.g., "Home", "Work" |
| street_address | VARCHAR(500) | House/Unit, Street |
| barangay | VARCHAR(255) | Barangay name |
| city | VARCHAR(255) | City/Municipality |
| province | VARCHAR(255) | Province |
| region | VARCHAR(100) | Region (optional) |
| postal_code | VARCHAR(4) | 4-digit postal code |
| is_default | BOOLEAN | Default address flag |

## Development Workflow

This project follows a Git workflow with feature branches:

```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit changes
git commit -m "CP-{n}: Brief description"

# Merge with no-ff
git checkout develop
git merge --no-ff feature/feature-name
```

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Project setup & infrastructure |
| 2 | ✅ Complete | Database setup |
| 3 | ✅ Complete | Customer registration form |
| 4 | ✅ Complete | Admin dashboard |
| 5 | ✅ Complete | Edit & delete operations |
| 6 | ✅ Complete | Polish & deployment |
| 7 | 📋 Planned | Customer UX Enhancement |

### Phase 7: Customer UX Enhancement (Planned)

#### 7.1 Google OAuth + Account System
- Google sign-in for customers
- Customer dashboard (view/edit own profile)
- Supabase Auth integration

#### 7.2 Multi-Step Registration Form
- 3-step wizard: Personal Info → Delivery Method → Address/Review
- Delivery method options: Pick-up, Delivery, Cash on Delivery (COD)
- Skip address section for pick-up orders

#### 7.3 Philippine Address Autocomplete
- Searchable combobox for cities/municipalities (~1,500)
- Searchable combobox for barangays (~42,000)
- Auto-populate province and region from city selection
- PSGC (Philippine Standard Geographic Code) data integration

## License

Private - All rights reserved

## Links

- [GitHub Repository](https://github.com/Royaldner/customer-profile-collector)
- [Supabase Dashboard](https://supabase.com/dashboard)
