import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import type { PortfolioEntry } from '@/types/portfolio'
import { usePortfolioStore } from '@/stores/portfolioStore'

interface AddEditModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: PortfolioEntry
}

const SUPPORTED_ASSETS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 
  'AVAX', 'LINK', 'MATIC', 'NEAR', 'APT', 'ARB', 'OP'
]

export function AddEditModal({ isOpen, onClose, entry }: AddEditModalProps) {
  const addEntry = usePortfolioStore((state) => state.addEntry)
  const updateEntry = usePortfolioStore((state) => state.updateEntry)
  
  const [formData, setFormData] = useState({
    asset: '',
    quantity: '',
    buy_price_usd: '',
    buy_date: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (entry) {
      setFormData({
        asset: entry.asset,
        quantity: entry.quantity.toString(),
        buy_price_usd: entry.buy_price_usd.toString(),
        buy_date: entry.buy_date || '',
        notes: entry.notes || ''
      })
    } else {
      setFormData({
        asset: '',
        quantity: '',
        buy_price_usd: '',
        buy_date: '',
        notes: ''
      })
    }
    setErrors({})
  }, [entry, isOpen])

  const handleAssetChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setFormData({ ...formData, asset: upperValue })
    
    if (upperValue) {
      const filtered = SUPPORTED_ASSETS.filter(asset => 
        asset.startsWith(upperValue) && asset !== upperValue
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.asset) {
      newErrors.asset = 'Asset is required'
    } else if (!SUPPORTED_ASSETS.includes(formData.asset)) {
      newErrors.asset = 'Please select a supported asset'
    }
    
    const quantity = parseFloat(formData.quantity)
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive number'
    }
    
    const price = parseFloat(formData.buy_price_usd)
    if (!formData.buy_price_usd || isNaN(price) || price <= 0) {
      newErrors.buy_price_usd = 'Buy price must be a positive number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    const data = {
      asset: formData.asset,
      quantity: parseFloat(formData.quantity),
      buy_price_usd: parseFloat(formData.buy_price_usd),
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{entry ? 'Edit Position' : 'Add Position'}</DialogTitle>
            <DialogDescription>
              {entry ? 'Update your portfolio position' : 'Add a new position to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Asset</Label>
              <div className="relative">
                <Input
                  id="asset"
                  value={formData.asset}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  placeholder="BTC, ETH, etc."
                  className={errors.asset ? 'border-red-500' : ''}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-10">
                    {suggestions.map(asset => (
                      <button
                        key={asset}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, asset })
                          setSuggestions([])
                        }}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.asset && (
                <p className="text-sm text-red-500">{errors.asset}</p>
              )}
            </div>
            
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
              <Label htmlFor="buy_price_usd">Buy Price (USD)</Label>
              <Input
                id="buy_price_usd"
                type="number"
                step="any"
                value={formData.buy_price_usd}
                onChange={(e) => setFormData({ ...formData, buy_price_usd: e.target.value })}
                placeholder="50000"
                className={errors.buy_price_usd ? 'border-red-500' : ''}
              />
              {errors.buy_price_usd && (
                <p className="text-sm text-red-500">{errors.buy_price_usd}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="buy_date">Buy Date (Optional)</Label>
              <Input
                id="buy_date"
                type="date"
                value={formData.buy_date}
                onChange={(e) => setFormData({ ...formData, buy_date: e.target.value })}
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