-- Customer Profile Collector - Row Level Security
-- Migration: 002_enable_rls
-- Description: Enable RLS and create public access policies
-- Note: These are permissive policies for Phase 1. Tighten with auth in future phases.

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CUSTOMERS TABLE POLICIES
-- =============================================

-- Allow public insert (for customer registration form)
CREATE POLICY "Allow public insert"
ON customers
FOR INSERT
WITH CHECK (true);

-- Allow public read (for admin dashboard)
CREATE POLICY "Allow public read"
ON customers
FOR SELECT
USING (true);

-- Allow public update (for admin edit functionality)
CREATE POLICY "Allow public update"
ON customers
FOR UPDATE
USING (true);

-- Allow public delete (for admin delete functionality)
CREATE POLICY "Allow public delete"
ON customers
FOR DELETE
USING (true);

-- =============================================
-- ADDRESSES TABLE POLICIES
-- =============================================

-- Allow public insert (for customer registration form)
CREATE POLICY "Allow public insert"
ON addresses
FOR INSERT
WITH CHECK (true);

-- Allow public read (for admin dashboard)
CREATE POLICY "Allow public read"
ON addresses
FOR SELECT
USING (true);

-- Allow public update (for admin edit functionality)
CREATE POLICY "Allow public update"
ON addresses
FOR UPDATE
USING (true);

-- Allow public delete (for admin delete functionality)
CREATE POLICY "Allow public delete"
ON addresses
FOR DELETE
USING (true);
