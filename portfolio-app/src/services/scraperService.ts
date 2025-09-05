import type { AssetPrice } from '../types/portfolio'

interface ScrapedPrice {
  symbol: string
  price: number
  change24h?: number
  timestamp: number
}

class ScraperService {
  private cache = new Map<string, ScrapedPrice>()
  private cacheTimeout = 60000 // 1 minute cache
  private lastFetchTime = 0
  private minFetchInterval = 30000 // Minimum 30 seconds between fetches

  // Mapping for common crypto symbols
  private symbolMapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'XRP': 'xrp',
    'ADA': 'cardano',
    'SOL': 'solana',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'AVAX': 'avalanche',
    'LINK': 'chainlink',
    'MATIC': 'polygon',
    'NEAR': 'near',
    'APT': 'aptos',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'USDT': 'tether',
    'USDC': 'usd-coin'
  }

  async getPricesFromCoinMarketCap(symbols: string[]): Promise<Map<string, AssetPrice>> {
    const result = new Map<string, AssetPrice>()
    const now = Date.now()

    // Check cache first
    const symbolsToFetch: string[] = []
    for (const symbol of symbols) {
      const cached = this.cache.get(symbol.toUpperCase())
      if (cached && now - cached.timestamp < this.cacheTimeout) {
        result.set(symbol.toUpperCase(), {
          symbol: symbol.toUpperCase(),
          name: this.symbolMapping[symbol.toUpperCase()] || symbol,
          current_price: cached.price,
          price_change_percentage_24h: cached.change24h || 0,
          last_updated: new Date(cached.timestamp).toISOString()
        })
      } else {
        symbolsToFetch.push(symbol)
      }
    }

    if (symbolsToFetch.length === 0) {
      return result
    }

    // Rate limiting
    if (now - this.lastFetchTime < this.minFetchInterval) {
      console.log('Rate limiting: waiting before next fetch')
      return result
    }

    try {
      // Fetch from CoinMarketCap's public page
      const response = await fetch('https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=100&convert=USD')
      
      if (!response.ok) {
        throw new Error('Failed to fetch from CoinMarketCap')
      }

      const data = await response.json()
      const cryptoList = data.data?.cryptoList || []

      for (const crypto of cryptoList) {
        const symbol = crypto.symbol?.toUpperCase()
        if (symbol && symbolsToFetch.includes(symbol)) {
          const price = crypto.quotes?.[0]?.price || 0
          const change24h = crypto.quotes?.[0]?.percentChange24h || 0
          
          const scrapedPrice: ScrapedPrice = {
            symbol,
            price,
            change24h,
            timestamp: now
          }
          
          this.cache.set(symbol, scrapedPrice)
          
          result.set(symbol, {
            symbol,
            name: crypto.name || this.symbolMapping[symbol] || symbol,
            current_price: price,
            price_change_percentage_24h: change24h,
            last_updated: new Date(now).toISOString()
          })
        }
      }

      this.lastFetchTime = now
    } catch (error) {
      console.error('Scraping error:', error)
    }

    return result
  }

  async getPricesFromBinance(symbols: string[]): Promise<Map<string, AssetPrice>> {
    const result = new Map<string, AssetPrice>()
    const now = Date.now()

    try {
      // Binance public API (no key required for basic ticker data)
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Binance')
      }

      const tickers = await response.json()
      
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase()
        // Look for SYMBOL + USDT pair
        const ticker = tickers.find((t: any) => 
          t.symbol === `${upperSymbol}USDT` || 
          t.symbol === `${upperSymbol}BUSD`
        )
        
        if (ticker) {
          const price = parseFloat(ticker.lastPrice)
          const change24h = parseFloat(ticker.priceChangePercent)
          
          const scrapedPrice: ScrapedPrice = {
            symbol: upperSymbol,
            price,
            change24h,
            timestamp: now
          }
          
          this.cache.set(upperSymbol, scrapedPrice)
          
          result.set(upperSymbol, {
            symbol: upperSymbol,
            name: this.symbolMapping[upperSymbol] || upperSymbol,
            current_price: price,
            price_change_percentage_24h: change24h,
            last_updated: new Date(now).toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Binance API error:', error)
    }

    return result
  }

  async getPrices(symbols: string[]): Promise<Map<string, AssetPrice>> {
    // Try multiple sources with fallback
    let prices = await this.getPricesFromBinance(symbols)
    
    // If Binance doesn't have all symbols, try CoinMarketCap
    const missingSymbols = symbols.filter(s => !prices.has(s.toUpperCase()))
    if (missingSymbols.length > 0) {
      const cmcPrices = await this.getPricesFromCoinMarketCap(missingSymbols)
      cmcPrices.forEach((value, key) => prices.set(key, value))
    }

    return prices
  }

  clearCache() {
    this.cache.clear()
    this.lastFetchTime = 0
  }
}

export const scraperService = new ScraperService()