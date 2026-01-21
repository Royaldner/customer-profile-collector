# EPIC-11: Zoho Books Integration

**Status:** Draft
**Created:** 2026-01-20
**Branch:** `feature/zoho-books-integration`

## Problem Statement

All orders, invoices, and payments are managed in Zoho Books, but customers have no visibility into their order history or payment status through the application. Customers must contact support to check their order status, and admins must switch between the app and Zoho Books to get full customer context.

## Goals

- [ ] Establish OAuth 2.0 connection to Zoho Books API
- [ ] Enable admin to link app customers to Zoho Books contacts
- [ ] Display customer invoices in customer dashboard (self-service)
- [ ] Display customer invoices in admin customer detail page
- [ ] Implement caching to stay within free tier API limits (1,000 calls/day)

## Non-Goals (Out of Scope)

- Payment processing through the app (future feature)
- Creating/editing invoices from the app
- Syncing customer data TO Zoho Books
- Real-time webhooks from Zoho
- Product catalog display
- Order creation from the app

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | OAuth 2.0 flow to authenticate with Zoho Books API | Must |
| R2 | Store and auto-refresh Zoho access tokens | Must |
| R3 | Admin can search Zoho Books contacts by name/email | Must |
| R4 | Admin can link/unlink customer to Zoho contact | Must |
| R5 | Customer dashboard displays their invoices from Zoho | Must |
| R6 | Admin customer detail page displays customer's invoices | Must |
| R7 | Invoices show: number, date, items, quantities, amounts, paid, balance, status | Must |
| R8 | "Recent Orders" tab shows unpaid/partially paid invoices | Must |
| R9 | "Completed Orders" tab shows paid invoices | Must |
| R10 | Cache API responses to reduce Zoho API calls | Must |
| R11 | Unlinked customers see appropriate "not linked" message | Should |
| R12 | Show "last updated" timestamp on cached data | Should |

### Non-Functional

- **Performance:** API responses cached for 10 minutes, < 2s load time
- **Security:** Customers can only see their own invoices; tokens stored securely
- **API Limits:** Stay under 500 calls/day (50% of free tier limit)

---

## Technical Design

### Database Changes

```sql
-- Migration: 010_zoho_integration.sql

-- Add Zoho contact link to customers
ALTER TABLE customers
ADD COLUMN zoho_contact_id VARCHAR(50);

CREATE INDEX idx_customers_zoho_contact_id
ON customers(zoho_contact_id);

-- Store Zoho OAuth tokens (singleton row)
CREATE TABLE zoho_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache Zoho API responses
CREATE TABLE zoho_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_zoho_cache_key ON zoho_cache(cache_key);
CREATE INDEX idx_zoho_cache_expires ON zoho_cache(expires_at);

-- RLS Policies
ALTER TABLE zoho_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_cache ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens (no public access)
CREATE POLICY "Service role only" ON zoho_tokens
  FOR ALL USING (false);

-- Cache readable by authenticated users
CREATE POLICY "Cache read for authenticated" ON zoho_cache
  FOR SELECT TO authenticated USING (true);
```

### API Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/zoho/callback` | OAuth callback - exchange code for tokens |
| GET | `/api/zoho/contacts` | Search Zoho contacts (admin only) |
| GET | `/api/customer/orders` | Get logged-in customer's invoices |
| GET | `/api/admin/customers/[id]/orders` | Get specific customer's invoices (admin) |
| POST | `/api/admin/customers/[id]/zoho-link` | Link customer to Zoho contact |
| DELETE | `/api/admin/customers/[id]/zoho-link` | Unlink customer from Zoho contact |

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/services/zoho-books.ts` | Create | Zoho API client with OAuth token management |
| `src/lib/types/zoho.ts` | Create | TypeScript types for Zoho entities |
| `src/app/api/zoho/callback/route.ts` | Create | OAuth callback handler |
| `src/app/api/zoho/contacts/route.ts` | Create | Search Zoho contacts endpoint |
| `src/app/api/customer/orders/route.ts` | Create | Customer orders endpoint |
| `src/app/api/admin/customers/[id]/orders/route.ts` | Create | Admin view customer orders |
| `src/app/api/admin/customers/[id]/zoho-link/route.ts` | Create | Link/unlink Zoho contact |
| `src/components/orders/orders-display.tsx` | Create | Shared orders list component |
| `src/components/orders/order-card.tsx` | Create | Individual invoice card |
| `src/components/admin/zoho-link-dialog.tsx` | Create | Dialog to link customer to Zoho |
| `src/hooks/use-zoho-orders.ts` | Create | React hook for fetching orders |
| `src/app/customer/dashboard/page.tsx` | Modify | Add orders section |
| `src/app/admin/customers/[id]/page.tsx` | Modify | Add orders section and Zoho link |

### Zoho Books API Details

| Attribute | Value |
|-----------|-------|
| Base URL | `https://www.zohoapis.com/books/v3` |
| Auth URL | `https://accounts.zoho.com/oauth/v2` |
| Region | Canada (uses `.com` domain) |
| Scopes | `ZohoBooks.invoices.READ`, `ZohoBooks.contacts.READ` |

