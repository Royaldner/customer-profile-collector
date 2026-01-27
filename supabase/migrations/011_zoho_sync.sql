-- Migration 011: Zoho Auto-Sync
-- Purpose: Enable automatic sync of customers to Zoho Books contacts

-- ============================================
-- CUSTOMER TABLE UPDATES
-- ============================================

-- Customer type (new vs returning)
ALTER TABLE customers ADD COLUMN is_returning_customer BOOLEAN DEFAULT FALSE;

-- Sync tracking columns
ALTER TABLE customers ADD COLUMN zoho_sync_status VARCHAR(20) DEFAULT 'pending'
  CHECK (zoho_sync_status IN ('pending', 'syncing', 'synced', 'failed', 'skipped', 'manual'));
ALTER TABLE customers ADD COLUMN zoho_sync_error TEXT;
ALTER TABLE customers ADD COLUMN zoho_sync_attempts INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN zoho_last_sync_at TIMESTAMP WITH TIME ZONE;

-- Index for finding customers by sync status
CREATE INDEX idx_customers_zoho_sync_status ON customers(zoho_sync_status);

-- ============================================
-- SYNC QUEUE TABLE
-- ============================================

-- Sync queue table for background processing
CREATE TABLE zoho_sync_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'match', 'retry')),
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for efficient queue processing
CREATE INDEX idx_zoho_sync_queue_pending ON zoho_sync_queue(scheduled_for)
  WHERE processed_at IS NULL;
CREATE INDEX idx_zoho_sync_queue_customer ON zoho_sync_queue(customer_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on sync queue (service role only - no policies = service role access only)
ALTER TABLE zoho_sync_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN customers.is_returning_customer IS 'Whether customer indicated they have ordered before (for Zoho matching)';
COMMENT ON COLUMN customers.zoho_sync_status IS 'Status of Zoho Books sync: pending, syncing, synced, failed, skipped, manual';
COMMENT ON COLUMN customers.zoho_sync_error IS 'Last error message from sync attempt';
COMMENT ON COLUMN customers.zoho_sync_attempts IS 'Number of sync attempts made';
COMMENT ON COLUMN customers.zoho_last_sync_at IS 'Timestamp of last sync attempt';

COMMENT ON TABLE zoho_sync_queue IS 'Queue for background Zoho Books sync processing';
COMMENT ON COLUMN zoho_sync_queue.action IS 'Sync action: create (new customer), match (returning), retry (failed attempt)';
COMMENT ON COLUMN zoho_sync_queue.priority IS 'Queue priority (higher = processed first)';
COMMENT ON COLUMN zoho_sync_queue.attempts IS 'Number of processing attempts';
COMMENT ON COLUMN zoho_sync_queue.max_attempts IS 'Maximum attempts before marking as failed';
COMMENT ON COLUMN zoho_sync_queue.last_error IS 'Error message from last failed attempt';
COMMENT ON COLUMN zoho_sync_queue.scheduled_for IS 'When this item should be processed (for retry backoff)';
COMMENT ON COLUMN zoho_sync_queue.processed_at IS 'When this item was successfully processed (NULL = pending)';
