import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crypto_portfolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Strip BOM and invisible chars from OKX CSVs
function cleanLine(str) {
  return str.replace(/^\uFEFF/, '').replace(/\ufeff/g, '').trim();
}

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  // Skip the first line (UID/Account metadata), parse from header row
  const lines = raw.split('\n');
  const csvContent = lines.slice(1).join('\n');
  const cleaned = cleanLine(csvContent);

  return parse(cleaned, {
    columns: (header) => header.map(h => cleanLine(h)),
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
}

function dateToTimestamp(dateStr) {
  return new Date(dateStr + ' UTC').getTime();
}

function normalizeSymbol(symbol) {
  return symbol.replace('USDⓈ', 'USDC');
}

async function importCSV(folderPath) {
  const files = fs.readdirSync(folderPath);
  const orderFile = files.find(f => f.startsWith('Order History'));
  const tradeFile = files.find(f => f.startsWith('Trade Details'));

  if (!orderFile || !tradeFile) {
    console.error('❌ Could not find "Order History" and/or "Trade Details" CSV files in:', folderPath);
    process.exit(1);
  }

  console.log(`📂 Order History: ${orderFile}`);
  console.log(`📂 Trade Details: ${tradeFile}`);

  // 1. Parse Order History → build Order ID → side map
  const orders = parseCSV(path.join(folderPath, orderFile));
  const sideMap = new Map();

  for (const order of orders) {
    const orderId = cleanLine(order['Order ID']);
    const side = (order['Side'] || '').toLowerCase();
    if (orderId && side) {
      sideMap.set(orderId, side);
    }
  }
  console.log(`📋 Loaded ${sideMap.size} orders with side info`);

  // 2. Parse Trade Details
  const trades = parseCSV(path.join(folderPath, tradeFile));
  console.log(`📋 Found ${trades.length} trade fills to import`);

  // 3. Get existing ord_ids from API fills to avoid duplicates
  const client = await pool.connect();
  const existingResult = await client.query(
    "SELECT DISTINCT ord_id FROM fills WHERE bill_id NOT LIKE 'csv_%'"
  );
  const apiOrderIds = new Set(existingResult.rows.map(r => r.ord_id));
  console.log(`📋 Found ${apiOrderIds.size} orders already from API`);

  // 4. Clean up any previously imported CSV fills that overlap with API data
  const cleanupResult = await client.query(`
    DELETE FROM fills
    WHERE bill_id LIKE 'csv_%'
    AND ord_id IN (SELECT DISTINCT ord_id FROM fills WHERE bill_id NOT LIKE 'csv_%')
  `);
  if (cleanupResult.rowCount > 0) {
    console.log(`🧹 Cleaned up ${cleanupResult.rowCount} duplicate CSV fills (already in API data)`);
  }

  // 5. Insert CSV fills, skipping orders that exist from API
  let inserted = 0;
  let skippedDup = 0;
  let skippedApi = 0;
  let skippedSettlement = 0;
  let noSide = 0;

  try {
    for (const trade of trades) {
      const orderId = cleanLine(trade['Order ID']);
      const tradeId = cleanLine(trade['Trade ID']);
      const tradeTime = trade['Trade Time'];
      const instrument = trade['Instrument'] || 'Spot';
      const symbol = normalizeSymbol(trade['Symbol'] || '');
      const fillSz = parseFloat(trade['Filled Amount']) || 0;
      const fillPx = parseFloat(trade['Filled Price']) || 0;
      const fee = parseFloat(trade['Fee']) || 0;
      const feeCcy = (trade['Fee Unit'] || '').trim();
      const ts = dateToTimestamp(tradeTime);

      // Skip if API already has fills for this order
      if (apiOrderIds.has(orderId)) {
        skippedApi++;
        continue;
      }

      // Skip settlement/volume rows from BTC-USD(C) pairs.
      // OKX exports two rows per fill on coin-margined pairs:
      //   - The real fill (small amount, has fee)
      //   - The settlement counterpart (huge amount, fee=0)
      // We only want the real fill.
      if (fee === 0 && fillSz > 1) {
        skippedSettlement++;
        continue;
      }

      const side = sideMap.get(orderId);
      if (!side) {
        console.warn(`⚠️  No side found for Order ID ${orderId} (Trade ID: ${tradeId}), skipping`);
        noSide++;
        continue;
      }

      const billId = `csv_${tradeId}`;

      try {
        const result = await client.query(
          `INSERT INTO fills (bill_id, inst_id, inst_type, side, fill_px, fill_sz, fee, fee_ccy, ord_id, ts)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (bill_id) DO NOTHING`,
          [billId, symbol, instrument, side, fillPx, fillSz, fee, feeCcy, orderId, ts]
        );
        if (result.rowCount > 0) {
          inserted++;
        } else {
          skippedDup++;
        }
      } catch (err) {
        console.error(`❌ Error inserting trade ${tradeId}:`, err.message);
      }
    }
  } finally {
    client.release();
  }

  console.log('');
  console.log('✅ Import complete:');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (already from API): ${skippedApi}`);
  console.log(`   Skipped (duplicate CSV): ${skippedDup}`);
  if (skippedSettlement > 0) console.log(`   Skipped (settlement rows): ${skippedSettlement}`);
  if (noSide > 0) console.log(`   Skipped (no side): ${noSide}`);
  console.log(`   Total trades in CSV: ${trades.length}`);

  await pool.end();
}

const folderPath = process.argv[2];
if (!folderPath) {
  console.error('Usage: node import-okx-csv.js <path-to-okx-export-folder>');
  process.exit(1);
}

if (!fs.existsSync(folderPath)) {
  console.error(`❌ Folder not found: ${folderPath}`);
  process.exit(1);
}

importCSV(folderPath).catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
