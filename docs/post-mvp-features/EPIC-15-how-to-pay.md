# EPIC-15: How to Pay

**Status:** Draft
**Created:** 2026-02-02
**Branch:** `feature/how-to-pay`

## Problem Statement

Customers need clear payment instructions with QR codes and copiable account details to complete payments via GCash or BPI bank transfer. Currently, payment methods are listed on the landing page but no actionable payment info exists in the customer dashboard.

## Goals

- [ ] Add "How to Pay" menu item to the customer dashboard settings drawer
- [ ] Display GCash payment modal with QR code and copiable account number
- [ ] Display BPI payment modal with QR code and copiable account name + account number
- [ ] Provide smooth copy-to-clipboard with toast feedback
- [ ] Add "Pay Now" button on order cards that opens the same payment view with order-specific context (invoice number + amount)

## Non-Goals (Out of Scope)

- Payment processing or verification
- Payment status tracking
- Admin management of payment methods (hardcoded for now)
- Credit card payments

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | "How to Pay" item in settings menu between Account and Danger Zone | Must |
| R2 | Full-screen view with GCash and BPI options | Must |
| R3 | GCash modal: QR code image + copiable account number | Must |
| R4 | BPI modal: QR code image + copiable account name + account number | Must |
| R5 | Copy-to-clipboard with sonner toast confirmation and fallback | Must |
| R6 | Mobile responsive modals | Should |
| R7 | Graceful handling when QR images are missing | Should |
| R8 | "Pay Now" button on order cards (Recent tab, orders with balance > 0) | Must |
| R9 | Pay Now opens same payment view with additional copiable fields: Invoice Number + Amount | Must |
| R10 | Amount field shows balance value with "50% required upon order" note | Must |

### Non-Functional

- **Performance:** No API calls — all static content, instant load
- **Security:** No sensitive data (account info is intentionally public for payments)

---

## Technical Design

### Database Changes

None — this is a static UI feature.

### API Changes

None.

### New Files

| File | Description |
|------|-------------|
| `src/lib/constants/payment-methods.ts` | Payment method config: account details, instructions, QR image paths |
| `src/lib/utils/clipboard.ts` | Copy-to-clipboard utility with fallback |
| `src/components/customer/how-to-pay-view.tsx` | Full-screen view with GCash/BPI cards that trigger payment modals |
| `src/components/customer/payment-modal.tsx` | Reusable Dialog with QR image, instructions, copiable account fields + optional order context fields |

### Modified Files

| File | Description |
|------|-------------|
| `src/components/customer/settings-menu.tsx` | Add `'how-to-pay'` to `SettingsView` type, add menu item with `Wallet` icon |
| `src/components/customer/settings-view.tsx` | Add `'how-to-pay'` case rendering `HowToPayView` |
| `src/components/orders/order-card.tsx` | Add "Pay Now" button for orders with balance > 0 |

### Payment Config Structure

```typescript
// src/lib/constants/payment-methods.ts

export interface CopyableField {
  label: string    // e.g. "Account Number"
  value: string    // e.g. "09301697375"
  note?: string    // e.g. "50% required upon order" — displayed beside the field
}

export interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string              // lucide icon name
  qrImagePath: string       // path in /public
  instructions: string[]
  fields: CopyableField[]
}

// Optional order context passed from "Pay Now" button
export interface OrderPaymentContext {
  invoiceNumber: string
  amount: string            // formatted balance, e.g. "₱1,250.00"
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay via GCash',
    icon: 'Smartphone',
    qrImagePath: '/images/gcash-qr.png',
    instructions: [
      'Open GCash App',
      'Scan QR code or Click Send and copy the account number provided',
      'Add account details or Amount (for QR Code)',
      'Add in Notes the Invoice Number (Optional)',
      'Review and Confirm Transaction',
    ],
    fields: [
      { label: 'Account Number', value: '09301697375' },
    ],
  },
  {
    id: 'bpi',
    name: 'BPI',
    description: 'Bank transfer',
    icon: 'Landmark',
    qrImagePath: '/images/bpi-qr.png',
    instructions: [
      'Open Your Bank App or WebApp',
      'Select "Transfer Money" or "Move Money"',
      'Scan the QR Code or copy the account information provided',
      'Enter the amount to transfer',
      'Add in Notes the Invoice Number (Optional)',
      'Review and Confirm Transaction',
    ],
    fields: [
      { label: 'Account Name', value: 'Perpee Berse' },
      { label: 'Account Number', value: '9319317497' },
    ],
  },
]
```

