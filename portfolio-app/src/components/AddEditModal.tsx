import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { DatePicker } from './ui/date-picker'
import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import type { PortfolioEntry, TransactionType } from '@/types/portfolio'
import { usePortfolioStore } from '@/stores/apiPortfolioStore'
import { CRYPTO_ASSETS, searchAssets, type CryptoAsset } from '@/data/cryptoAssets'

interface AddEditModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: PortfolioEntry
}


export function AddEditModal({ isOpen, onClose, entry }: AddEditModalProps) {
  const addEntry = usePortfolioStore((state) => state.addEntry)
  const updateEntry = usePortfolioStore((state) => state.updateEntry)

  const [formData, setFormData] = useState({
    asset: '',
    type: 'buy' as TransactionType,
    quantity: '',
    buy_price_usd: '',
    destination_asset: 'USDT',
    source_asset: 'USDT',
    buy_date: '',
    notes: ''
  })
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<CryptoAsset[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | undefined>()
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (entry) {
      const asset = CRYPTO_ASSETS.find(a => a.symbol === entry.asset)
      setSelectedAsset(asset)
      setFormData({
        asset: entry.asset,
        type: entry.type || 'buy',
        quantity: entry.quantity.toString(),
        buy_price_usd: entry.buy_price_usd.toString(),
        destination_asset: entry.destination_asset || 'USDT',
        source_asset: entry.source_asset || 'USDT',
        buy_date: entry.buy_date || '',
        notes: entry.notes || ''
      })
      if (entry.buy_date) {
        setSelectedDate(new Date(entry.buy_date))
      }
    } else {
      setFormData({
        asset: '',
        type: 'buy',
        quantity: '',
        buy_price_usd: '',
        destination_asset: 'USDT',
        source_asset: 'USDT',
        buy_date: '',
        notes: ''
      })
      setSelectedAsset(undefined)
      setSelectedDate(undefined)
    }
    setErrors({})
    setSuggestions([])
    setShowSuggestions(false)
  }, [entry, isOpen])

  const handleAssetInputChange = (value: string) => {
    setFormData({ ...formData, asset: value })
    setSelectedAsset(undefined)
    
    if (value.length > 0) {
      const results = searchAssets(value)
      setSuggestions(results.slice(0, 8)) // Show max 8 suggestions
      setShowSuggestions(true)
      setHighlightedIndex(-1)
    } else {
      setSuggestions(CRYPTO_ASSETS.slice(0, 8)) // Show popular assets when empty
      setShowSuggestions(true)
      setHighlightedIndex(-1)
    }
  }

  const selectAsset = (asset: CryptoAsset) => {
    setFormData({ ...formData, asset: asset.symbol })
    setSelectedAsset(asset)
    setShowSuggestions(false)
    setSuggestions([])
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectAsset(suggestions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setFormData({ ...formData, buy_date: date.toISOString().split('T')[0] })
    } else {
      setFormData({ ...formData, buy_date: '' })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.asset) {
      newErrors.asset = 'Asset is required'
    } else if (!CRYPTO_ASSETS.find(a => a.symbol === formData.asset)) {
      newErrors.asset = 'Please select a valid cryptocurrency'
    }

    const quantity = parseFloat(formData.quantity)
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive number'
    }

    // Check if asset is a stablecoin
    const isStablecoin = ['USDT', 'USDC', 'BUSD'].includes(formData.asset)

    // Price validation logic
    if (formData.type === 'withdraw') {
      // Price is optional for withdrawals
      if (formData.buy_price_usd) {
        const price = parseFloat(formData.buy_price_usd)
        if (isNaN(price) || price <= 0) {
          newErrors.buy_price_usd = 'Price must be a positive number if provided'
        }
      }
    } else if (formData.type === 'deposit' && isStablecoin) {
      // For stablecoin deposits, price is optional (defaults to $1)
      if (formData.buy_price_usd) {
        const price = parseFloat(formData.buy_price_usd)
        if (isNaN(price) || price <= 0) {
          newErrors.buy_price_usd = 'Price must be a positive number if provided'
        }
      }
    } else {
      // Price is required for buy, sell, swap, and non-stablecoin deposits
      const price = parseFloat(formData.buy_price_usd)
      if (!formData.buy_price_usd || isNaN(price) || price <= 0) {
        newErrors.buy_price_usd = 'Price must be a positive number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // For stablecoin deposits without price, default to $1
    const isStablecoin = ['USDT', 'USDC', 'BUSD'].includes(formData.asset)
    let finalPrice = formData.buy_price_usd ? parseFloat(formData.buy_price_usd) : 0
    if (formData.type === 'deposit' && isStablecoin && !formData.buy_price_usd) {
      finalPrice = 1 // Stablecoins default to $1
    }

    const data = {
      asset: formData.asset,
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      buy_price_usd: finalPrice,
      destination_asset: formData.type === 'sell' ? formData.destination_asset : undefined,
      source_asset: formData.type === 'swap' ? formData.source_asset : undefined,
      buy_date: formData.buy_date || undefined,
      notes: formData.notes || undefined
    }

    if (entry) {
      updateEntry(entry.id, data)
    } else {
      addEntry(data)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{entry ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            <DialogDescription>
              {entry ? 'Update your transaction details' : 'Add a new transaction to your portfolio'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'buy' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'buy' })}
                  className="w-full"
                  size="sm"
                >
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'sell' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'sell' })}
                  className="w-full"
                  size="sm"
                >
                  Sell
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'swap' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'swap' })}
                  className="w-full"
                  size="sm"
                >
                  Swap
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'deposit' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'deposit' })}
                  className="w-full"
                  size="sm"
                >
                  Deposit
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'withdraw' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'withdraw' })}
                  className="w-full"
                  size="sm"
                >
                  Withdraw
                </Button>
              </div>
              {formData.type === 'swap' && (
                <p className="text-xs text-muted-foreground">
                  Use stablecoins from your portfolio to buy other crypto
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="asset">Asset</Label>
              <div className="relative">
                <div className="relative">
                  {selectedAsset && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <img 
                        src={selectedAsset.logo} 
                        alt={selectedAsset.name}
                        className="w-5 h-5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <Input
                    ref={inputRef}
                    id="asset"
                    value={formData.asset}
                    onChange={(e) => handleAssetInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (formData.asset.length === 0) {
                        setSuggestions(CRYPTO_ASSETS.slice(0, 8))
                        setShowSuggestions(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    placeholder="Search for a cryptocurrency..."
                    className={`${errors.asset ? 'border-red-500' : ''} ${selectedAsset ? 'pl-10' : ''}`}
                    autoComplete="off"
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {suggestions.map((asset, index) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors ${
                          highlightedIndex === index ? 'bg-muted' : ''
                        }`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => selectAsset(asset)}
                      >
                        <img 
                          src={asset.logo} 
                          alt={asset.name}
                          className="w-6 h-6"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">{asset.name}</div>
                        </div>
                        {selectedAsset?.symbol === asset.symbol && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.asset && (
                <p className="text-sm text-red-500">{errors.asset}</p>
              )}
            </div>

            {formData.type === 'sell' && (
              <div className="grid gap-2">
                <Label>Receive Currency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['USDT', 'USDC', 'BUSD'].map((currency) => (
                    <Button
                      key={currency}
                      type="button"
                      variant={formData.destination_asset === currency ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, destination_asset: currency })}
                      className="w-full"
                    >
                      {currency}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  The stablecoin you'll receive from this sale
                </p>
              </div>
            )}

            {formData.type === 'swap' && (
              <div className="grid gap-2">
                <Label>Use Stablecoin</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['USDT', 'USDC', 'BUSD'].map((currency) => (
                    <Button
                      key={currency}
                      type="button"
                      variant={formData.source_asset === currency ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, source_asset: currency })}
                      className="w-full"
                    >
                      {currency}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  The stablecoin from your portfolio to use for this purchase
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1.5"
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="buy_price_usd">
                  {formData.type === 'deposit' ? 'Price at Deposit' : formData.type === 'withdraw' ? 'Price at Withdrawal' : formData.type === 'swap' ? 'Swap' : formData.type === 'buy' ? 'Buy' : 'Sell'} Price (USD)
                </Label>
                <Input
                  id="buy_price_usd"
                  type="number"
                  step="any"
                  value={formData.buy_price_usd}
                  onChange={(e) => setFormData({ ...formData, buy_price_usd: e.target.value })}
                  placeholder={
                    formData.type === 'withdraw' ? 'Optional - current price' :
                    (formData.type === 'deposit' && ['USDT', 'USDC', 'BUSD'].includes(formData.asset)) ? 'Optional - defaults to $1' :
                    '50000'
                  }
                  className={errors.buy_price_usd ? 'border-red-500' : ''}
                />
                {errors.buy_price_usd && (
                  <p className="text-sm text-red-500">{errors.buy_price_usd}</p>
                )}
                {formData.type === 'deposit' && (
                  <p className="text-xs text-muted-foreground">
                    {['USDT', 'USDC', 'BUSD'].includes(formData.asset)
                      ? 'Optional for stablecoins (defaults to $1)'
                      : 'Enter the price when you acquired these assets for accurate P&L tracking'
                    }
                  </p>
                )}
                {formData.type === 'withdraw' && (
                  <p className="text-xs text-muted-foreground">
                    Optional - price when withdrawing (for record keeping)
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buy_date">
                {formData.type === 'buy' ? 'Buy' : formData.type === 'sell' ? 'Sell' : formData.type === 'swap' ? 'Swap' : formData.type === 'deposit' ? 'Deposit' : 'Withdraw'} Date (Optional)
              </Label>
              <DatePicker 
                date={selectedDate} 
                onDateChange={handleDateChange}
                placeholder="Select transaction date"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>

            {formData.quantity && formData.buy_price_usd && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {formData.type === 'deposit' ? 'Deposit Value (Cost Basis)' : formData.type === 'withdraw' ? 'Withdrawal Value' : formData.type === 'sell' ? 'Sale Proceeds' : formData.type === 'swap' ? 'Swap Value' : 'Total Investment'}
                </div>
                <div className="text-lg font-semibold">
                  ${(parseFloat(formData.quantity) * parseFloat(formData.buy_price_usd)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {entry ? 'Update' : 'Add'} Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
