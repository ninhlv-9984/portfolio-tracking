import dotenv from 'dotenv';
import fs from 'fs';
import { OKXAuth } from './okx-auth.js';

// Load environment variables
dotenv.config();

/**
 * Fetch all fill history from OKX
 */
async function fetchAllFills() {
  // Get credentials from environment variables
  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_PASSPHRASE;

  // Validate credentials
  if (!apiKey || !secretKey || !passphrase) {
    console.error('❌ Error: Missing API credentials!');
    console.log('\nPlease set the following environment variables:');
    console.log('  - OKX_API_KEY');
    console.log('  - OKX_SECRET_KEY');
    console.log('  - OKX_PASSPHRASE');
    process.exit(1);
  }

  // Initialize OKX authentication
  const okx = new OKXAuth(apiKey, secretKey, passphrase);

  console.log('📊 Fetching All Fill History from OKX\n');
  console.log('═'.repeat(60));

  try {
    const startTime = Date.now();

    // Fetch all fills with progress updates
    // NOTE: instType is required by OKX API
    const allFills = await okx.getAllFills({
      // REQUIRED: Must specify instrument type
      instType: 'SPOT',           // SPOT, MARGIN, SWAP, FUTURES, OPTION

      // Optional filters - uncomment and modify as needed:
      // instId: 'BTC-USDT',         // Specific instrument
      // ordId: 'your-order-id',     // Specific order

      limit: 100, // Max results per page

      // Progress callback
      onProgress: (progress) => {
        const { page, fillsInPage, totalFills, latestFill, oldestFill } = progress;

        console.log(`\n📄 Page ${page}:`);
        console.log(`   - Fills in page: ${fillsInPage}`);
        console.log(`   - Total fills so far: ${totalFills}`);

        if (latestFill) {
          const latestTime = new Date(parseInt(latestFill.ts)).toISOString();
          console.log(`   - Latest fill: ${latestFill.instId} at ${latestTime}`);
        }

        if (oldestFill) {
          const oldestTime = new Date(parseInt(oldestFill.ts)).toISOString();
          console.log(`   - Oldest fill: ${oldestFill.instId} at ${oldestTime}`);
        }
      }
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n═'.repeat(60));
    console.log('\n✅ Fetch Complete!');
    console.log(`\nTotal fills fetched: ${allFills.length}`);
    console.log(`Time taken: ${duration} seconds`);

    if (allFills.length > 0) {
      // Calculate some statistics
      const firstFill = allFills[0];
      const lastFill = allFills[allFills.length - 1];

      const firstTime = new Date(parseInt(firstFill.ts));
      const lastTime = new Date(parseInt(lastFill.ts));

      console.log(`\nDate range:`);
      console.log(`  Latest: ${firstTime.toISOString()}`);
      console.log(`  Oldest: ${lastTime.toISOString()}`);

      // Get unique instruments
      const instruments = new Set(allFills.map(f => f.instId));
      console.log(`\nUnique instruments: ${instruments.size}`);
      console.log(`  ${Array.from(instruments).join(', ')}`);

      // Calculate total volume
      const sides = {
        buy: allFills.filter(f => f.side === 'buy').length,
        sell: allFills.filter(f => f.side === 'sell').length
      };
      console.log(`\nSides:`);
      console.log(`  Buy: ${sides.buy}`);
      console.log(`  Sell: ${sides.sell}`);

      // Save to file
      const filename = `okx-fills-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(filename, JSON.stringify(allFills, null, 2));
      console.log(`\n💾 Saved to: ${filename}`);

      // Also save a CSV summary
      const csvFilename = `okx-fills-${new Date().toISOString().split('T')[0]}.csv`;
      const csvHeader = 'fillId,ordId,instId,side,fillPx,fillSz,fee,timestamp\n';
      const csvRows = allFills.map(f =>
        `${f.billId},${f.ordId},${f.instId},${f.side},${f.fillPx},${f.fillSz},${f.fee},${new Date(parseInt(f.ts)).toISOString()}`
      ).join('\n');
      fs.writeFileSync(csvFilename, csvHeader + csvRows);
      console.log(`💾 CSV saved to: ${csvFilename}`);

      // Display sample fills
      console.log('\n📋 Sample Fills (first 5):');
      console.log('─'.repeat(60));
      allFills.slice(0, 5).forEach((fill, index) => {
        const time = new Date(parseInt(fill.ts)).toISOString();
        console.log(`\n${index + 1}. ${fill.instId} - ${fill.side.toUpperCase()}`);
        console.log(`   Fill ID: ${fill.billId}`);
        console.log(`   Order ID: ${fill.ordId}`);
        console.log(`   Price: ${fill.fillPx}`);
        console.log(`   Size: ${fill.fillSz}`);
        console.log(`   Fee: ${fill.fee} ${fill.feeCcy}`);
        console.log(`   Time: ${time}`);
      });
    } else {
      console.log('\nℹ️  No fills found in the last 3 months');
    }

  } catch (error) {
    console.error('\n❌ Error fetching fills:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.log('\n═'.repeat(60));
}

// Run the script
fetchAllFills().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
