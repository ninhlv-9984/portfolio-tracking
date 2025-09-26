-- Migration to add swap transaction type and source_asset column
-- This migration adds swap to the transaction_type enum and adds source_asset column

-- Add swap to the transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'swap' AFTER 'withdraw';

-- Add source_asset column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS source_asset VARCHAR(20);

-- Add source_asset column to history table
ALTER TABLE history ADD COLUMN IF NOT EXISTS source_asset VARCHAR(20);

-- Add index for source_asset for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_source_asset ON transactions(source_asset);
CREATE INDEX IF NOT EXISTS idx_history_source_asset ON history(source_asset);