export interface Holding {
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

export interface Portfolio {
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercentage: number;
  lastUpdated: string;
}

export interface PortfolioResponse {
  success: boolean;
  portfolio: Portfolio;
}

export interface SyncResponse {
  success: boolean;
  syncResult: {
    newFills: number;
    totalFills: number;
  };
  portfolio: Portfolio;
}

export interface Snapshot {
  id: number;
  timestamp: string;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  data: Portfolio;
}

export interface HistoryResponse {
  success: boolean;
  snapshots: Snapshot[];
}
