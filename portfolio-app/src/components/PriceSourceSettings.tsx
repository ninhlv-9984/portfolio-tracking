import { useState } from 'react'
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface PriceSourceSettingsProps {
  onSourceChange?: (source: 'api' | 'scraper' | 'auto') => void
}

export function PriceSourceSettings({ onSourceChange }: PriceSourceSettingsProps) {
  const [priceSource, setPriceSource] = useState<'api' | 'scraper' | 'auto'>('auto')
  const [autoFallback, setAutoFallback] = useState(true)

  const handleSourceChange = (source: 'api' | 'scraper' | 'auto') => {
    setPriceSource(source)
    onSourceChange?.(source)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Price Source Settings</DialogTitle>
          <DialogDescription>
            Configure how the app fetches cryptocurrency prices
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-fallback" className="flex flex-col">
                <span>Automatic Fallback</span>
                <span className="text-xs text-muted-foreground">
                  Automatically switch to scraper if API fails
                </span>
              </Label>
              <Switch
                id="auto-fallback"
                checked={autoFallback}
                onCheckedChange={setAutoFallback}
              />
            </div>

            <div className="space-y-2">
              <Label>Price Source</Label>
              <div className="space-y-2">
                <button
                  onClick={() => handleSourceChange('auto')}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    priceSource === 'auto' 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 
                      className={`h-5 w-5 mt-0.5 ${
                        priceSource === 'auto' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">Auto (Recommended)</div>
                      <div className="text-sm text-muted-foreground">
                        Try CoinGecko API first, fallback to scraper if rate limited
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSourceChange('api')}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    priceSource === 'api' 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 
                      className={`h-5 w-5 mt-0.5 ${
                        priceSource === 'api' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">CoinGecko API</div>
                      <div className="text-sm text-muted-foreground">
                        Fast and reliable but has rate limits (10-30 calls/min)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSourceChange('scraper')}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    priceSource === 'scraper' 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 
                      className={`h-5 w-5 mt-0.5 ${
                        priceSource === 'scraper' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">Web Scraper</div>
                      <div className="text-sm text-muted-foreground">
                        No rate limits, uses Binance & CoinMarketCap public data
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Rate Limit Notice</p>
                <p className="text-xs mt-1">
                  The free CoinGecko API has strict rate limits. If you encounter errors, 
                  the app will automatically switch to the scraper service.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• API updates: Every 60 seconds</p>
            <p>• Scraper updates: Every 60 seconds</p>
            <p>• Local cache: 60 seconds</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}