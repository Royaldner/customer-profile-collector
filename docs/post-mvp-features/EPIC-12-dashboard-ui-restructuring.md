# EPIC-12: Customer Dashboard UI Restructuring

**Status:** Draft
**Created:** 2026-01-26
**Branch:** `feature/dashboard-ui-restructure`

## Problem Statement

The customer dashboard (`src/app/customer/dashboard/page.tsx`) has grown to 1,286 lines with all features crammed into a single scrolling page. With the addition of Zoho Orders integration (EPIC 11), the page now displays too much information at once, overwhelming users and making it difficult to focus on primary actions (viewing orders, managing delivery).

## Goals

- [ ] Streamline main dashboard view to focus on frequently-used content
- [ ] Move secondary content (profile settings, account management, address management) to a slide-out drawer
- [ ] Show only default address on main dashboard for quick reference
- [ ] Extract components to reduce main page from 1,286 lines to under 300 lines
- [ ] Improve mobile UX with hamburger menu pattern
- [ ] Maintain all existing functionality

## Non-Goals (Out of Scope)

- Separate route pages (keeping everything accessible from single dashboard)
- Redesign of orders display (CustomerOrdersSection remains unchanged)
- Backend/API changes
- New features or functionality

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Main dashboard shows: Greeting, Orders, Delivery Preference, Default Address only | Must |
| R2 | Hamburger menu icon in header opens slide-out drawer from right | Must |
| R3 | Drawer contains: Personal Information, Delivery Addresses, Account Info, Danger Zone, Sign Out | Must |
| R4 | All edit functionality preserved (profile, delivery, addresses) | Must |
| R5 | Drawer sections are collapsible/expandable | Should |
| R6 | Profile editing happens within the drawer | Must |
| R7 | Address CRUD (add/edit/delete) happens within the drawer | Must |
| R8 | Default address on main view has edit button that opens drawer to Addresses section | Must |

### Non-Functional

- **Performance**: No additional API calls, state management unchanged
- **Accessibility**: Drawer properly traps focus, escape key closes
- **Mobile**: Works seamlessly on mobile devices
- **Code Quality**: Each component under 300 lines

---

## Technical Design

### Database Changes

None required.

### API Changes

None required.

### Component Architecture

**Current Structure:**
```
dashboard/page.tsx (1,286 lines)
├── Personal Information (inline)
├── Delivery Preference (inline)
├── Delivery Addresses (inline)
├── Account Info (inline)
├── Danger Zone (inline)
├── CustomerOrdersSection (component)
└── Address Dialog (inline)
```

**New Structure:**
```
dashboard/page.tsx (~250 lines)
├── DashboardHeader (new component)
├── CustomerOrdersSection (existing)
├── DeliveryPreferenceCard (new component)
├── DefaultAddressCard (new component) ← Shows only default address
├── SettingsDrawer (new component)
│   ├── PersonalInfoSection (collapsible)
│   ├── DeliveryAddressesSection (collapsible) ← Full address CRUD here
│   ├── AccountSection (collapsible)
│   └── DangerZoneSection (collapsible)
└── AddressDialog (used within drawer)
```

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/ui/sheet.tsx` | Create | Install via `npx shadcn@latest add sheet` |
| `src/components/ui/collapsible.tsx` | Create | Install via `npx shadcn@latest add collapsible` |
| `src/components/customer/dashboard-header.tsx` | Create | Header with greeting + hamburger menu button |
| `src/components/customer/settings-drawer.tsx` | Create | Slide-out drawer with profile/addresses/account/danger zone |
| `src/components/customer/delivery-preference-card.tsx` | Create | Delivery method + courier selection card |
| `src/components/customer/default-address-card.tsx` | Create | Shows only default address with edit button |
| `src/app/customer/dashboard/page.tsx` | Modify | Refactor to use new components |

### Dependencies

- shadcn/ui Sheet component (needs installation)
- shadcn/ui Collapsible component (needs installation)

---

## User Experience

### Main Dashboard Layout

```
┌─────────────────────────────────────┐
│  Good Morning, Juan!            ☰  │  ← Hamburger opens drawer
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  My Orders                    │  │
│  │  [Recent] [Completed] [↻]     │  │
│  │                               │  │
│  │  Order cards from Zoho...     │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Delivery Preference      ✏️  │  │
│  │  [Delivery] • LBC             │  │
│  │  ─────────────────────────    │  │
│  │  (edit mode: radio cards)     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Default Address          ✏️  │  │  ← Only shows default
│  │  Home                         │  │
│  │  Juan Dela Cruz               │  │
│  │  123 Main St, Brgy San Jose   │  │
│  │  Manila 1000                  │  │
│  │                               │  │
│  │  [Manage Addresses →]         │  │  ← Opens drawer
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Settings Drawer (slides from right)

