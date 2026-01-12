-- Migration 005: Add courier support
-- This migration adds a couriers reference table and links it to customers

-- Couriers reference table
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

-- Add courier column to customers (references courier code)
ALTER TABLE customers ADD COLUMN courier VARCHAR(50) REFERENCES couriers(code);
CREATE INDEX idx_customers_courier ON customers(courier);

-- Enable RLS for couriers table
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;

-- Anyone can read active couriers (for form dropdowns)
CREATE POLICY "Anyone can view active couriers"
  ON couriers FOR SELECT
  USING (is_active = TRUE);

-- Create trigger for updated_at on couriers table
CREATE TRIGGER update_couriers_updated_at
  BEFORE UPDATE ON couriers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
