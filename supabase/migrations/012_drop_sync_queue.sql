-- Migration 012: Drop zoho_sync_queue table
-- Sync is now performed inline during registration, no queue needed

DROP TABLE IF EXISTS zoho_sync_queue;
