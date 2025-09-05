import type { AssetPrice } from '../types/portfolio'
import { priceService } from './priceService'
import { scraperService } from './scraperService'

export type PriceSource = 'api' | 'scraper' | 'auto'

class PriceManager {
  private currentSource: PriceSource = 'auto'
  private lastApiError: Date | null = null
  private apiErrorCount = 0
  private maxApiErrors = 3

  setSource(source: PriceSource) {
    this.currentSource = source
    console.log(`Price source set to: ${source}`)
  }

  async getPrices(symbols: string[]): Promise<{
    prices: Map<string, AssetPrice>
    source: 'api' | 'scraper'
    message?: string
  }> {
    if (this.currentSource === 'scraper') {
      const prices = await scraperService.getPrices(symbols)
      return { prices, source: 'scraper' }
    }

    if (this.currentSource === 'api') {
      try {
        const prices = await priceService.getPrices(symbols)
        this.apiErrorCount = 0
        return { prices, source: 'api' }
      } catch (error) {
        console.error('API error:', error)
        return { 
          prices: new Map(), 
          source: 'api',
          message: 'API failed, please switch to scraper mode'
        }
      }
    }

    // Auto mode: try API first, fallback to scraper
    try {
      const prices = await priceService.getPrices(symbols)
      
      // Check if we got valid prices
      if (prices.size === 0 && symbols.length > 0) {
        throw new Error('No prices returned from API')
      }

      this.apiErrorCount = 0
      return { prices, source: 'api' }
    } catch (apiError) {
      console.log('API failed, using scraper fallback')
      this.apiErrorCount++
      this.lastApiError = new Date()

      try {
        const prices = await scraperService.getPrices(symbols)
        return { 
          prices, 
          source: 'scraper',
          message: 'Using alternative data source due to API rate limits'
        }
      } catch (scraperError) {
        console.error('Both API and scraper failed:', scraperError)
        return {
          prices: new Map(),
          source: 'scraper',
          message: 'Unable to fetch prices. Please try again later.'
        }
      }
    }
  }

  shouldUseScraperOnly(): boolean {
    if (!this.lastApiError) return false
    const timeSinceError = Date.now() - this.lastApiError.getTime()
    const cooldownPeriod = 60000 * this.apiErrorCount // Increase cooldown with each error
    return this.apiErrorCount >= this.maxApiErrors || timeSinceError < cooldownPeriod
  }

  resetApiErrors() {
    this.apiErrorCount = 0
    this.lastApiError = null
  }
}

export const priceManager = new PriceManager()