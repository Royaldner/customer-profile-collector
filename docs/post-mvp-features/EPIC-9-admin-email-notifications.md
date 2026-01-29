# EPIC-9: Admin Email Notifications

**Status:** Draft
**Created:** 2026-01-14
**Branch:** `feature/admin-email-notifications`

## Problem Statement

Admins need a way to notify customers about upcoming order arrivals, requesting them to settle balances and confirm their delivery details. Currently, there's no in-app communication system, forcing admins to manually email customers outside the platform.

## Goals

- [ ] Enable admins to send email notifications to single or multiple customers
- [ ] Provide reusable email templates with variable substitution
- [ ] Allow scheduled email sending (not just immediate)
- [ ] Track all sent emails for audit/history purposes
- [ ] Implement one-click customer confirmation (no login required)
- [ ] Display "Ready to Ship" status based on customer response

## Non-Goals (Out of Scope)

- Customer-initiated emails (reply functionality)
- Rich text/WYSIWYG editor (using predefined templates instead)
- Email analytics (open rates, click tracking)
- Unsubscribe/opt-out functionality
- Custom domain email sender (using Resend default)
- SMS notifications

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Admin can create, edit, delete email templates | Must |
| R2 | Admin can send email to a single customer from detail page | Must |
| R3 | Admin can select multiple customers via checkboxes and send bulk email | Must |
| R4 | Admin can schedule emails for future delivery | Must |
| R5 | System blocks sending if daily limit (100) would be exceeded | Must |
| R6 | All sent emails are logged with recipient, content, timestamp, status | Must |
| R7 | Emails include one-click confirmation link (no login required) | Must |
| R8 | Customer clicking confirmation updates `delivery_confirmed_at` timestamp | Must |
| R9 | Admin sees "Ready to Ship" indicator on customer list and detail page | Must |
| R10 | Default "Pre-Delivery Reminder" template seeded on first deploy | Should |
| R11 | Template variables auto-replaced: `{{first_name}}`, `{{last_name}}`, `{{email}}` | Must |
| R12 | Admin can view email history/logs with filtering | Should |

### Non-Functional

- **Performance:** Bulk email sending should handle up to 100 recipients without timeout
- **Security:** Confirmation tokens must be cryptographically secure and single-use
- **Reliability:** Failed emails should be logged with error details for retry

---

## Technical Design

### Database Changes

#### Migration 008: Email Notifications Tables

```sql
-- Migration 008: Email notifications feature
-- Creates tables for email templates, logs, and confirmation tokens

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default template
INSERT INTO email_templates (name, display_name, subject, body, variables) VALUES
(
  'pre-delivery-reminder',
  'Pre-Delivery Reminder',
  'Your Canada Goodies Order is Arriving Soon!',
  E'Dear {{first_name}},\n\nGreat news! Your order from Canada Goodies Inc is scheduled to arrive in approximately 2 weeks.\n\nTo ensure a smooth delivery, please take a moment to complete the following:\n\n1. SETTLE YOUR BALANCE\n   Please ensure any outstanding balance is paid before your order ships.\n\n2. VERIFY YOUR DELIVERY DETAILS\n   Please confirm that your delivery method and address are up to date.\n   If you need to make changes, log in to your account and update your profile.\n\n   {{update_profile_link}}\n\nIf everything is already correct, simply click the button below:\n\n   {{confirm_button}}\n\nThank you for choosing Canada Goodies Inc. We appreciate your business!\n\nBest regards,\nThe Canada Goodies Inc Team',
  '["first_name", "last_name", "email", "update_profile_link", "confirm_button"]'
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access (no public policy needed)
-- RLS will block all access; API routes handle admin check

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT email_logs_status_check CHECK (status IN ('pending', 'scheduled', 'sent', 'failed'))
);

-- Indexes for common queries
CREATE INDEX idx_email_logs_customer ON email_logs(customer_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_scheduled ON email_logs(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CONFIRMATION TOKENS TABLE
-- ============================================
CREATE TABLE confirmation_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX idx_confirmation_tokens_token ON confirmation_tokens(token);
CREATE INDEX idx_confirmation_tokens_customer ON confirmation_tokens(customer_id);

-- Enable RLS
ALTER TABLE confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADD CONFIRMATION TIMESTAMP TO CUSTOMERS
-- ============================================
ALTER TABLE customers ADD COLUMN delivery_confirmed_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_customers_delivery_confirmed ON customers(delivery_confirmed_at);
```

