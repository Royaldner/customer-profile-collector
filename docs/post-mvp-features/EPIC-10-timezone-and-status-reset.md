# EPIC-10: Timezone Update & Status Reset

**Status:** Complete
**Created:** 2026-01-16
**Branch:** `feature/timezone-and-status-reset`

## Problem Statement

1. **Timezone**: All timestamps display in Philippine locale (`en-PH`) but the business operates in Montreal, Quebec. Dates should show in Eastern Time (`America/Toronto`).

2. **Status Reset**: The "Ready to Ship" status is one-way (Pending → Ready). Admin needs ability to reset status back to Pending manually or when marking an order as delivered.

## Goals

- [x] All timestamps display in Montreal timezone (Eastern Time)
- [x] Admin can manually reset customer status to Pending (single customer)
- [x] Admin can mark customer as "Delivered" (single customer)
- [x] Admin can bulk reset multiple customers to Pending (from customer list)
- [x] Admin can bulk mark multiple customers as Delivered (from customer list)
- [x] Confirmation dialogs for all reset/delivered actions

## Non-Goals (Out of Scope)

- ~~Delivery history tracking (not storing when each delivery happened)~~ → **ADDED in enhancement (2026-01-20)**
- Automatic courier API integration for delivery tracking
- User-configurable timezone selection

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | All admin dashboard timestamps display in `America/Toronto` timezone | Must |
| R2 | All customer dashboard timestamps display in `America/Toronto` timezone | Must |
| R3 | Admin can reset single customer status to "Pending" via button (detail page) | Must |
| R4 | Admin can mark single customer as "Delivered" via button (detail page) | Must |
| R5 | Reset/Delivered buttons only visible when status is "Ready to Ship" | Must |
| R6 | Confirmation dialog before resetting status (single and bulk) | Must |
| R7 | Admin can bulk reset multiple customers to "Pending" from customer list | Must |
| R8 | Admin can bulk mark multiple customers as "Delivered" from customer list | Must |
| R9 | Bulk actions use existing checkbox selection pattern (like bulk email) | Must |

### Non-Functional

- **Performance**: No database changes, minimal code impact
- **Localization**: Use `en-CA` locale with `America/Toronto` timezone

---

## Technical Design

### Database Changes

None required. The `delivery_confirmed_at` column already exists:
- `NULL` = Pending status
- `NOT NULL` = Ready to Ship status

Reset simply sets `delivery_confirmed_at = NULL`.

### API Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers/[id]/reset-status` | Reset single customer status to Pending |
| POST | `/api/customers/[id]/mark-delivered` | Mark single customer as delivered |
| POST | `/api/admin/bulk-reset-status` | Bulk reset multiple customers to Pending |
| POST | `/api/admin/bulk-mark-delivered` | Bulk mark multiple customers as delivered |

**Single customer endpoints** (`/api/customers/[id]/...`):
- Sets `delivery_confirmed_at = NULL` for the customer

**Bulk endpoints** (`/api/admin/bulk-...`):
- Accept `{ customerIds: string[] }` in request body
- Update all specified customers in a single database operation
- Return count of updated records

