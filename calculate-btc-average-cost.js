import dotenv from 'dotenv';
import { OKXAuth } from './okx-auth.js';

// Load environment variables
dotenv.config();

/**
 * Calculate average cost of buying BTC in the last 3 months
 */
async function calculateBTCAverageCost() {
  // Get credentials from environment variables
  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_PASSPHRASE;

  // Validate credentials
  if (!apiKey || !secretKey || !passphrase) {
    console.error('❌ Error: Missing API credentials!');
    console.log('\nPlease set the following environment variables in .env file');
    process.exit(1);
  }

  // Initialize OKX authentication
  const okx = new OKXAuth(apiKey, secretKey, passphrase);

  console.log('💰 Calculating Average BTC Buy Cost (Last 3 Months)\n');
  console.log('═'.repeat(70));

  try {
    const startTime = Date.now();

    console.log('\n📊 Fetching all fills across all instrument types...');
    console.log('   This may take a moment...\n');

    // Since instType is required, we need to fetch for each type separately
    const instTypes = ['SPOT', 'MARGIN', 'SWAP', 'FUTURES', 'OPTION'];
    const allFills = [];

    for (const instType of instTypes) {
      console.log(`   Fetching ${instType} fills...`);

      try {
        const fills = await okx.getAllFills({
          instType: instType,
          limit: 100,
          onProgress: (progress) => {
            console.log(`      Page ${progress.page}: ${progress.fillsInPage} fills`);
          }
        });

        allFills.push(...fills);
        console.log(`   ✓ ${instType}: ${fills.length} fills found`);
      } catch (error) {
        // Some instrument types might not have data or permission
        if (error.message.includes('50013') || error.message.includes('50111')) {
          console.log(`   - ${instType}: No access or no data`);
        } else {
          console.log(`   ⚠ ${instType}: ${error.message}`);
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Fetched ${allFills.length} total fills in ${duration}s`);
    console.log('─'.repeat(70));

    // Filter for BTC buys
    // BTC pairs can be: BTC-USDT, BTC-USD, BTC-USDC, etc.
    const btcBuyFills = allFills.filter(fill => {
      const isBTCPair = fill.instId.startsWith('BTC-');
      const isBuy = fill.side === 'buy';
      return isBTCPair && isBuy;
    });

    if (btcBuyFills.length === 0) {
      console.log('\n⚠️  No BTC buy fills found in the last 3 months');
      console.log('\nℹ️  This could mean:');
      console.log('  - You haven\'t bought BTC in the last 3 months');
      console.log('  - Your API key doesn\'t have access to trade history');
      console.log('  - BTC trades are in a different format (checking...)');

      // Show what instruments were found
      const uniqueInstruments = [...new Set(allFills.map(f => f.instId))];
      console.log('\n📋 Found fills for these instruments:');
      uniqueInstruments.forEach(inst => {
        const count = allFills.filter(f => f.instId === inst).length;
        console.log(`  - ${inst}: ${count} fills`);
      });

      process.exit(0);
    }

    console.log(`\n🔍 Found ${btcBuyFills.length} BTC buy fills`);
    console.log('─'.repeat(70));

    // Group by trading pair
    const pairGroups = {};
    btcBuyFills.forEach(fill => {
      if (!pairGroups[fill.instId]) {
        pairGroups[fill.instId] = [];
      }
      pairGroups[fill.instId].push(fill);
    });

    // Calculate average cost for each pair
    console.log('\n📈 Average Buy Cost by Trading Pair:\n');

    let totalBTCBought = 0;
    let totalCostInQuoteCurrency = {};
    let totalBTCPerCurrency = {}; // Track BTC bought per currency

    Object.keys(pairGroups).sort().forEach(pair => {
      const fills = pairGroups[pair];

      // Calculate total BTC bought and total cost
      let totalBTC = 0;
      let totalCost = 0;
      let minPrice = Infinity;
      let maxPrice = 0;

      fills.forEach(fill => {
        const btcAmount = parseFloat(fill.fillSz);
        const price = parseFloat(fill.fillPx);
        const cost = btcAmount * price;

        totalBTC += btcAmount;
        totalCost += cost;
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      });

      const averagePrice = totalCost / totalBTC;
      const quoteCurrency = pair.split('-')[1]; // e.g., USDT from BTC-USDT

      // Track totals per currency
      totalBTCBought += totalBTC;
      if (!totalCostInQuoteCurrency[quoteCurrency]) {
        totalCostInQuoteCurrency[quoteCurrency] = 0;
        totalBTCPerCurrency[quoteCurrency] = 0;
      }
      totalCostInQuoteCurrency[quoteCurrency] += totalCost;
      totalBTCPerCurrency[quoteCurrency] += totalBTC;

      console.log(`${pair}:`);
      console.log(`  Number of fills: ${fills.length}`);
      console.log(`  Total BTC bought: ${totalBTC.toFixed(8)} BTC`);
      console.log(`  Total cost: ${totalCost.toFixed(2)} ${quoteCurrency}`);
      console.log(`  Average price: ${averagePrice.toFixed(2)} ${quoteCurrency}`);
      console.log(`  Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ${quoteCurrency}`);

      // Calculate fees if available
      const totalFees = fills.reduce((sum, fill) => {
        const fee = parseFloat(fill.fee);
        return sum + Math.abs(fee); // Fees are usually negative
      }, 0);

      if (totalFees > 0) {
        const feeCcy = fills[0].feeCcy;
        console.log(`  Total fees: ${totalFees.toFixed(8)} ${feeCcy}`);
      }

      console.log('');
    });

    console.log('─'.repeat(70));
    console.log('\n📊 Overall Summary:\n');
    console.log(`Total BTC Bought: ${totalBTCBought.toFixed(8)} BTC\n`);

    // Show breakdown by currency
    Object.keys(totalCostInQuoteCurrency).sort().forEach(currency => {
      const totalCost = totalCostInQuoteCurrency[currency];
      const btcBought = totalBTCPerCurrency[currency];
      const avgPrice = totalCost / btcBought; // Correct calculation per currency

      // Find which trading pairs use this currency
      const pairsWithCurrency = Object.keys(pairGroups).filter(pair =>
        pair.split('-')[1] === currency
      );

      console.log(`${currency}:`);
      console.log(`  Trading pairs: ${pairsWithCurrency.join(', ')}`);
      console.log(`  BTC bought: ${btcBought.toFixed(8)} BTC`);
      console.log(`  Total cost: ${totalCost.toFixed(2)} ${currency}`);
      console.log(`  Weighted average price: ${avgPrice.toFixed(2)} ${currency}/BTC`);
      console.log('');
    });

    // Show date range
    if (btcBuyFills.length > 0) {
      const oldestFill = btcBuyFills[btcBuyFills.length - 1];
      const newestFill = btcBuyFills[0];

      const oldestDate = new Date(parseInt(oldestFill.ts));
      const newestDate = new Date(parseInt(newestFill.ts));

      console.log(`\nDate Range:`);
      console.log(`  First buy: ${oldestDate.toLocaleString()}`);
      console.log(`  Last buy: ${newestDate.toLocaleString()}`);
    }

    // Show detailed breakdown
    console.log('\n─'.repeat(70));
    console.log('\n📋 Recent BTC Buys (Last 10):\n');

    btcBuyFills.slice(0, 10).forEach((fill, index) => {
      const date = new Date(parseInt(fill.ts));
      const btcAmount = parseFloat(fill.fillSz);
      const price = parseFloat(fill.fillPx);
      const cost = btcAmount * price;
      const quoteCurrency = fill.instId.split('-')[1];

      console.log(`${index + 1}. ${date.toLocaleString()}`);
      console.log(`   ${fill.instId}: ${btcAmount.toFixed(8)} BTC @ ${price.toFixed(2)} ${quoteCurrency}`);
      console.log(`   Cost: ${cost.toFixed(2)} ${quoteCurrency}`);
      console.log('');
    });

    console.log('═'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error calculating average cost:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
calculateBTCAverageCost().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
