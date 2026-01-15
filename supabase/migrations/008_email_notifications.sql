-- Migration 008: Email Notifications Feature
-- Creates tables for email templates, logs, and confirmation tokens
-- Adds delivery_confirmed_at to customers table

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