```
┌────────────────────────────┐
│  Settings              ✕   │
├────────────────────────────┤
│                            │
│  ▼ Personal Information    │  ← Collapsible
│  ┌──────────────────────┐  │
│  │ Name: Juan Dela Cruz │  │
│  │ Email: juan@mail.com │  │
│  │ Phone: +63...        │  │
│  │ Contact: Email       │  │
│  │ Profile Address:...  │  │
│  │                      │  │
│  │ [Edit]               │  │
│  └──────────────────────┘  │
│                            │
│  ▼ Delivery Addresses      │  ← Full address management
│  ┌──────────────────────┐  │
│  │ Home (Default)   ★✏🗑│  │
│  │ Juan Dela Cruz       │  │
│  │ 123 Main St...       │  │
│  ├──────────────────────┤  │
│  │ Work             ✏🗑│  │
│  │ Juan Dela Cruz       │  │
│  │ 456 Office Blvd...   │  │
│  ├──────────────────────┤  │
│  │ [+ Add Address]      │  │
│  └──────────────────────┘  │
│                            │
│  ▶ Account                 │  ← Collapsed
│                            │
│  ────────────────────────  │
│                            │
│  ▶ Danger Zone             │  ← Collapsed
│                            │
│  ────────────────────────  │
│                            │
│  [Sign Out]                │
│                            │
└────────────────────────────┘
```

### User Flows

**Editing Personal Information:**
1. User clicks hamburger menu (☰)
2. Drawer slides in from right
3. User expands "Personal Information" section
4. User clicks "Edit" button
5. Fields become editable
6. User makes changes, clicks "Save"
7. Success toast, fields return to view mode

**Managing Delivery Preference (unchanged from main view):**
1. User clicks pencil icon on Delivery Preference card
2. Card expands to show edit form with radio cards
3. User selects delivery method and courier
4. User clicks "Save Changes"

**Managing Addresses:**
1. User clicks "Manage Addresses" on Default Address card (or hamburger menu)
2. Drawer opens with Delivery Addresses section expanded
3. User can add/edit/delete addresses
4. User clicks address edit icon → Address dialog modal opens
5. User fills form, clicks "Save Address"
6. Dialog closes, address list updates in drawer
7. If default address changed, main dashboard card updates too

---

## Implementation Plan

### Tasks

| ID | Task | Estimate |
|----|------|----------|
| CP-86 | Install shadcn Sheet and Collapsible components | S |
| CP-87 | Create DashboardHeader component | S |
| CP-88 | Create SettingsDrawer component with collapsible sections (Personal Info, Addresses, Account, Danger Zone) | L |
| CP-89 | Create DeliveryPreferenceCard component | M |
| CP-90 | Create DefaultAddressCard component (shows only default, with "Manage Addresses" link) | S |
| CP-91 | Refactor dashboard page to use new components | M |
| CP-92 | Test all functionality and mobile responsiveness | M |

### Phases

**Phase 1: Setup (CP-86)**
- Install shadcn Sheet component
- Install shadcn Collapsible component

**Phase 2: Extract Components (CP-87, CP-88, CP-89, CP-90)**
- Create DashboardHeader with hamburger menu
- Create SettingsDrawer with Personal Info, Delivery Addresses, Account, Danger Zone
- Create DeliveryPreferenceCard with inline editing
- Create DefaultAddressCard showing only default address

**Phase 3: Integration (CP-91)**
- Refactor main dashboard page
- Wire up state and callbacks between components
- Remove extracted code from page

**Phase 4: Testing (CP-92)**
- Test all edit/save flows
- Test drawer open/close
- Test mobile responsiveness
- Test address dialog still works

---

## Acceptance Criteria

- [ ] Dashboard page is under 300 lines
- [ ] Main view shows only: greeting, orders, delivery pref, default address
- [ ] Hamburger menu opens drawer from right side
- [ ] Drawer contains Personal Info, Delivery Addresses, Account, Danger Zone, Sign Out
- [ ] All sections in drawer are collapsible
- [ ] Profile editing works within drawer
- [ ] Delivery preference editing works inline on main view
- [ ] Full address CRUD operations work in drawer (add/edit/delete/set default)
- [ ] Default address card on main view updates when default changes
- [ ] "Manage Addresses" link opens drawer to addresses section
- [ ] Address dialog still works as modal (within drawer context)
- [ ] Sign out button in drawer works
- [ ] Delete account in drawer works (with confirmation)
- [ ] All existing tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Mobile responsive (works on phone screen)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State management complexity across components | Medium | Pass callbacks down, keep state in parent page |
| Lost functionality during refactoring | Medium | Test each flow after extraction |
| Drawer UX unfamiliar to users | Low | Clear hamburger icon, obvious "Settings" header |

---

## Open Questions

- [x] ~~Tab layout vs drawer?~~ → Drawer with hamburger menu
- [x] ~~Where does profile editing happen?~~ → Inside the drawer
- [x] ~~Collapsible vs always-expanded sections?~~ → Collapsible