### Zoho Invoice Status Mapping

| App Filter | Zoho Status Values |
|------------|-------------------|
| Recent Orders | `sent`, `overdue`, `partially_paid` |
| Completed Orders | `paid`, `void` |
| (Excluded) | `draft` |

### Caching Strategy

```
Request → Check Memory Cache (10 min TTL)
            ↓ miss
        Check DB Cache (1 hour TTL)
            ↓ miss
        Fetch from Zoho API
            ↓
        Store in DB Cache
            ↓
        Store in Memory Cache
            ↓
        Return Data
```

Cache key format: `invoices:{zoho_contact_id}:{status}:page{n}`

### Dependencies

- Zoho Books API account (free tier)
- Environment variables: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_ORG_ID`, `ZOHO_REDIRECT_URI`

---

## User Experience

### User Flow: Customer Views Orders

1. Customer logs into dashboard
2. Customer sees "My Orders" section
3. "Recent Orders" tab shows unpaid/partially paid invoices
4. Customer can switch to "Completed Orders" tab
5. Each invoice shows items, quantities, amounts, paid, balance
6. "Last updated" timestamp shows data freshness

### User Flow: Admin Links Customer to Zoho

1. Admin views customer detail page
2. Admin sees "Zoho Books" section with "Not linked" status
3. Admin clicks "Link to Zoho"
4. Dialog opens with search field
5. Admin searches by customer name or email
6. Matching Zoho contacts displayed
7. Admin selects correct contact
8. Link saved, orders now visible

### User Flow: Admin Views Customer Orders

1. Admin views customer detail page
2. If linked, "Orders from Zoho Books" section visible
3. Shows same invoice data as customer view
4. Admin can see Recent/Completed tabs

### UI: Customer Dashboard - Orders Section

```
┌─────────────────────────────────────────────────────────────────┐
│ My Orders                                    Last updated: 5m ago│
├─────────────────────────────────────────────────────────────────┤
│ [Recent Orders]  [Completed Orders]                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ INV-001234                        Status: Partially Paid    │ │
│ │ January 15, 2026                                            │ │
│ │ ───────────────────────────────────────────────────────── │ │
│ │ Product A              x2                         ₱500.00  │ │
│ │ Product B              x1                         ₱250.00  │ │
│ │ ───────────────────────────────────────────────────────── │ │
│ │ Total: ₱750.00      Paid: ₱500.00      Balance: ₱250.00   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ INV-001230                        Status: Unpaid            │ │
│ │ January 10, 2026                                            │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### UI: Admin Customer Detail - Zoho Section