Both reset and delivered endpoints perform the same database operation but exist separately for:
- Clearer audit trail / logging potential
- Different confirmation messages in UI
- Future differentiation (e.g., delivery history tracking later)

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/utils.ts` | Modify | Add centralized `formatDate()` function |
| `src/components/admin/customer-list.tsx` | Modify | Use shared `formatDate`, add bulk action buttons |
| `src/components/admin/courier-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/components/admin/email-log-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/components/admin/email-template-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/app/admin/customers/[id]/page.tsx` | Modify | Use shared `formatDate`, add reset/delivered buttons |
| `src/app/customer/dashboard/page.tsx` | Modify | Use shared `formatDate` |
| `src/app/api/customers/[id]/reset-status/route.ts` | Create | POST endpoint to reset single customer status |
| `src/app/api/customers/[id]/mark-delivered/route.ts` | Create | POST endpoint to mark single customer delivered |
| `src/app/api/admin/bulk-reset-status/route.ts` | Create | POST endpoint to bulk reset status |
| `src/app/api/admin/bulk-mark-delivered/route.ts` | Create | POST endpoint to bulk mark delivered |
| `src/components/admin/bulk-status-dialog.tsx` | Create | Confirmation dialog for bulk actions |
| `test/admin-components.test.tsx` | Modify | Update locale expectations in tests |

### Utility Function

```typescript
// src/lib/utils.ts
export function formatDate(dateString: string, includeTime = false) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Toronto',
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return new Date(dateString).toLocaleString('en-CA', options)
}
```

### Dependencies

- None (uses native JavaScript `Intl.DateTimeFormat`)

---

## User Experience

### User Flow: Reset to Pending

1. Admin navigates to customer detail page (`/admin/customers/[id]`)
2. Customer status shows "Ready to Ship" badge (green)
3. Admin clicks "Reset to Pending" button
4. Confirmation dialog appears: "Reset status to Pending?"
5. Admin confirms
6. API call resets `delivery_confirmed_at = NULL`
7. Badge updates to "Pending" (yellow)
8. Success toast notification

### User Flow: Mark as Delivered

1. Admin navigates to customer detail page
2. Customer status shows "Ready to Ship" badge
3. Admin clicks "Mark as Delivered" button
4. Confirmation dialog appears: "Mark this order as delivered? Status will reset to Pending for next order."
5. Admin confirms
6. API call resets `delivery_confirmed_at = NULL`
7. Badge updates to "Pending"
8. Success toast notification

### User Flow: Bulk Reset to Pending

1. Admin navigates to customer list page (`/admin`)
2. Admin selects multiple customers using checkboxes
3. Admin clicks "Reset to Pending" button in bulk action bar
4. Confirmation dialog appears: "Reset {n} customers to Pending?"
5. Admin confirms
6. API call bulk resets all selected customers
7. Customer list refreshes, badges update to "Pending"
8. Success toast: "{n} customers reset to Pending"
9. Selection is cleared

### User Flow: Bulk Mark as Delivered

1. Admin navigates to customer list page
2. Admin selects multiple customers using checkboxes
3. Admin clicks "Mark as Delivered" button in bulk action bar
4. Confirmation dialog appears: "Mark {n} customers as Delivered? Status will reset to Pending."
5. Admin confirms
6. API call bulk marks all selected customers
7. Customer list refreshes, badges update to "Pending"
8. Success toast: "{n} customers marked as Delivered"
9. Selection is cleared

### UI Changes

**Customer Detail Page Header (when Ready to Ship):**
```
[Ready to Ship ✓]  [Reset to Pending]  [Mark as Delivered]
```

**Customer Detail Page Header (when Pending):**
```
[Pending ⏱]  (no buttons)
```

**Customer List Bulk Action Bar (when customers selected):**
```
{n} selected  [Send Email]  [Reset to Pending]  [Mark as Delivered]  [Clear Selection]
```

---

## Implementation Plan

### Tasks

| ID | Task | Estimate |
|----|------|----------|
| CP-76 | Add `formatDate` utility to `src/lib/utils.ts` | S |
| CP-77 | Update 6 components to use shared `formatDate` | M |
| CP-78 | Create `/api/customers/[id]/reset-status` endpoint | S |
| CP-79 | Create `/api/customers/[id]/mark-delivered` endpoint | S |
| CP-80 | Add Reset/Delivered buttons to customer detail page | M |
| CP-81 | Create `/api/admin/bulk-reset-status` endpoint | S |
| CP-82 | Create `/api/admin/bulk-mark-delivered` endpoint | S |
| CP-83 | Create `bulk-status-dialog.tsx` confirmation component | M |
| CP-84 | Add bulk action buttons to customer list | M |
| CP-85 | Update tests for new locale and bulk actions | M |

### Phases

**Phase 1: Timezone (CP-76, CP-77)**
- Add utility function
- Update all components to use shared formatDate

**Phase 2: Single Customer Status Reset (CP-78, CP-79, CP-80)**
- Create single customer API endpoints
- Add UI buttons to customer detail page with confirmation dialogs

**Phase 3: Bulk Status Operations (CP-81, CP-82, CP-83, CP-84)**
- Create bulk API endpoints
- Create confirmation dialog component
- Add bulk action buttons to customer list

**Phase 4: Testing (CP-85)**
- Update tests for new locale
- Add tests for bulk operations

---

## Acceptance Criteria

- [x] All admin timestamps show in Montreal timezone (e.g., "Jan 16, 2026")
- [x] All customer dashboard timestamps show in Montreal timezone
- [x] Single customer "Reset to Pending" button visible only when status is Ready
- [x] Single customer "Mark as Delivered" button visible only when status is Ready
- [x] Single customer buttons show confirmation dialog before action
- [x] Bulk "Reset to Pending" button visible in customer list when customers selected
- [x] Bulk "Mark as Delivered" button visible in customer list when customers selected
- [x] Bulk actions show confirmation dialog with customer count
- [x] Status correctly updates after single and bulk operations
- [x] Selection is cleared after bulk operation completes
- [x] All tests passing
- [x] No TypeScript errors
- [x] Build succeeds

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test failures due to locale change | Low | Update test expectations to match new locale |
| User confusion about two similar buttons | Low | Clear button labels and confirmation messages |

---

## Open Questions

- [x] ~~Should we track delivery history?~~ → Initially no, **later added via enhancement (2026-01-20)**
- [x] ~~Manual or automatic reset?~~ → Manual only
- [x] ~~User's timezone?~~ → Montreal, Quebec (America/Toronto)

---

## Enhancement: Delivery Status Logs (2026-01-20)

After initial implementation, added:

### Database Changes
- Added `delivered_at` column to customers table
- Created `delivery_logs` table with `delivery_action` enum (`confirmed`, `delivered`, `reset`)
- Migration: `009_delivery_status_logs.sql`

### Three-State Status
| Status | Badge | Condition |
|--------|-------|-----------|
| Pending | Gray | `delivery_confirmed_at = NULL` |
| Ready to Ship | Blue | `delivery_confirmed_at != NULL` AND `delivered_at = NULL` |
| Delivered | Green | `delivered_at != NULL` |

### Delivery History
- All status changes logged with timestamps
- Viewable in customer detail page under "Delivery History" card
- Actions tracked: Confirmed Ready to Ship, Marked as Delivered, Reset to Pending