### How to Pay View — Two Entry Points

The `HowToPayView` component accepts an optional `OrderPaymentContext` prop:

```typescript
interface HowToPayViewProps {
  onBack: () => void
  orderContext?: OrderPaymentContext  // present when opened from "Pay Now"
}
```

**When `orderContext` is provided:**
- The payment modal prepends two extra copiable fields above the account fields:
  1. **Invoice Number** — value from `orderContext.invoiceNumber`
  2. **Amount** — value from `orderContext.amount`, with note: *"50% required upon order"*
- The view title changes to: `"Pay for {invoiceNumber}"` instead of `"How to Pay"`

**When `orderContext` is absent (settings menu):**
- Standard behavior — only account fields shown, title is `"How to Pay"`

### Pay Now Button in OrderCard

The `OrderCard` component receives an optional `onPayNow` callback:

```typescript
interface OrderCardProps {
  order: OrderDisplay
  onPayNow?: (order: OrderDisplay) => void  // NEW
}
```

**Visibility rules:**
- Only shown when `order.balance > 0` (unpaid/partially paid orders)
- Only shown in the **Recent** tab (not Completed)
- Button text: `"Pay Now"`
- Placed in the card footer, below the due date

**When clicked:**
- Calls `onPayNow(order)` which triggers the parent to open `HowToPayView` with:
  ```typescript
  {
    invoiceNumber: order.invoiceNumber,
    amount: formatCurrency(order.balance)  // e.g. "₱1,250.00"
  }
  ```

### State Management in CustomerOrdersSection

The `CustomerOrdersSection` needs a state to toggle between the orders list and the How to Pay view:

```typescript
const [payingOrder, setPayingOrder] = useState<OrderPaymentContext | null>(null)
```

- When `payingOrder` is set, render `HowToPayView` with the order context instead of the orders list
- When the user taps back, set `payingOrder` to `null` to return to orders

### Payment Modal with Order Context

**Dialog layout when opened from Pay Now:**
```
┌──────────────────────────────┐
│  Pay with GCash          [X] │
│                               │
│  [QR Code Image]              │
│                               │
│  Instructions:                │
│  1. Open GCash app            │
│  2. Scan QR or send to:       │
│                               │
│  Invoice Number               │
│  ┌─────────────┐ [Copy]      │
│  │ INV-00042   │             │
│  └─────────────┘             │
│                               │
│  Amount                       │
│  ┌─────────────┐ [Copy]      │
│  │ ₱1,250.00   │  50%        │
│  └─────────────┘  required   │
│                    upon order │
│                               │
│  Account Number               │
│  ┌─────────────┐ [Copy]      │
│  │ 09301697375 │             │
│  └─────────────┘             │
└──────────────────────────────┘
```

The `note` field on `CopyableField` renders as muted text beside the copy row.

### Clipboard Fallback Strategy

The copy-to-clipboard utility must handle browsers where `navigator.clipboard` is unavailable (some mobile browsers, non-HTTPS contexts):

```typescript
// src/lib/utils/clipboard.ts
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback: hidden textarea + execCommand
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}
```

On failure, show an error toast: "Could not copy. Please copy manually."

### QR Image Handling

If a QR image file is missing, the modal should:
- Hide the image area (no broken image icon)
- Still show instructions and copiable fields
- Use Next.js `<Image>` with `onError` to detect missing files

### Dependencies

- User provides QR code images: `public/images/gcash-qr.png` and `public/images/bpi-qr.png`
- Existing: `sonner` for toast, `Dialog` from shadcn/ui, `lucide-react` for icons
- Existing: `OrderDisplay` type from `src/lib/types/zoho.ts` (has `invoiceNumber`, `balance`, `currencySymbol`)

### SettingsView Type Location

Verify where the `SettingsView` type is defined. If it lives in `settings-menu.tsx` and is imported by `settings-view.tsx`, the type update in CP-115 covers both files. If the type is defined elsewhere, update it at the source.

---

## User Experience

### User Flow A: Settings Menu (General Info)