```
┌─────────────────────────────────────────────────────────────────┐
│ Zoho Books                                                       │
├─────────────────────────────────────────────────────────────────┤
│ Linked to: Juan Dela Cruz (ID: 5000012345)    [Change] [Unlink] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Orders from Zoho Books                       Last updated: 5m ago│
├─────────────────────────────────────────────────────────────────┤
│ [Recent Orders]  [Completed Orders]                              │
│ (same invoice display as customer view)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Tasks

| ID | Task | Estimate |
|----|------|----------|
| CP-86 | Create migration 010_zoho_integration.sql | S |
| CP-87 | Create Zoho TypeScript types (`src/lib/types/zoho.ts`) | S |
| CP-88 | Create Zoho Books service with OAuth (`src/lib/services/zoho-books.ts`) | L |
| CP-89 | Create OAuth callback route (`/api/zoho/callback`) | M |
| CP-90 | Create Zoho contacts search route (`/api/zoho/contacts`) | S |
| CP-91 | Create customer-Zoho link routes (`/api/admin/customers/[id]/zoho-link`) | M |
| CP-92 | Create ZohoLinkDialog component | M |
| CP-93 | Add Zoho link section to admin customer detail page | S |
| CP-94 | Create customer orders route (`/api/customer/orders`) | M |
| CP-95 | Create admin customer orders route (`/api/admin/customers/[id]/orders`) | S |
| CP-96 | Create OrderCard component | M |
| CP-97 | Create OrdersDisplay component (shared) | M |
| CP-98 | Create useZohoOrders hook | S |
| CP-99 | Add orders section to customer dashboard | M |
| CP-100 | Add orders section to admin customer detail | S |
| CP-101 | Add environment variables to Vercel | S |
| CP-102 | Test OAuth flow end-to-end | M |
| CP-103 | Update documentation | S |

### Phases

**Phase 1: Foundation (CP-86 to CP-89)**
- Database migration
- TypeScript types
- Zoho service with OAuth
- OAuth callback route
- Complete OAuth flow, verify token storage

**Phase 2: Customer Linking (CP-90 to CP-93)**
- Contacts search API
- Link/unlink API routes
- ZohoLinkDialog component
- Admin UI for linking

**Phase 3: Orders Display - Admin (CP-94 to CP-97, CP-100)**
- Orders API routes
- OrderCard and OrdersDisplay components
- Add to admin customer detail page
- Implement caching

**Phase 4: Orders Display - Customer (CP-98, CP-99)**
- useZohoOrders hook
- Add orders section to customer dashboard
- Handle unlinked state

**Phase 5: Polish (CP-101 to CP-103)**
- Environment variables
- End-to-end testing
- Documentation

---

## Acceptance Criteria

- [ ] OAuth flow completes and stores refresh token
- [ ] Access token auto-refreshes when expired
- [ ] Admin can search Zoho contacts by name/email
- [ ] Admin can link customer to Zoho contact
- [ ] Admin can unlink customer from Zoho contact
- [ ] Linked customers see their invoices in dashboard
- [ ] Admin sees customer invoices on detail page
- [ ] Invoice data shows: number, date, items, qty, amount, paid, balance, status
- [ ] Recent/Completed tabs filter correctly
- [ ] Unlinked customers see "not linked" message
- [ ] Cached data shows "last updated" timestamp
- [ ] API usage stays under 500 calls/day
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Zoho API rate limiting | High | Low | 10-min caching, monitor usage |
| OAuth token expiry issues | Medium | Medium | Robust refresh logic with retry |
| Customer-Zoho mismatch | Medium | Medium | Admin verification UI, email matching |
| Zoho API downtime | Medium | Low | Show cached data with timestamp |
| Free tier limits exceeded | High | Low | Usage alerts at 70% threshold |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ZOHO_CLIENT_ID` | OAuth client ID | `1000.XXXX...` |
| `ZOHO_CLIENT_SECRET` | OAuth client secret | `abcd1234...` |
| `ZOHO_ORG_ID` | Zoho Books organization ID | `123456789` |
| `ZOHO_REDIRECT_URI` | OAuth callback URL | `https://app.vercel.app/api/zoho/callback` |

---

## Open Questions

- [ ] Should we auto-match customers by email during initial setup?
- [ ] How to handle customers with multiple Zoho contacts (same name)?
- [ ] Should admin be able to manually refresh cache?

---

## API Limits Reference

| Plan | Calls/Day | Calls/Min | Concurrent |
|------|-----------|-----------|------------|
| **Free** | 1,000 | 100 | 5 |
| Standard | 2,000 | 100 | 10 |

**Current customer count:** ~100
**Estimated daily usage:** 50-100 calls (with caching)
**Headroom:** 90% of free tier available
