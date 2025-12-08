-- Customer Profile Collector - Complete Database Schema
-- Run this entire script in Supabase SQL Editor to set up the database
--
-- Includes:
-- 1. Tables (customers, addresses)
-- 2. Indexes
-- 3. Triggers for auto-updating timestamps
-- 4. Row Level Security policies

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  contact_preference VARCHAR(20) NOT NULL CHECK (contact_preference IN ('email', 'phone', 'sms')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADDRESSES TABLE
-- =============================================
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  street_address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'USA',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Customer indexes for common queries
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);

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
