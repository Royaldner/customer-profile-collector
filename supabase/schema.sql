-- Customer Profile Collector - Complete Database Schema
-- Run this entire script in Supabase SQL Editor to set up the database
--
-- Includes:
-- 1. Tables (customers, addresses, couriers)
-- 2. Indexes
-- 3. Triggers for auto-updating timestamps
-- 4. Row Level Security policies

-- =============================================
-- COURIERS TABLE (Reference table for delivery couriers)
-- =============================================
CREATE TABLE couriers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial couriers
INSERT INTO couriers (code, name) VALUES
  ('lbc', 'LBC'),
  ('jrs', 'JRS');

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  contact_preference VARCHAR(20) NOT NULL CHECK (contact_preference IN ('email', 'phone', 'sms')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_method VARCHAR(20) NOT NULL DEFAULT 'delivered' CHECK (delivery_method IN ('pickup', 'delivered', 'cod', 'cop')),
  courier VARCHAR(50) REFERENCES couriers(code),
  -- Profile address (optional)
  profile_street_address VARCHAR(500),
  profile_barangay VARCHAR(255),
  profile_city VARCHAR(255),
  profile_province VARCHAR(255),
  profile_region VARCHAR(100),
  profile_postal_code VARCHAR(4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADDRESSES TABLE (Philippine Address Format)
-- =============================================
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  street_address VARCHAR(500) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  postal_code VARCHAR(4) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Customer indexes for common queries
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_first_name ON customers(first_name);
CREATE INDEX idx_customers_last_name ON customers(last_name);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_delivery_method ON customers(delivery_method);
CREATE INDEX idx_customers_courier ON customers(courier);

-- Address indexes
CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);

-- Partial unique index: ensures only ONE default address per customer
CREATE UNIQUE INDEX idx_one_default_address
ON addresses(customer_id)
WHERE is_default = TRUE;

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for customers table
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for addresses table
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for couriers table
CREATE TRIGGER update_couriers_updated_at
  BEFORE UPDATE ON couriers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Customers policies (public access for Phase 1)
CREATE POLICY "Allow public insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON customers FOR DELETE USING (true);

-- Addresses policies (public access for Phase 1)
CREATE POLICY "Allow public insert" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON addresses FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON addresses FOR DELETE USING (true);

-- Couriers RLS
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;

-- Anyone can read active couriers (for form dropdowns)
CREATE POLICY "Anyone can view active couriers"
  ON couriers FOR SELECT
  USING (is_active = TRUE);
