# Portfolio Tracker

A modern, responsive cryptocurrency portfolio tracking application built with React, TypeScript, and Vite.

## Features

### Core Functionality
- **Portfolio Management**: Add, edit, and delete portfolio entries with fields for asset, quantity, buy price, buy date, and notes
- **Dual Price Sources**: 
  - Primary: CoinGecko API for accurate data
  - Fallback: Web scraper using Binance & CoinMarketCap public data (no API key needed)
  - Automatic switching when rate limits are hit
- **Smart Caching**: 60-second cache to minimize API calls
- **Real-Time Metrics**: Live price updates every 60 seconds
- **P/L Tracking**: Track unrealized profit/loss per position and total portfolio
- **Sorting & Filtering**: Sort by value, P/L, or asset name, with search functionality
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Local Storage**: Portfolio data persists locally using Zustand

### UI Features
- Clean, modern design with TailwindCSS
- Responsive layout that works on all devices
- Empty state with clear call-to-action
- Loading indicators and error states
- Smooth animations and transitions
- Currency formatting with Intl.NumberFormat

### Technical Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Price Data**: CoinGecko API (free tier)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## Supported Assets

Currently supports the following cryptocurrencies:
- BTC (Bitcoin)
- ETH (Ethereum)
- BNB (Binance Coin)
- XRP (Ripple)
- ADA (Cardano)
- SOL (Solana)
- DOT (Polkadot)
- DOGE (Dogecoin)
- AVAX (Avalanche)
- LINK (Chainlink)
- MATIC (Polygon)
- NEAR (Near)
- APT (Aptos)
- ARB (Arbitrum)
- OP (Optimism)

## Usage

1. **Adding a Position**: Click "Add Position" button, enter asset ticker, quantity, and buy price
2. **Viewing Metrics**: The totals bar shows aggregate portfolio value, total P/L, and 24h change
3. **Sorting**: Click column headers to sort by value, P/L, or P/L percentage
4. **Searching**: Use the search bar to filter by ticker or asset name
5. **Theme**: Toggle between light and dark mode using the theme button
6. **Refresh**: Manual refresh button updates prices immediately

## Architecture

### Price Service
The app uses a dual-source price fetching system to avoid rate limits:

#### Primary: CoinGecko API
- Free tier with rate limits (10-30 calls/min)
- Provides comprehensive data including images and market info
- 60-second cache to stay within limits

#### Fallback: Web Scraper
- Fetches from Binance API (no key required)
- Secondary source: CoinMarketCap public endpoints
- Activates automatically when API fails
- No rate limits for basic ticker data

#### Smart Switching
- Auto mode (default): Tries API first, falls back to scraper
- Manual mode: Force use of API or scraper
- Visual indicators show which source is active
- Configurable via settings panel

### State Management
Portfolio data is managed with Zustand and persisted to localStorage. The store handles:
- CRUD operations for portfolio entries
- Automatic timestamp tracking
- Data validation

### Performance Optimizations
- React Query for intelligent data caching and refetching
- Memoized calculations for portfolio metrics
- Virtualized rendering ready (scaffold in place)
- Debounced search input

## Future Enhancements

The following features are scaffolded but not fully implemented:
- CSV import/export functionality
- Multiple portfolio support with tabs
- Mini sparkline charts for 24h price movement
- Base currency switching (USD/EUR/VND)
- API backend integration (clean seam ready)

## Development

### Project Structure
```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── services/        # External service integrations
├── stores/          # Zustand stores
├── types/           # TypeScript type definitions
└── lib/            # Utility functions
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