1. Customer opens dashboard → taps hamburger menu
2. Settings drawer slides open → "How to Pay" menu item visible (between Account and Danger Zone)
3. Tap "How to Pay" → drawer closes, full-screen view opens with back arrow
4. Title: **"How to Pay"**
5. View shows two cards: GCash and BPI
6. Tap GCash card → Dialog opens with:
   - Payment instructions
   - GCash QR code image (if available)
   - Account number with copy button
7. Tap copy → number copied to clipboard, toast: "Account number copied!"
8. Close modal → back to How to Pay view
9. Tap BPI card → Dialog opens with:
   - Payment instructions
   - BPI QR code image (if available)
   - Account name with copy button
   - Account number with copy button
10. Back arrow returns to main dashboard

### User Flow B: Pay Now (Order-Specific)

1. Customer views Recent Orders tab
2. Order card for INV-00042 shows balance of ₱1,250.00
3. Customer taps **"Pay Now"** button on the card
4. Full-screen view opens with title: **"Pay for INV-00042"**
5. View shows two cards: GCash and BPI
6. Tap GCash card → Dialog opens with:
   - Payment instructions
   - GCash QR code image (if available)
   - **Invoice Number** with copy button → `INV-00042`
   - **Amount** with copy button → `₱1,250.00` + note: *"50% required upon order"*
   - Account number with copy button
7. Customer copies invoice number, amount, and account number
8. Back arrow returns to Recent Orders tab

### UI Layout

**Order Card with Pay Now Button:**
```
┌─────────────────────────────┐
│  INV-00042          Unpaid  │
│  January 15, 2026           │
│                             │
│  Widget A                   │
│  2 × ₱500.00    ₱1,000.00  │
│                             │
│  ─────────────────────────  │
│  Total           ₱1,250.00 │
│  Paid              ₱000.00 │
│  Balance         ₱1,250.00 │
│                             │
│  Due: February 15, 2026    │
│                             │
│  [ Pay Now ]                │
└─────────────────────────────┘
```

**How to Pay View (full-screen):**
```
← How to Pay                    ← Pay for INV-00042
  (from settings)                  (from Pay Now)

┌─────────────────────┐
│  📱 GCash            │
│  Pay via GCash       │
│                  >   │
└─────────────────────┘

┌─────────────────────┐
│  🏦 BPI              │
│  Bank transfer       │
│                  >   │
└─────────────────────┘
```

**Payment Modal — from Settings (no order context):**
```
┌──────────────────────────┐
│  Pay with GCash      [X] │
│                           │
│  [QR Code Image]          │
│                           │
│  Instructions:            │
│  1. Open GCash app        │
│  2. Scan QR or send to:   │
│                           │
│  Account Number           │
│  ┌─────────────┐ [Copy]  │
│  │ 09301697375 │         │
│  └─────────────┘         │
└──────────────────────────┘
```

**Payment Modal — from Pay Now (with order context):**
```
┌──────────────────────────────┐
│  Pay with GCash          [X] │
│                               │
│  [QR Code Image]              │
│                               │
│  Instructions:                │
│  1. Open GCash app            │
│  2. Scan QR or send to:       │
│                               │
│  Invoice Number               │
│  ┌─────────────┐ [Copy]      │
│  │ INV-00042   │             │
│  └─────────────┘             │
│                               │
│  Amount                       │
│  ┌─────────────┐ [Copy]      │
│  │ ₱1,250.00   │  50%        │
│  └─────────────┘  required   │
│                    upon order │
│                               │
│  Account Number               │
│  ┌─────────────┐ [Copy]      │
│  │ 09301697375 │             │
│  └─────────────┘             │
└──────────────────────────────┘
```

---

## Implementation Plan

### Tasks

| ID | Task | Size |
|----|------|------|
| CP-113 | Create `src/lib/constants/payment-methods.ts` + `src/lib/utils/clipboard.ts` | XS |
| CP-114 | Create `payment-modal.tsx` — reusable Dialog with QR, instructions, copy fields, optional order context fields with `note` support | S |
| CP-115 | Create `how-to-pay-view.tsx` — full-screen view accepting optional `OrderPaymentContext` prop | S |
| CP-116 | Update `settings-menu.tsx` + `settings-view.tsx` — add menu item, type, and view case | S |
| CP-117 | Add "Pay Now" button to `order-card.tsx` + wire up state in `customer-orders-section.tsx` | S |
| CP-118 | Add tests for clipboard utility, payment modal, and Pay Now integration | S |

