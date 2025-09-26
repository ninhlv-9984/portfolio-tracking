# Cryptocurrency Portfolio Tracker - Project Context

## 📋 Project Overview

A full-stack cryptocurrency portfolio tracking application with **user authentication** that allows users to manage their crypto investments with real-time price tracking, profit/loss calculations, and transaction history. Each user has their own isolated portfolio data.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui (styling)
- Zustand (state management - API-only, no localStorage)
- TanStack Query (React Query) for data fetching
- React Router DOM (routing and navigation)
- Recharts (data visualization)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- RESTful API architecture

## 📁 Project Structure

```
portfolio-tracking/
├── portfolio-app/              # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components (shadcn)
│   │   │   ├── PortfolioTable.tsx
│   │   │   ├── AddEditModal.tsx
│   │   │   ├── AssetAllocation.tsx
│   │   │   ├── PositionHistory.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   └── Auth.tsx
│   │   ├── stores/           # State management
│   │   │   ├── apiPortfolioStore.ts  # Portfolio store
│   │   │   ├── apiHistoryStore.ts    # History store
│   │   │   └── authStore.ts          # Authentication store
│   │   ├── services/         # External services
│   │   │   ├── api.ts        # Backend API client (with auth)
│   │   │   ├── priceManager.ts # Crypto price fetching
│   │   │   └── scraperService.ts # Fallback price scraper
│   │   ├── lib/              # Utilities
│   │   │   ├── utils.ts      # Formatting functions
│   │   │   └── auth.ts       # Auth API functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript definitions
│   │   └── data/             # Static data
│   │       └── cryptoAssets.ts # Crypto metadata (CoinGecko URLs)
│   └── package.json
│
└── portfolio-backend/          # Backend Node.js application
    ├── src/
    │   ├── server.ts          # Express server setup
    │   ├── db/
    │   │   ├── index.ts       # Database connection
    │   │   ├── schema.sql     # Initial schema
    │   │   └── migrations/    # Database migrations
    │   │       ├── migrate-add-users.sql
    │   │       ├── migrate-add-transaction-types.sql
    │   │       └── migrate-add-swap-type.sql
    │   ├── middleware/
    │   │   └── auth.ts        # JWT authentication middleware
    │   └── routes/
    │       ├── auth.ts        # Authentication endpoints
    │       ├── transactions.ts # Transaction CRUD (protected)
    │       └── history.ts     # History endpoints (protected)
    ├── .env                   # Environment variables
    └── package.json
```

## 🗄️ Database Schema

### PostgreSQL Tables

**users**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `username` (VARCHAR) - Unique username
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**transactions**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `asset` (VARCHAR) - Crypto symbol (BTC, ETH, etc.)
- `type` (ENUM) - 'buy', 'sell', 'deposit', 'withdraw', 'swap'
- `quantity` (DECIMAL) - Amount of crypto
- `price_usd` (DECIMAL) - Price per unit in USD
- `destination_asset` (VARCHAR) - For sells/swaps, which asset received
- `source_asset` (VARCHAR) - For swaps, which stablecoin used
- `transaction_date` (DATE) - Optional transaction date
- `notes` (TEXT) - Optional notes
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**history**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `action` (VARCHAR) - 'add', 'update', or 'delete'
- `transaction_id` (UUID) - Foreign key to transactions
- `asset` (VARCHAR)
- `type` (ENUM) - Transaction type
- `quantity` (DECIMAL)
- `price_usd` (DECIMAL)
- `destination_asset` (VARCHAR)
- `source_asset` (VARCHAR)
- `timestamp` (TIMESTAMP)

## 🔑 Key Features

### Authentication & Security
1. **User Management**
   - Registration with email and username
   - Login with email or username
   - JWT token authentication
   - Password hashing with bcrypt
   - Protected routes requiring authentication

2. **User Data Isolation**
   - Each user has separate portfolio
   - Transactions linked to user IDs
   - API endpoints filter by authenticated user

### Transaction Types
1. **Buy** - Purchase crypto with external funds
2. **Sell** - Sell crypto and receive stablecoins
3. **Swap** - Exchange stablecoins for crypto
4. **Deposit** - Add existing assets to portfolio
5. **Withdraw** - Remove assets from portfolio

### Core Functionality
1. **Transaction Management**
   - Add transactions (all types)
   - Delete transactions from history
   - Support for stablecoin destinations (USDT, USDC, BUSD)
   - Source stablecoin selection for swaps

2. **Portfolio Visualization**
   - Real-time portfolio value calculation
   - Profit/Loss tracking (total and per asset)
   - Asset allocation pie chart
   - Grouped view by asset with weighted average prices
   - Clean UI without edit/delete buttons in main view

3. **Price Data**
   - Primary: CoinGecko API integration
   - Fallback: Web scraper (Binance, CoinMarketCap)
   - Real-time price updates every 60 seconds
   - CoinGecko image URLs for crypto logos

4. **History Tracking**
   - Complete transaction history
   - Delete functionality in history view
   - Searchable and filterable
   - User-specific history

## 🔧 Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=cloud
DB_PASSWORD=cloud
DB_NAME=portfolio_tracker
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend
- API endpoint: `http://localhost:3001/api`
- Configured in `src/services/api.ts`
- Auth headers automatically included

## 🚀 Running the Application

