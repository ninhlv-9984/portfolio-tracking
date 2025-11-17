import dotenv from 'dotenv';
import { OKXAuth } from './okx-auth.js';

// Load environment variables
dotenv.config();

/**
 * Test OKX API Authentication
 */
async function testOKXAPI() {
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
    console.log('\nYou can create a .env file with these values.');
    process.exit(1);
  }

  // Initialize OKX authentication
  const okx = new OKXAuth(apiKey, secretKey, passphrase);

  console.log('🔐 OKX API Authentication Test\n');
  console.log('═'.repeat(50));

  // Test 1: Get Account Balance
  console.log('\n📊 Test 1: Get Account Balance');
  console.log('─'.repeat(50));
  try {
    const balance = await okx.getAccountBalance();
    console.log('Status:', balance.status);
    console.log('Response:', JSON.stringify(balance.data, null, 2));

    if (balance.data?.code === '0') {
      console.log('✅ Success: Account balance retrieved');
    } else {
      console.log('⚠️  Warning: Unexpected response code:', balance.data?.code);
      console.log('Message:', balance.data?.msg);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Get Account Balance for specific currency (BTC)
  console.log('\n📊 Test 2: Get BTC Balance');
  console.log('─'.repeat(50));
  try {
    const btcBalance = await okx.getAccountBalance('BTC');
    console.log('Status:', btcBalance.status);
    console.log('Response:', JSON.stringify(btcBalance.data, null, 2));

    if (btcBalance.data?.code === '0') {
      console.log('✅ Success: BTC balance retrieved');
    } else {
      console.log('⚠️  Warning: Unexpected response code:', btcBalance.data?.code);
      console.log('Message:', btcBalance.data?.msg);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 3: Get Account Configuration
  console.log('\n⚙️  Test 3: Get Account Configuration');
  console.log('─'.repeat(50));
  try {
    const config = await okx.getAccountConfig();
    console.log('Status:', config.status);
    console.log('Response:', JSON.stringify(config.data, null, 2));

    if (config.data?.code === '0') {
      console.log('✅ Success: Account configuration retrieved');
    } else {
      console.log('⚠️  Warning: Unexpected response code:', config.data?.code);
      console.log('Message:', config.data?.msg);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 4: Get Positions
  console.log('\n📈 Test 4: Get Positions');
  console.log('─'.repeat(50));
  try {
    const positions = await okx.getPositions();
    console.log('Status:', positions.status);
    console.log('Response:', JSON.stringify(positions.data, null, 2));

    if (positions.data?.code === '0') {
      console.log('✅ Success: Positions retrieved');
    } else {
      console.log('⚠️  Warning: Unexpected response code:', positions.data?.code);
      console.log('Message:', positions.data?.msg);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n═'.repeat(50));
  console.log('✨ Tests completed!\n');
}

// Run tests
testOKXAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