### Implementation Order

1. **CP-113:** Payment config + clipboard utility (no dependencies)
2. **CP-114:** Payment modal (depends on CP-113)
3. **CP-115:** How to Pay view (depends on CP-114)
4. **CP-116:** Settings integration (depends on CP-115)
5. **CP-117:** Pay Now button + orders section wiring (depends on CP-115)
6. **CP-118:** Tests (after all components exist)

Note: CP-116 and CP-117 are independent of each other and can be done in parallel.

---

## Testing

### Unit Tests

| Test | Description |
|------|-------------|
| Copy utility — success | Mock `navigator.clipboard.writeText` resolving, verify returns `true` |
| Copy utility — fallback | Mock clipboard API throwing, verify `execCommand` fallback runs |
| Copy utility — full failure | Both methods fail, verify returns `false` |
| Payment modal — renders fields | Given a payment method config, verify all `CopyableField` labels/values render |
| Payment modal — renders order context fields | Pass `orderContext`, verify Invoice Number and Amount fields appear above account fields |
| Payment modal — renders note on amount field | Verify "50% required upon order" text renders beside amount |
| Payment modal — copy button triggers toast | Click copy button, verify sonner toast appears |
| Payment modal — missing QR image | Set `onError`, verify image area hidden gracefully |
| How to Pay view — renders all methods | Verify one card per entry in `PAYMENT_METHODS` |
| How to Pay view — title with order context | Pass `orderContext`, verify title shows "Pay for INV-XXX" |
| How to Pay view — title without context | No `orderContext`, verify title shows "How to Pay" |
| Order card — Pay Now visible when balance > 0 | Render card with balance, verify button present |
| Order card — Pay Now hidden when balance = 0 | Render paid order, verify button absent |
| Order card — Pay Now calls onPayNow | Click button, verify callback with order data |

---

## Acceptance Criteria

- [ ] "How to Pay" appears in settings menu between Account and Danger Zone
- [ ] Clicking opens full-screen view with GCash and BPI cards
- [ ] GCash card opens modal with QR code + copiable account number
- [ ] BPI card opens modal with QR code + copiable account name + account number
- [ ] Copy buttons work and show toast confirmation
- [ ] Copy fallback works when clipboard API is unavailable
- [ ] Missing QR images degrade gracefully (no broken image icons)
- [ ] Modals are mobile responsive
- [ ] "Pay Now" button appears on order cards with balance > 0 in Recent tab
- [ ] "Pay Now" opens payment view with title "Pay for {invoiceNumber}"
- [ ] Payment modal from Pay Now shows copiable Invoice Number and Amount fields
- [ ] Amount field displays "50% required upon order" note
- [ ] Back arrow from Pay Now returns to Recent Orders (not main dashboard)
- [ ] No TypeScript errors
- [ ] Build passes
- [ ] Tests pass

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| QR images not provided yet | Low | Conditional rendering — modal works without images, user replaces files when ready |
| Account info changes | Low | Centralized in `payment-methods.ts` config, single place to update |
| Clipboard API unavailable on some mobile browsers | Medium | `execCommand('copy')` fallback + error toast on full failure |
| `SettingsView` type defined in unexpected location | Low | Verify type location before implementation; update at source |
| `CustomerOrdersSection` state complexity with pay view overlay | Low | Single `payingOrder` state toggle — null = orders list, set = pay view |

---

## Payment Details

### GCash
- **Account Number:** 09301697375
- **Instructions:**
  1. Open GCash App
  2. Scan QR code or Click Send and copy the account number provided
  3. Add account details or Amount(for QR Code)
  4. Add in Notes the Invoice Number (Optional)
  5. Review and Confirm Transaction

### BPI
- **Account Number:** 9319317497
- **Account Name:** Perpee Berse
- **Instructions:**
  1. Open Your Bank App or WebApp
  2. Select "Transfer Money" or "Move Money"
  3. Scan the QR Code or copy the account information provided
  4. Enter the amount to transfer
  5. Add in Notes the Invoice Number (Optional)
  6. Review and Confirm Transaction

### QR Code Images
- `public/images/gcash-qr.png` — user to provide
- `public/images/bpi-qr.png` — user to provide

---

## Open Questions

- [ ] Are the QR code image files ready to be placed in `public/images/`?
