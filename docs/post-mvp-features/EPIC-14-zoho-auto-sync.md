# EPIC-14: Automatic Zoho Books Customer Sync

**Status:** Draft
**Created:** 2026-01-27
**Branch:** `feature/zoho-auto-sync`

## Problem Statement

When customers register through the app, their information is only stored in the local database. Admins must manually link each customer to their Zoho Books contact, and new customers must be manually created in Zoho Books. This creates extra work and delays in order processing. Automatic sync would eliminate this manual step and ensure all customers have Zoho accounts ready for invoicing.

## Goals

- [ ] Ask customers during registration if they're new or returning
- [ ] Automatically create Zoho contact for new customers (background)
- [ ] Automatically search and link returning customers to existing Zoho contacts
- [ ] Handle ambiguous matches gracefully (admin manual review)
- [ ] Provide admin visibility into sync status and retry capabilities

## Non-Goals (Out of Scope)

- Real-time synchronous sync (registration speed is priority)
- Syncing customer updates to Zoho (one-time link only)
- Bulk backfill of existing customers (manual for now)
- Two-way sync from Zoho to app
- Payment processing through the app

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Add "New or Returning Customer" question during registration | Must |
| R2 | New customers: Create Zoho contact in background | Must |
| R3 | Returning customers: Search by email then name in background | Must |
| R4 | Link customer when single match found | Must |
| R5 | Skip auto-link when multiple matches (mark for manual review) | Must |
| R6 | Mark as failed when no match found for returning customer | Must |
| R7 | Track sync status on customer record (pending/syncing/synced/failed/skipped/manual) | Must |
| R8 | Admin can trigger manual retry for failed/skipped customers | Should |
| R9 | Admin can see sync status in customer list and detail views | Should |
| R10 | Background cron processes sync queue hourly | Must |
| R11 | Retry failed syncs with exponential backoff (max 3 attempts) | Should |

### Non-Functional

- **Performance:** Registration unaffected (background sync), cron processes max 10 items/run
- **Security:** Zoho API calls use service role, OAuth CREATE scope required
- **API Limits:** Stay under 500 calls/day (same as EPIC 11)

---

## Technical Design

### Database Changes

```sql
-- Migration: 011_zoho_sync.sql

-- Customer type (new vs returning)
ALTER TABLE customers ADD COLUMN is_returning_customer BOOLEAN DEFAULT FALSE;

-- Sync tracking columns
ALTER TABLE customers ADD COLUMN zoho_sync_status VARCHAR(20) DEFAULT 'pending'
  CHECK (zoho_sync_status IN ('pending', 'syncing', 'synced', 'failed', 'skipped', 'manual'));
ALTER TABLE customers ADD COLUMN zoho_sync_error TEXT;
ALTER TABLE customers ADD COLUMN zoho_sync_attempts INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN zoho_last_sync_at TIMESTAMP WITH TIME ZONE;

-- Sync queue table for background processing
CREATE TABLE zoho_sync_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'match', 'retry')),
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_zoho_sync_queue_pending ON zoho_sync_queue(scheduled_for)
  WHERE processed_at IS NULL;
CREATE INDEX idx_zoho_sync_queue_customer ON zoho_sync_queue(customer_id);

-- RLS for sync queue (service role only)
ALTER TABLE zoho_sync_queue ENABLE ROW LEVEL SECURITY;
```

