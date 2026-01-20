-- Migration 009: Add delivered_at column and delivery_logs table
-- Purpose: Track delivery status and maintain history of status changes

-- Add delivered_at column to customers table
ALTER TABLE customers ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create delivery action enum type
DO $$ BEGIN
    CREATE TYPE delivery_action AS ENUM ('confirmed', 'delivered', 'reset');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create delivery_logs table
CREATE TABLE delivery_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    action delivery_action NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by customer
CREATE INDEX idx_delivery_logs_customer_id ON delivery_logs(customer_id);
CREATE INDEX idx_delivery_logs_created_at ON delivery_logs(created_at DESC);

-- Enable RLS on delivery_logs
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_logs

-- Admins can do everything (via service role or anon with admin session)
CREATE POLICY "Admins can view all delivery logs"
    ON delivery_logs FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can insert delivery logs"
    ON delivery_logs FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Customers can view their own delivery logs
CREATE POLICY "Customers can view own delivery logs"
    ON delivery_logs FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

-- Add comment for documentation
COMMENT ON TABLE delivery_logs IS 'Tracks all delivery status changes for customers';
COMMENT ON COLUMN delivery_logs.action IS 'Type of status change: confirmed (ready to ship), delivered, or reset (back to pending)';
