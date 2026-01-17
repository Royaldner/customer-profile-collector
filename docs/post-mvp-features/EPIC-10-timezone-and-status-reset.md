# EPIC-10: Timezone Update & Status Reset

**Status:** Draft
**Created:** 2026-01-16
**Branch:** `feature/timezone-and-status-reset`

## Problem Statement

1. **Timezone**: All timestamps display in Philippine locale (`en-PH`) but the business operates in Montreal, Quebec. Dates should show in Eastern Time (`America/Toronto`).

2. **Status Reset**: The "Ready to Ship" status is one-way (Pending → Ready). Admin needs ability to reset status back to Pending manually or when marking an order as delivered.

## Goals

- [ ] All timestamps display in Montreal timezone (Eastern Time)
- [ ] Admin can manually reset customer status to Pending
- [ ] Admin can mark customer as "Delivered" (which resets status to Pending)

## Non-Goals (Out of Scope)

- Delivery history tracking (not storing when each delivery happened)
- Automatic courier API integration for delivery tracking
- User-configurable timezone selection

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | All admin dashboard timestamps display in `America/Toronto` timezone | Must |
| R2 | All customer dashboard timestamps display in `America/Toronto` timezone | Must |
| R3 | Admin can reset "Ready to Ship" status to "Pending" via button | Must |
| R4 | Admin can mark customer as "Delivered" via button (also resets to Pending) | Must |
| R5 | Reset/Delivered buttons only visible when status is "Ready to Ship" | Must |
| R6 | Confirmation dialog before resetting status | Should |

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
| POST | `/api/customers/[id]/reset-status` | Reset status to Pending (sets `delivery_confirmed_at = NULL`) |
| POST | `/api/customers/[id]/mark-delivered` | Mark as delivered (sets `delivery_confirmed_at = NULL`) |

Both endpoints perform the same database operation but exist separately for:
- Clearer audit trail / logging potential
- Different confirmation messages in UI
- Future differentiation (e.g., delivery history tracking later)

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/utils.ts` | Modify | Add centralized `formatDate()` function |
| `src/components/admin/customer-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/components/admin/courier-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/components/admin/email-log-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/components/admin/email-template-list.tsx` | Modify | Use shared `formatDate`, remove local function |
| `src/app/admin/customers/[id]/page.tsx` | Modify | Use shared `formatDate`, add reset/delivered buttons |
| `src/app/customer/dashboard/page.tsx` | Modify | Use shared `formatDate` |
| `src/app/api/customers/[id]/reset-status/route.ts` | Create | POST endpoint to reset status |
| `src/app/api/customers/[id]/mark-delivered/route.ts` | Create | POST endpoint to mark delivered |
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

### UI Changes

**Customer Detail Page Header (when Ready to Ship):**
```
[Ready to Ship ✓]  [Reset to Pending]  [Mark as Delivered]
```

**Customer Detail Page Header (when Pending):**
```
[Pending ⏱]  (no buttons)
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
| CP-81 | Update tests for new locale | S |

### Phases

**Phase 1: Timezone (CP-76, CP-77, CP-81)**
- Add utility function
- Update all components
- Update tests

**Phase 2: Status Reset (CP-78, CP-79, CP-80)**
- Create API endpoints
- Add UI buttons with confirmation dialogs

---

## Acceptance Criteria

- [ ] All admin timestamps show in Montreal timezone (e.g., "Jan 16, 2026")
- [ ] All customer dashboard timestamps show in Montreal timezone
- [ ] "Reset to Pending" button visible only when status is Ready
- [ ] "Mark as Delivered" button visible only when status is Ready
- [ ] Both buttons show confirmation dialog before action
- [ ] Status correctly updates after reset
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test failures due to locale change | Low | Update test expectations to match new locale |
| User confusion about two similar buttons | Low | Clear button labels and confirmation messages |

---

## Open Questions

- [x] ~~Should we track delivery history?~~ → No, just reset status
- [x] ~~Manual or automatic reset?~~ → Manual only
- [x] ~~User's timezone?~~ → Montreal, Quebec (America/Toronto)