### Prerequisites
1. PostgreSQL installed and running
2. Node.js 16+ installed

### Database Setup
```bash
# Create database
psql -U cloud
CREATE DATABASE portfolio_tracker;
\q

# Apply migrations (from portfolio-backend directory)
PGPASSWORD=cloud psql -U cloud -d portfolio_tracker -h localhost -f src/db/schema.sql
PGPASSWORD=cloud psql -U cloud -d portfolio_tracker -h localhost -f src/db/migrate-add-users.sql
PGPASSWORD=cloud psql -U cloud -d portfolio_tracker -h localhost -f src/db/migrate-add-transaction-types.sql
PGPASSWORD=cloud psql -U cloud -d portfolio_tracker -h localhost -f src/db/migrate-add-swap-type.sql
```

### Backend
```bash
cd portfolio-backend
npm install
npm run dev  # Runs on port 3001
```

### Frontend
```bash
cd portfolio-app
npm install
npm run dev  # Runs on port 5173
```

## 🎨 UI/UX Features

1. **Authentication Flow**
   - Login/Register forms with validation
   - Auto-redirect to auth page when not logged in
   - Session persistence across refreshes
   - User info display in header
   - Logout functionality

2. **Dark/Light Mode**: Automatic theme detection with manual toggle

3. **Number Formatting**:
   - Currency: $1,234.56
   - Crypto amounts: Smart formatting (0.5, 1.25, 0.00012345)
   - Percentages: Clean display

4. **Transaction Interface**:
   - 5 transaction types in modal (3x2 grid layout)
   - Stablecoin selection for swaps
   - Optional price for deposits/withdrawals
   - Clean main dashboard (no action buttons)
   - Delete-only functionality in history

## 📝 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Transactions (Protected - Requires JWT)
- `GET /api/transactions` - Get user's transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### History (Protected - Requires JWT)
- `GET /api/history` - Get user's history
- `GET /api/history/asset/:asset` - Get history by asset
- `GET /api/history/transaction/:id` - Get history by transaction

## 🔄 Recent Major Updates

1. **User Authentication System**
   - Complete JWT-based auth
   - User registration and login
   - Protected routes and API endpoints
   - User-specific data isolation

2. **Extended Transaction Types**
   - Added deposit, withdraw, and swap types
   - Swap allows using stablecoins to buy crypto
   - Deposit/withdraw for external wallet transfers

3. **UI Improvements**
   - Removed edit/delete buttons from main dashboard
   - Delete-only functionality in history
   - Fixed crypto logo 403 errors (switched to CoinGecko CDN)
   - Added user header with logout

4. **Database Enhancements**
   - Added users table
   - Added source_asset for swap transactions
   - User ID foreign keys on all tables

## 🐛 Known Issues & Solutions

### Issue 1: CoinGecko Rate Limiting
**Solution**: Implemented web scraper fallback using Binance/CoinMarketCap

### Issue 2: Crypto Logo 403 Errors
**Solution**: Switched from cryptologos.cc to CoinGecko's CDN

### Issue 3: PostgreSQL Decimals as Strings
**Solution**: `parseFloat()` conversion in frontend

### Issue 4: Transaction Types
**Solution**: Proper handling of all 5 transaction types with appropriate UI

## 🔐 Security Considerations

1. **Authentication**
   - JWT tokens expire after 7 days
   - Passwords hashed with bcrypt (10 rounds)
   - Token verification on app load
   - Protected API routes require valid JWT

2. **Data Protection**
   - User data isolation
   - SQL injection prevention via parameterized queries
   - Input validation on frontend and backend
   - No sensitive data in localStorage

3. **CORS Configuration**
   - Restricted to specific localhost ports in development
   - Credentials allowed for JWT cookies

## 💡 Development Tips

1. **Adding New Features**: Always consider user context
2. **Database Changes**: Update migrations and TypeScript types
3. **API Changes**: Update both frontend and backend auth headers
4. **Testing Auth**: Create multiple users to test isolation
5. **Transaction Logic**: Handle all 5 types appropriately

## 📦 Key Dependencies

**Frontend**:
- `react-router-dom` - Routing (v7.9.2)
- `zustand` - State management (v4.5.5)
- `@tanstack/react-query` - Data fetching (v5.62.7)
- `recharts` - Charts (v2.13.3)

**Backend**:
- `jsonwebtoken` - JWT auth (latest)
- `bcrypt` - Password hashing (latest)
- `pg` - PostgreSQL client (v8.13.1)
- `express` - Web framework (v4.21.2)

## 🎯 Usage Flow

1. **New User**:
   - Navigate to app → Redirected to `/auth`
   - Register with email, username, password
   - Automatically logged in
   - Start adding transactions

2. **Existing User**:
   - Login with email/username and password
   - View portfolio dashboard
   - Add transactions (buy/sell/swap/deposit/withdraw)
   - Track P&L and allocation
   - View history
   - Logout when done

3. **Transaction Flow**:
   - **Buy**: Add new crypto with USD
   - **Sell**: Convert crypto to stablecoin
   - **Swap**: Use stablecoin to buy crypto
   - **Deposit**: Add existing holdings
   - **Withdraw**: Remove from tracking

---

*Last Updated: September 2025*
*This documentation provides complete context for AI assistants to understand and work with the project effectively, including all authentication and recent feature additions.*