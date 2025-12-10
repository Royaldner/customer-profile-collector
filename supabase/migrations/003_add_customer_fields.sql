-- Migration 003: Add user_id and delivery_method to customers table
-- Phase 7: Customer UX Enhancement

-- Add auth user link (optional, for customers who create accounts)
ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Add delivery method with default 'delivered' for existing customers
ALTER TABLE customers ADD COLUMN delivery_method VARCHAR(20) NOT NULL DEFAULT 'delivered'
  CHECK (delivery_method IN ('pickup', 'delivered', 'cod'));

-- Add index for delivery_method filtering
CREATE INDEX idx_customers_delivery_method ON customers(delivery_method);
