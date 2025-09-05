import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value)
}

export const formatCryptoAmount = (amount: number | string): string => {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Check for invalid numbers
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '0'
  }
  
  // For whole numbers, show no decimals
  if (numAmount >= 1 && numAmount % 1 === 0) {
    return numAmount.toString()
  }
  
  // For amounts >= 1, show up to 2 decimals
  if (numAmount >= 1) {
    return parseFloat(numAmount.toFixed(2)).toString()
  }
  
  // For small amounts < 1, show up to 8 decimals but remove trailing zeros
  if (numAmount < 1 && numAmount > 0) {
    return parseFloat(numAmount.toFixed(8)).toString()
  }
  
  return numAmount.toString()
}