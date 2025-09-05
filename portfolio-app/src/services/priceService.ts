import type { AssetPrice } from '../types/portfolio'

export interface PriceService {
  getPrices(symbols: string[]): Promise<Map<string, AssetPrice>>
  searchAssets(query: string): Promise<AssetPrice[]>
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// List of supported asset IDs for future reference
// const SUPPORTED_ASSETS = [
//   'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano',
//   'solana', 'polkadot', 'dogecoin', 'avalanche-2', 'chainlink',
//   'polygon', 'near', 'aptos', 'arbitrum', 'optimism'
// ]

const SYMBOL_TO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'MATIC': 'polygon',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism'
}

export class CoinGeckoService implements PriceService {
  private cache = new Map<string, { data: AssetPrice; timestamp: number }>()
  private cacheTimeout = 15000 // 15 seconds

  async getPrices(symbols: string[]): Promise<Map<string, AssetPrice>> {
    const result = new Map<string, AssetPrice>()
    const symbolsToFetch: string[] = []
    const now = Date.now()

    // Check cache first
    for (const symbol of symbols) {
      const cached = this.cache.get(symbol.toUpperCase())
      if (cached && now - cached.timestamp < this.cacheTimeout) {
        result.set(symbol.toUpperCase(), cached.data)
      } else {
        symbolsToFetch.push(symbol)
      }
    }

    if (symbolsToFetch.length === 0) {
      return result
    }

    // Map symbols to CoinGecko IDs
    const ids = symbolsToFetch
      .map(s => SYMBOL_TO_ID[s.toUpperCase()])
      .filter(Boolean)
    
    if (ids.length === 0) {
      return result
    }

    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices')
      }

      const data = await response.json()
      
      // Also fetch market data for images and names
      const marketResponse = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc`
      )
      
      const marketData: any[] = marketResponse.ok ? await marketResponse.json() : []
      const marketMap = new Map(marketData.map((item) => [item.id, item]))

      for (const [id, priceData] of Object.entries(data) as any) {
        const symbol = Object.entries(SYMBOL_TO_ID).find(([_, v]) => v === id)?.[0]
        if (symbol) {
          const marketInfo = marketMap.get(id) as any
          const assetPrice: AssetPrice = {
            symbol,
            name: marketInfo?.name || symbol,
            current_price: priceData.usd,
            price_change_percentage_24h: priceData.usd_24h_change || 0,
            last_updated: new Date().toISOString(),
            image: marketInfo?.image
          }
          result.set(symbol, assetPrice)
          this.cache.set(symbol, { data: assetPrice, timestamp: now })
        }
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    }

    return result
  }

  async searchAssets(query: string): Promise<AssetPrice[]> {
    try {
      const response = await fetch(
        `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      const coins = data.coins?.slice(0, 10) || []
      
      const ids = coins.map((coin: any) => coin.id).join(',')
      if (!ids) return []

      const priceResponse = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}`
      )
      
      if (!priceResponse.ok) {
        return []
      }

      const priceData = await priceResponse.json()
      
      return priceData.map((item: any) => ({
        symbol: item.symbol.toUpperCase(),
        name: item.name,
        current_price: item.current_price,
        price_change_percentage_24h: item.price_change_percentage_24h || 0,
        last_updated: item.last_updated,
        image: item.image
      }))
    } catch (error) {
      console.error('Error searching assets:', error)
      return []
    }
  }
}

// Export singleton instance
export const priceService = new CoinGeckoService()