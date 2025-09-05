-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS history CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Create enum for transaction type
CREATE TYPE transaction_type AS ENUM ('buy', 'sell', 'deposit', 'withdraw');

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset VARCHAR(20) NOT NULL,
    type transaction_type NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price_usd DECIMAL(20, 2) NOT NULL,
    destination_asset VARCHAR(20),
    transaction_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create history table
CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(20) NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    asset VARCHAR(20) NOT NULL,
    type transaction_type,
    destination_asset VARCHAR(20),
    quantity DECIMAL(20, 8) NOT NULL,
    price_usd DECIMAL(20, 2) NOT NULL,
    transaction_date DATE,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_asset ON transactions(asset);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_history_timestamp ON history(timestamp);
CREATE INDEX idx_history_asset ON history(asset);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();