import pool from '../config/database.js';
import { OKXAuth } from './okx-auth.js';

interface Holding {
  symbol: string;
  amount: number;
  avgCost: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercentage?: number;
  weight?: number;
}

interface Portfolio {
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercentage: number;
  lastUpdated: Date;
}

export class PortfolioCalculatorService {
  private okx: OKXAuth;

  constructor(apiKey: string, secretKey: string, passphrase: string) {
    this.okx = new OKXAuth(apiKey, secretKey, passphrase);
  }

  /**
   * Calculate holdings from fills in database
   */
  async calculateHoldings(): Promise<Holding[]> {
    const fills = await pool.query('SELECT * FROM fills ORDER BY ts ASC');

    // Group fills by base currency (e.g., BTC from BTC-USDT)
    const holdings: Map<string, { amount: number; totalCost: number }> = new Map();

    for (const fill of fills.rows) {
      const symbol = fill.inst_id.split('-')[0]; // Get base currency (BTC from BTC-USDT)
      const amount = parseFloat(fill.fill_sz);
      const price = parseFloat(fill.fill_px);
      const cost = amount * price;

      if (!holdings.has(symbol)) {
        holdings.set(symbol, { amount: 0, totalCost: 0 });
      }

      const holding = holdings.get(symbol)!;

      if (fill.side === 'buy') {
        holding.amount += amount;
        holding.totalCost += cost;
      } else if (fill.side === 'sell') {
        // For sells, reduce amount but also reduce cost proportionally
        const avgCostBeforeSell = holding.amount > 0 ? holding.totalCost / holding.amount : 0;
        holding.amount -= amount;
        holding.totalCost -= amount * avgCostBeforeSell;
      }
    }

    // Convert to array and calculate average cost
    const holdingsArray: Holding[] = [];

    for (const [symbol, data] of holdings.entries()) {
      if (data.amount > 0.00000001) { // Only include holdings with significant amount
        holdingsArray.push({
          symbol,
          amount: data.amount,
          totalCost: data.totalCost,
          avgCost: data.totalCost / data.amount
        });
      }
    }

    // Save to database
    await this.saveHoldings(holdingsArray);

    return holdingsArray;
  }

