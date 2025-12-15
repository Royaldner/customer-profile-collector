-- Migration 004: RLS Policies for Customer Authentication
-- Phase 7: Customer UX Enhancement
-- Adds policies for authenticated customers to access their own data

-- Customers can read their own profile (via user_id link)
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Customers can update their own profile
CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Addresses: customers can manage their own addresses
CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );
