-- Migration 006: Split name into first_name + last_name, add profile address columns
-- This migration modifies the customers table structure

-- Step 1: Add new name columns
ALTER TABLE customers ADD COLUMN first_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN last_name VARCHAR(100);

-- Step 2: Migrate existing data (split name on first space)
UPDATE customers SET
  first_name = CASE
    WHEN position(' ' in name) > 0 THEN left(name, position(' ' in name) - 1)
    ELSE name
  END,
  last_name = CASE
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END;

-- Step 3: Make name columns NOT NULL after data migration
ALTER TABLE customers ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE customers ALTER COLUMN last_name SET NOT NULL;

-- Step 4: Drop old name column
ALTER TABLE customers DROP COLUMN name;

-- Step 5: Add profile address columns (all optional - customer may not have a profile address)
ALTER TABLE customers ADD COLUMN profile_street_address VARCHAR(500);
ALTER TABLE customers ADD COLUMN profile_barangay VARCHAR(255);
ALTER TABLE customers ADD COLUMN profile_city VARCHAR(255);
ALTER TABLE customers ADD COLUMN profile_province VARCHAR(255);
ALTER TABLE customers ADD COLUMN profile_region VARCHAR(100);
ALTER TABLE customers ADD COLUMN profile_postal_code VARCHAR(4);

-- Step 6: Create index on name columns for search
CREATE INDEX idx_customers_first_name ON customers(first_name);
CREATE INDEX idx_customers_last_name ON customers(last_name);

-- Step 7: Drop old name index if it exists
DROP INDEX IF EXISTS idx_customers_name;