  /**
   * Get current prices for holdings
   */
  async getCurrentPrices(holdings: Holding[]): Promise<Map<string, number>> {
    const prices: Map<string, number> = new Map();

    // Try to get prices from different instrument types and quote currencies
    const quoteCurrencies = ['USDT', 'USD', 'USDC'];

    for (const holding of holdings) {
      let priceFound = false;

      for (const quoteCcy of quoteCurrencies) {
        const instId = `${holding.symbol}-${quoteCcy}`;

        try {
          const tickerResponse = await this.okx.getTicker(instId);

          if (tickerResponse.data?.code === '0' && tickerResponse.data?.data?.length > 0) {
            const price = parseFloat(tickerResponse.data.data[0].last);
            prices.set(holding.symbol, price);
            priceFound = true;
            break;
          }
        } catch (error) {
          // Try next quote currency
        }
      }

      if (!priceFound) {
        console.warn(`⚠️  Could not fetch price for ${holding.symbol}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Cache prices
    await this.cachePrices(prices);

    return prices;
  }

  /**
   * Get actual account balance from OKX (Trading + Funding accounts)
   */
  async getAccountBalance(): Promise<Map<string, number>> {
    const balances: Map<string, number> = new Map();

    try {
      // 1. Fetch Trading Account Balance
      const tradingResponse: any = await this.okx.getBalance();
      console.log('📊 Trading Account Balance:');

      if (tradingResponse.data?.code === '0' && tradingResponse.data?.data?.length > 0) {
        const accountData = tradingResponse.data.data[0];

        if (accountData.details && Array.isArray(accountData.details)) {
          for (const detail of accountData.details) {
            const currency = detail.ccy;
            const availBal = parseFloat(detail.availBal || 0);

            if (availBal > 0) {
              console.log(`  💰 ${currency}: ${availBal} (trading)`);
              balances.set(currency, availBal);
            }
          }
        }
      }

      // 2. Fetch Funding Account Balance
      const fundingResponse: any = await this.okx.getFundingBalance();
      console.log('📊 Funding Account Balance:');

      if (fundingResponse.data?.code === '0' && fundingResponse.data?.data?.length > 0) {
        for (const asset of fundingResponse.data.data) {
          const currency = asset.ccy;
          const availBal = parseFloat(asset.availBal || 0);

          if (availBal > 0) {
            console.log(`  💰 ${currency}: ${availBal} (funding)`);

            // Add to existing balance or create new entry
            const existing = balances.get(currency) || 0;
            balances.set(currency, existing + availBal);
          }
        }
      }

      // 3. Fetch Simple Earn (Savings) Balance
      const savingsResponse: any = await this.okx.getSavingsBalance();
      console.log('📊 Simple Earn (Savings) Balance:');

      if (savingsResponse.data?.code === '0' && savingsResponse.data?.data?.length > 0) {
        for (const asset of savingsResponse.data.data) {
          const currency = asset.ccy;
          const amt = parseFloat(asset.amt || 0); // Savings uses 'amt' field

          if (amt > 0) {
            console.log(`  💰 ${currency}: ${amt} (savings/earn)`);

            // Add to existing balance or create new entry
            const existing = balances.get(currency) || 0;
            balances.set(currency, existing + amt);
          }
        }
      }

      console.log(`📋 Total balances found: ${balances.size}`);
      console.log('📋 Combined balances:', Array.from(balances.entries()).map(([ccy, amt]) => `${ccy}: ${amt}`).join(', '));
    } catch (error) {
      console.error('Error fetching account balance:', error);
    }

    return balances;
  }

  /**
   * Calculate complete portfolio with current prices
   */
  async calculatePortfolio(): Promise<Portfolio> {
    // Get holdings from trade fills
    const fillsHoldings = await this.calculateHoldings();

    // Get actual account balance from OKX
    const accountBalances = await this.getAccountBalance();

    // Merge fills-based holdings with actual balances
    // Prefer actual balances over calculated fills
    const holdingsMap: Map<string, Holding> = new Map();

    // Start with fills-based holdings (to preserve cost basis)
    for (const holding of fillsHoldings) {
      holdingsMap.set(holding.symbol, holding);
    }

    // Add or update with actual balances
    // For stablecoins (USD/USDT/USDC): use actual balance (from earning accounts)
    // For crypto assets: keep fill-calculated amounts (includes cold wallet transfers)
    const stablecoins = ['USD', 'USDT', 'USDC', 'DAI', 'TUSD', 'BUSD'];

    for (const [symbol, actualAmount] of accountBalances.entries()) {
      if (actualAmount > 0.00000001) {
        const existing = holdingsMap.get(symbol);
        const isStablecoin = stablecoins.includes(symbol);

        if (existing) {
          // Only update amount for stablecoins (earning accounts)
          // Keep fill-calculated amounts for crypto (includes cold wallet transfers)
          if (isStablecoin) {
            existing.amount = actualAmount;
          }
        } else {
          // New holding not in fills (e.g., deposited, earned, stablecoins from earning)
          holdingsMap.set(symbol, {
            symbol,
            amount: actualAmount,
            totalCost: 0, // No cost basis for non-traded assets
            avgCost: 0
          });
        }
      }
    }

    // Remove holdings that fills say exist but OKX balance is 0.
    // This handles assets fully sold/withdrawn where the sell fill is missing.
    const stablecoinSet = new Set(stablecoins);
    for (const [symbol] of holdingsMap) {
      if (stablecoinSet.has(symbol)) continue;
      if (!accountBalances.has(symbol) || (accountBalances.get(symbol) || 0) < 0.00000001) {
        holdingsMap.delete(symbol);
      }
    }

    let holdings = Array.from(holdingsMap.values());

    // Merge all USD stablecoins (USD, USDT, USDC) into a single "USD" entry
    const usdStablecoins = ['USD', 'USDT', 'USDC'];
    const stablecoinHoldings = holdings.filter(h => usdStablecoins.includes(h.symbol));

    if (stablecoinHoldings.length > 0) {
      // Combine all stablecoins into one USD entry
      const mergedStablecoin: Holding = {
        symbol: 'USD',
        amount: stablecoinHoldings.reduce((sum, h) => sum + h.amount, 0),
        totalCost: stablecoinHoldings.reduce((sum, h) => sum + h.totalCost, 0),
        avgCost: 0, // Will be calculated below
      };

      // Calculate average cost if there's a cost basis
      if (mergedStablecoin.totalCost > 0 && mergedStablecoin.amount > 0) {
        mergedStablecoin.avgCost = mergedStablecoin.totalCost / mergedStablecoin.amount;
      }

      // Stablecoins are cash — cost basis = face value (1:1), zero P&L
      mergedStablecoin.totalCost = mergedStablecoin.amount;
      mergedStablecoin.avgCost = 1;

      // Remove individual stablecoin entries and add merged entry
      holdings = holdings.filter(h => !usdStablecoins.includes(h.symbol));
      holdings.push(mergedStablecoin);
    }

    const prices = await this.getCurrentPrices(holdings);

    let totalValue = 0;
    let totalCost = 0;

    // Add current prices and calculate P&L
    let totalValueTraded = 0; // Only traded assets
    let totalCostTraded = 0;  // Only assets with cost basis

    for (const holding of holdings) {
      // For USD (merged stablecoins), price is 1
      let currentPrice = prices.get(holding.symbol) || 0;
      if (holding.symbol === 'USD') {
        currentPrice = 1;
      }

      holding.currentPrice = currentPrice;
      holding.currentValue = holding.amount * currentPrice;
      holding.pnl = holding.currentValue - holding.totalCost;
      holding.pnlPercentage = holding.totalCost > 0 ? (holding.pnl / holding.totalCost) * 100 : 0;

      totalValue += holding.currentValue;
      totalCost += holding.totalCost;

      // Only include assets with cost basis in P&L calculation
      if (holding.totalCost > 0) {
        totalValueTraded += holding.currentValue;
        totalCostTraded += holding.totalCost;
      }
    }

    // Filter out dust holdings (value < $30)
    holdings = holdings.filter(h => (h.currentValue || 0) >= 30);

    // Recalculate totals after filtering
    totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    totalValueTraded = holdings.filter(h => h.totalCost > 0).reduce((sum, h) => sum + (h.currentValue || 0), 0);
    totalCostTraded = holdings.filter(h => h.totalCost > 0).reduce((sum, h) => sum + h.totalCost, 0);

    // Calculate portfolio weights
    for (const holding of holdings) {
      holding.weight = totalValue > 0 ? (holding.currentValue! / totalValue) * 100 : 0;
    }

    // P&L only from traded assets (excludes stablecoins from earning with no cost basis)
    const totalPnl = totalValueTraded - totalCostTraded;
    const totalPnlPercentage = totalCostTraded > 0 ? (totalPnl / totalCostTraded) * 100 : 0;

    return {
      holdings,
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercentage,
      lastUpdated: new Date()
    };
  }

  /**
   * Save holdings to database
   */
  private async saveHoldings(holdings: Holding[]): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Clear existing holdings
      await client.query('DELETE FROM holdings');

      // Insert new holdings
      for (const holding of holdings) {
        await client.query(
          `INSERT INTO holdings (symbol, total_amount, avg_cost, total_cost, updated_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [holding.symbol, holding.amount, holding.avgCost, holding.totalCost]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cache prices to database
   */
  private async cachePrices(prices: Map<string, number>): Promise<void> {
    const client = await pool.connect();

    try {
      for (const [symbol, price] of prices.entries()) {
        await client.query(
          `INSERT INTO price_cache (symbol, price, quote_currency, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (symbol)
           DO UPDATE SET price = $2, updated_at = NOW()`,
          [symbol, price, 'USDT']
        );
      }
    } finally {
      client.release();
    }
  }

  /**
   * Create portfolio snapshot
   */
  async createSnapshot(): Promise<void> {
    const portfolio = await this.calculatePortfolio();

    await pool.query(
      `INSERT INTO portfolio_snapshots (timestamp, total_value, total_pnl, total_pnl_percentage, data)
       VALUES (NOW(), $1, $2, $3, $4)`,
      [portfolio.totalValue, portfolio.totalPnl, portfolio.totalPnlPercentage, JSON.stringify(portfolio)]
    );

    console.log('✅ Portfolio snapshot created');
  }

  /**
   * Get historical snapshots
   */
  async getSnapshots(limit: number = 30): Promise<any[]> {
    const result = await pool.query(
      'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );

    return result.rows;
  }
}
