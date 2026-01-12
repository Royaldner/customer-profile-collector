-- Migration 007: Add first_name + last_name to addresses, add 'cop' delivery method
-- This migration adds recipient names to delivery addresses and a new delivery method

-- Step 1: Add name columns to addresses table
ALTER TABLE addresses ADD COLUMN first_name VARCHAR(100);
ALTER TABLE addresses ADD COLUMN last_name VARCHAR(100);

-- Step 2: Migrate existing addresses - copy customer names as default
UPDATE addresses a SET
  first_name = c.first_name,
  last_name = c.last_name
FROM customers c
WHERE a.customer_id = c.id;

-- Step 3: Make address name columns NOT NULL after data migration
ALTER TABLE addresses ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE addresses ALTER COLUMN last_name SET NOT NULL;

-- Step 4: Update delivery_method constraint to include 'cop' (Cash on Pickup)
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_delivery_method_check;
ALTER TABLE customers ADD CONSTRAINT customers_delivery_method_check
  CHECK (delivery_method IN ('pickup', 'delivered', 'cod', 'cop'));