### API Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cron/zoho-sync` | Cron endpoint to process sync queue |
| POST | `/api/admin/customers/[id]/zoho-sync` | Manually trigger sync retry |
| DELETE | `/api/admin/customers/[id]/zoho-sync` | Reset sync status for retry |

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/011_zoho_sync.sql` | Create | Database migration for sync tracking |
| `src/lib/services/zoho-books.ts` | Modify | Add POST support, email search, createContact, findMatchingContact |
| `src/lib/services/zoho-sync.ts` | Create | Background sync processing logic |
| `src/lib/types/index.ts` | Modify | Add sync fields to Customer interface |
| `src/lib/types/zoho.ts` | Modify | Add MatchResult type |
| `src/lib/validations/customer.ts` | Modify | Add is_returning_customer field |
| `src/components/forms/steps/customer-history-step.tsx` | Create | New/returning customer selection UI |
| `src/components/forms/customer-form.tsx` | Modify | Add customer history step to stepper |
| `src/app/api/customers/route.ts` | Modify | Queue sync after customer creation |
| `src/app/api/cron/zoho-sync/route.ts` | Create | Cron endpoint for background processing |
| `src/app/api/admin/customers/[id]/zoho-sync/route.ts` | Create | Manual sync trigger |
| `src/components/admin/zoho-section.tsx` | Modify | Show sync status, add retry button |
| `src/components/admin/customer-list.tsx` | Modify | Add sync status column and filter |
| `vercel.json` | Modify | Add zoho-sync cron job |

### OAuth Scope Update

```typescript
// src/lib/services/zoho-books.ts line 69
// Change from:
const scopes = 'ZohoBooks.invoices.READ,ZohoBooks.contacts.READ'
// To:
const scopes = 'ZohoBooks.invoices.READ,ZohoBooks.contacts.READ,ZohoBooks.contacts.CREATE'
```

**Post-deployment:** Re-authorize Zoho to grant CREATE permission (delete `zoho_tokens` row, reconnect).

### New Zoho Service Methods

```typescript
// src/lib/services/zoho-books.ts

// 1. Search by email (exact match)
export async function searchContactByEmail(email: string): Promise<ZohoContact[]>

// 2. Create new contact
export async function createContact(input: {
  contact_name: string
  email?: string
  phone?: string
}): Promise<ZohoContact>

// 3. Find matching contact (email first, then name)
export async function findMatchingContact(
  email: string,
  name: string
): Promise<MatchResult>

// MatchResult type
interface MatchResult {
  contact: ZohoContact | null
  matchType: 'email' | 'name' | 'none' | 'ambiguous'
  allMatches: ZohoContact[]
  error?: string
}
```

### Caching Strategy

**Same as EPIC 11** - Created contacts are not cached. Search results are not cached (real-time needed). Only invoice data uses caching.

### Dependencies

- EPIC 11 Zoho Books Integration (complete)
- Zoho Books API with CREATE scope

---

## User Experience

### User Flow: Registration with Customer History Step

1. Customer fills Personal Info (step 1)
2. **NEW:** Customer sees "Have you ordered before?" (step 2)
3. Customer selects "New customer" or "Returning customer"
4. Customer continues to Delivery Method (step 3)
5. Customer completes registration
6. Background: Sync queued and processed within the hour

### UI: Customer History Step

```
+------------------------------------------------------------------+
| Have you ordered from Cangoods before?                           |
|                                                                  |
| This helps us link your order history to your new account.       |
+------------------------------------------------------------------+
|                                                                  |
| +--------------------------------------------------------------+ |
| | [New] I'm a new customer                                     | |
| |                                                              | |
| | This is my first time ordering from Cangoods                 | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--------------------------------------------------------------+ |
| | [Return] I'm a returning customer                            | |
| |                                                              | |
| | I've ordered from Cangoods before and want to link my        | |
| | previous order history to this account                       | |
| +--------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### UI: Admin Customer Detail - Sync Status

```
+------------------------------------------------------------------+
| Zoho Books                                                        |
+------------------------------------------------------------------+
| Status: [Synced]                    Customer Type: [New]          |
| Linked to: Juan Dela Cruz (5000012345)        [Change] [Unlink]  |
+------------------------------------------------------------------+

-- OR for failed status --

+------------------------------------------------------------------+
| Zoho Books                                                        |
+------------------------------------------------------------------+
| Status: [Failed]                    Customer Type: [Returning]    |
| Error: No matching contact found in Zoho Books                    |
|                                         [Retry Sync] [Link Manually]|
+------------------------------------------------------------------+
```

### UI: Admin Customer List - Sync Column