### API Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email-templates` | List all email templates |
| POST | `/api/admin/email-templates` | Create new template |
| GET | `/api/admin/email-templates/[id]` | Get single template |
| PUT | `/api/admin/email-templates/[id]` | Update template |
| DELETE | `/api/admin/email-templates/[id]` | Soft-delete template |
| POST | `/api/admin/send-email` | Send email to one or more customers |
| GET | `/api/admin/email-logs` | List sent emails with filtering |
| GET | `/api/admin/email-logs/daily-count` | Get today's sent email count |
| GET | `/api/confirm/[token]` | Public: Confirm delivery details |

### Component Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/types/index.ts` | Modify | Add `EmailTemplate`, `EmailLog`, `ConfirmationToken` types |
| `src/lib/validations/email.ts` | Create | Zod schemas for email templates and sending |
| `src/lib/services/resend.ts` | Create | Resend email service wrapper |
| `src/app/api/admin/email-templates/route.ts` | Create | Templates CRUD API |
| `src/app/api/admin/email-templates/[id]/route.ts` | Create | Single template API |
| `src/app/api/admin/send-email/route.ts` | Create | Send email API with rate limiting |
| `src/app/api/admin/email-logs/route.ts` | Create | Email logs API |
| `src/app/api/admin/email-logs/daily-count/route.ts` | Create | Daily count API |
| `src/app/api/confirm/[token]/route.ts` | Create | Public confirmation handler |
| `src/app/admin/email-templates/page.tsx` | Create | Templates management page |
| `src/app/admin/email-logs/page.tsx` | Create | Email history page |
| `src/app/confirm/[token]/page.tsx` | Create | Confirmation success page |
| `src/components/admin/email-template-list.tsx` | Create | Template list with CRUD |
| `src/components/admin/email-template-form-dialog.tsx` | Create | Template add/edit dialog |
| `src/components/admin/send-email-dialog.tsx` | Create | Send email dialog |
| `src/components/admin/email-log-list.tsx` | Create | Email history table |
| `src/components/admin/customer-list.tsx` | Modify | Add checkboxes, bulk select, "Ready to Ship" column |
| `src/app/admin/customers/[id]/page.tsx` | Modify | Add "Send Email" button, "Ready to Ship" indicator |

### Dependencies

- **Resend SDK:** `npm install resend` - Email sending service
- **crypto:** Built-in Node.js module for token generation

---

## User Experience

### Admin Flow: Send Single Email

1. Admin navigates to `/admin/customers/[id]` (customer detail page)
2. Sees "Ready to Ship" status indicator
3. Clicks "Send Email" button
4. Dialog opens with template selection
5. Admin selects template, optionally schedules
6. Admin clicks "Send" (or "Schedule")
7. Email sent, toast notification confirms
8. Email logged in history

### Admin Flow: Send Bulk Email

1. Admin navigates to `/admin` (customer list)
2. Sees "Ready to Ship" column for each customer
3. Checks boxes next to customers to email
4. Clicks "Send Email to Selected (X)"
5. Warning shown if X > 100 (daily limit)
6. If X > 100, button disabled with message
7. Dialog opens with template selection and count
8. Admin selects template, optionally schedules
9. Admin clicks "Send to X Customers"
10. Emails sent, progress shown
11. Toast confirms completion

### Customer Flow: Confirm Details

1. Customer receives "Pre-Delivery Reminder" email
2. Reviews order information
3. If details are correct, clicks "Everything is Up to Date" button
4. Browser opens confirmation page (no login)
5. System records `delivery_confirmed_at` timestamp
6. Customer sees "Thank you" confirmation page
7. Admin sees updated "Ready to Ship" status

### UI Changes

**Customer List (`/admin`):**
- New column: "Ready to Ship" with status badge
- Checkboxes on each row for bulk selection
- "Select All" checkbox in header
- "Send Email to Selected (X)" button appears when selections made

**Customer Detail (`/admin/customers/[id]`):**
- "Ready to Ship" status badge near header
- "Send Email" button in actions area
- Shows last email sent date if applicable

**New Pages:**
- `/admin/email-templates` - Template management
- `/admin/email-logs` - Email history with filtering
- `/confirm/[token]` - Customer confirmation page (public)

---

