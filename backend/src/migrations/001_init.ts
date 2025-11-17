import pool from '../config/database.js';

export async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fills table - stores all trade fills from OKX
    await client.query(`
      CREATE TABLE IF NOT EXISTS fills (
        id SERIAL PRIMARY KEY,
        bill_id VARCHAR(255) UNIQUE NOT NULL,
        inst_id VARCHAR(50) NOT NULL,
        inst_type VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL,
        fill_px DECIMAL(20, 8) NOT NULL,
        fill_sz DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) NOT NULL,
        fee_ccy VARCHAR(10),
        ord_id VARCHAR(255),
        ts BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on inst_id for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_fills_inst_id ON fills(inst_id)
    `);

    // Create index on side for faster filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_fills_side ON fills(side)
    `);

    // Holdings table - calculated current positions
    await client.query(`
      CREATE TABLE IF NOT EXISTS holdings (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        total_amount DECIMAL(20, 8) NOT NULL,
        avg_cost DECIMAL(20, 8) NOT NULL,
        total_cost DECIMAL(20, 8) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Portfolio snapshots table - daily portfolio snapshots
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_snapshots (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        total_value DECIMAL(20, 2) NOT NULL,
        total_pnl DECIMAL(20, 2) NOT NULL,
        total_pnl_percentage DECIMAL(10, 4),
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on timestamp for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON portfolio_snapshots(timestamp DESC)
    `);

    // Price cache table - cached market prices
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_cache (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        quote_currency VARCHAR(10) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 001_init completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 001_init failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS price_cache');
    await client.query('DROP TABLE IF EXISTS portfolio_snapshots');
    await client.query('DROP TABLE IF EXISTS holdings');
    await client.query('DROP TABLE IF EXISTS fills');

    await client.query('COMMIT');
    console.log('✅ Migration 001_init rolled back successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
