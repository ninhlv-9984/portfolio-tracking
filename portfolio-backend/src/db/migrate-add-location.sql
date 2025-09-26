-- Add location field to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Add location field to history table for tracking
ALTER TABLE history
ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Add index for better query performance when filtering by location
CREATE INDEX IF NOT EXISTS idx_transactions_location ON transactions(location);
CREATE INDEX IF NOT EXISTS idx_transactions_user_location ON transactions(user_id, location);