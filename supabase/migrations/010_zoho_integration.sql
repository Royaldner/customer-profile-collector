-- Migration 010: Zoho Books Integration
-- Purpose: Enable linking customers to Zoho Books contacts and caching API responses

-- Add zoho_contact_id column to customers table
ALTER TABLE customers ADD COLUMN zoho_contact_id VARCHAR(50);

-- Create index for faster lookups by Zoho contact
CREATE INDEX idx_customers_zoho_contact_id ON customers(zoho_contact_id);

-- Create zoho_tokens table (singleton row for OAuth tokens)
CREATE TABLE zoho_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zoho_cache table for API response caching
CREATE TABLE zoho_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cache table
CREATE INDEX idx_zoho_cache_key ON zoho_cache(cache_key);
CREATE INDEX idx_zoho_cache_expires ON zoho_cache(expires_at);

-- Enable RLS on new tables
ALTER TABLE zoho_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zoho_tokens
-- Only service role can access tokens (no public access)
-- This is enforced by having NO policies - default deny
-- Service role bypasses RLS automatically

-- RLS Policies for zoho_cache
-- Cache readable by authenticated users (for customer dashboard)
CREATE POLICY "Cache read for authenticated"
    ON zoho_cache FOR SELECT
    TO authenticated
    USING (true);

-- Cache writable by service role only (default - no insert/update/delete policies)
-- Service role bypasses RLS for writes

-- Anon can read cache (for admin routes using anon key with admin session)
CREATE POLICY "Cache read for anon"
    ON zoho_cache FOR SELECT
    TO anon
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE zoho_tokens IS 'Stores Zoho Books OAuth tokens (singleton row)';
COMMENT ON COLUMN zoho_tokens.access_token IS 'Current access token, refreshed automatically when expired';
COMMENT ON COLUMN zoho_tokens.refresh_token IS 'Long-lived refresh token for obtaining new access tokens';
COMMENT ON COLUMN zoho_tokens.expires_at IS 'When the current access token expires';

COMMENT ON TABLE zoho_cache IS 'Caches Zoho Books API responses to reduce API calls';
COMMENT ON COLUMN zoho_cache.cache_key IS 'Unique key for cached data, e.g., invoices:{contact_id}:{status}';
COMMENT ON COLUMN zoho_cache.data IS 'Cached JSON response from Zoho API';
COMMENT ON COLUMN zoho_cache.expires_at IS 'When this cache entry should be considered stale';

COMMENT ON COLUMN customers.zoho_contact_id IS 'Links customer to Zoho Books contact for invoice lookup';
