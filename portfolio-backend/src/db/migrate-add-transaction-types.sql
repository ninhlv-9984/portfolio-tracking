-- Migration to add deposit and withdraw transaction types
-- This migration adds the new transaction types to the existing enum

-- Add new values to the transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'deposit' AFTER 'sell';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'withdraw' AFTER 'deposit';

-- Note: PostgreSQL doesn't allow removing enum values, only adding them
-- If you need to reset the enum completely, you'd need to drop and recreate tables