```
| Name           | Email              | Type      | Zoho Sync    | Actions |
|----------------|--------------------|-----------|--------------| --------|
| Juan Dela Cruz | juan@email.com     | Return    | Synced       | ...     |
| Maria Santos   | maria@email.com    | New       | Pending      | ...     |
| Pedro Garcia   | pedro@email.com    | Return    | Review       | ...     |
| Ana Lopez      | ana@email.com      | New       | Failed       | ...     |
```

---

## Implementation Plan

### Tasks

| ID | Task | Estimate |
|----|------|----------|
| CP-46 | Create migration 011_zoho_sync.sql | S |
| CP-47 | Update OAuth scope in zoho-books.ts | S |
| CP-48 | Add POST support to zohoRequest() | M |
| CP-49 | Add searchContactByEmail(), createContact(), findMatchingContact() | M |
| CP-50 | Update Customer types and Zod validation | S |
| CP-51 | Create customer-history-step.tsx component | M |
| CP-52 | Update customer-form.tsx with new step | M |
| CP-53 | Create zoho-sync.ts service (background processor) | L |
| CP-54 | Create /api/cron/zoho-sync endpoint | M |
| CP-55 | Update /api/customers/route.ts to queue sync | S |
| CP-56 | Create /api/admin/customers/[id]/zoho-sync endpoint | M |
| CP-57 | Update vercel.json with zoho-sync cron | S |
| CP-58 | Update zoho-section.tsx with sync status | M |
| CP-59 | Update customer-list.tsx with sync column/filter | M |
| CP-60 | Test full flow and edge cases | M |
| CP-61 | Update documentation | S |

### Phases

**Phase 1: Database & Service Foundation (CP-46 to CP-50)**
- Database migration
- OAuth scope update
- Zoho service methods
- Type updates

**Phase 2: Registration Flow (CP-51, CP-52)**
- Customer history step component
- Multi-step form update

**Phase 3: Background Processing (CP-53 to CP-57)**
- Sync service
- Cron endpoint
- Registration queue trigger
- Admin sync trigger
- Vercel cron config

**Phase 4: Admin UI (CP-58, CP-59)**
- Sync status in Zoho section
- Customer list updates

**Phase 5: Testing & Documentation (CP-60, CP-61)**
- End-to-end testing
- Documentation updates

---

## Acceptance Criteria

- [ ] Registration form shows "New or Returning" step
- [ ] New customers: Zoho contact created in background
- [ ] Returning customers: Zoho contact searched and linked if single match
- [ ] Multiple matches: Status = 'skipped', admin can review
- [ ] No match: Status = 'failed', admin can link manually
- [ ] Cron runs hourly and processes pending items
- [ ] Admin can see sync status on customer list and detail
- [ ] Admin can retry failed syncs
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] API usage stays under 500 calls/day

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Zoho API create failures | Medium | Low | Retry logic, error tracking |
| Many returning customers with no match | Medium | Medium | Clear "not found" message, easy manual link |
| Wrong auto-link (name collision) | High | Low | Email-first strategy, admin verification |
| Cron not running on Hobby plan | Medium | Low | Hourly schedule works on Hobby |
| OAuth CREATE scope denied | High | Low | Clear re-auth instructions |

---

## Environment Variables

No new environment variables needed. Uses existing Zoho credentials from EPIC 11.

---

## Open Questions

- [x] ~~Should new customers skip sync?~~ -> No, create Zoho contact for all
- [x] ~~How to handle multiple matches?~~ -> Status = 'skipped', admin reviews
- [x] ~~Sync timing?~~ -> Background via hourly cron
- [ ] Should we notify admin of failed syncs? (email/dashboard alert)
- [ ] Backfill strategy for existing customers without sync status?

---

## Sync Flow Diagram

```
Registration Form
       |
"Have you ordered before?"
       |
+------+------+
|             |
New        Returning
 |             |
Queue       Queue
'create'    'match'
 |             |
 +------+------+
        |
   Cron picks up (hourly)
        |
+-------+-------+
|               |
CREATE        SEARCH
(new)       (returning)
 |               |
Create      +----+----+
contact     |         |
 |       1 match    0 or >1
Link      |         |
 |      Link    +---+---+
synced    |     0       >1
        synced   |       |
              failed  skipped
              (admin   (admin
               links)   picks)
```