## Implementation Plan

### Tasks

| ID | Task | Estimate | Description |
|----|------|----------|-------------|
| CP-62 | Database migration | S | Create tables and seed default template |
| CP-63 | Types and validation | S | Add TypeScript types and Zod schemas |
| CP-64 | Resend service | M | Create email service wrapper with rate limiting |
| CP-65 | Email templates API | M | CRUD endpoints for templates |
| CP-66 | Send email API | M | Bulk send with token generation |
| CP-67 | Confirmation API | S | Token validation and customer update |
| CP-68 | Email logs API | S | History endpoints with filtering |
| CP-69 | Templates admin page | M | UI for template management |
| CP-70 | Email logs admin page | M | UI for email history |
| CP-71 | Customer list update | M | Checkboxes, bulk select, Ready to Ship column |
| CP-72 | Customer detail update | S | Send email button, Ready to Ship indicator |
| CP-73 | Confirmation page | S | Customer-facing thank you page |
| CP-74 | Scheduled email cron | M | Vercel cron to process scheduled emails |
| CP-75 | Testing | M | Unit and integration tests |

### Phases

**Phase 1: Foundation (CP-62 to CP-64)**
- Database migration
- TypeScript types and validation
- Resend service setup

**Phase 2: API Layer (CP-65 to CP-68)**
- Email templates CRUD
- Send email endpoint
- Confirmation endpoint
- Email logs endpoint

**Phase 3: Admin UI (CP-69 to CP-72)**
- Templates management page
- Email history page
- Customer list enhancements
- Customer detail enhancements

**Phase 4: Customer & Scheduling (CP-73 to CP-74)**
- Confirmation page
- Scheduled email processing

**Phase 5: Testing & Polish (CP-75)**
- Unit tests
- Integration tests
- Bug fixes

---

## Acceptance Criteria

- [ ] Admin can create, edit, and delete email templates
- [ ] Admin can send email to single customer from detail page
- [ ] Admin can bulk select customers and send email
- [ ] System warns and blocks if sending would exceed 100/day
- [ ] All sent emails appear in email logs
- [ ] Customer can confirm details via one-click link (no login)
- [ ] "Ready to Ship" indicator shows correct status based on email/confirmation
- [ ] Scheduled emails are processed at the correct time
- [ ] Default "Pre-Delivery Reminder" template works as designed
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Migrations run successfully in Supabase

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Resend API rate limits | Medium | Implement daily count check before send |
| Token security issues | High | Use crypto.randomBytes, single-use tokens, expiration |
| Bulk send timeout | Medium | Process in batches, show progress |
| Scheduled job failures | Medium | Log errors, retry mechanism |
| Email deliverability | Low | Using Resend's managed infrastructure |

---

## Open Questions

- [x] Email service provider → **Resend**
- [x] Sender email → **onboarding@resend.dev (Resend default)**
- [x] Template types needed → **Pre-Delivery Reminder (default)**
- [x] Rate limiting behavior → **Warn and block if >100/day**
- [x] Confirmation behavior → **One-click, no login, updates timestamp**
- [x] Ready to Ship logic → **Based on action after email sent**

---

## Template: Pre-Delivery Reminder

**Name:** `pre-delivery-reminder`
**Display Name:** Pre-Delivery Reminder
**Subject:** Your Canada Goodies Order is Arriving Soon!

**Body:**
```
Dear {{first_name}},

Great news! Your order from Canada Goodies Inc is scheduled to arrive in approximately 2 weeks.

To ensure a smooth delivery, please take a moment to complete the following:

1. SETTLE YOUR BALANCE
   Please ensure any outstanding balance is paid before your order ships.

2. VERIFY YOUR DELIVERY DETAILS
   Please confirm that your delivery method and address are up to date.
   If you need to make changes, log in to your account and update your profile.

   {{update_profile_link}}

If everything is already correct, simply click the button below:

   {{confirm_button}}

Thank you for choosing Canada Goodies Inc. We appreciate your business!

Best regards,
The Canada Goodies Inc Team
```

**Variables:**
- `{{first_name}}` - Customer's first name
- `{{last_name}}` - Customer's last name
- `{{email}}` - Customer's email
- `{{update_profile_link}}` - Link to customer dashboard
- `{{confirm_button}}` - "Everything is Up to Date" button with token link

---

## Related Documentation

- [Resend Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
