const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Transaction {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  quantity: number;
  price_usd: number;
  destination_asset?: string;
  transaction_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  transaction_id: string;
  asset: string;
  type?: 'buy' | 'sell';
  destination_asset?: string;
  quantity: number;
  price_usd: number;
  transaction_date?: string;
  notes?: string;
  timestamp: string;
}

class ApiService {
  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Check if it's a network error (CORS or connection issue)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Backend connection failed. Make sure the backend server is running on http://localhost:3001');
        throw new Error('Cannot connect to backend server. Please make sure the backend is running.');
      }
      throw error;
    }
  }

  // Transaction endpoints
  async getTransactions(): Promise<Transaction[]> {
    return this.fetchWithError(`${API_BASE_URL}/transactions`);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.fetchWithError(`${API_BASE_URL}/transactions/${id}`);
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return this.fetchWithError(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return this.fetchWithError(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.fetchWithError(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // History endpoints
  async getHistory(): Promise<HistoryEntry[]> {
    return this.fetchWithError(`${API_BASE_URL}/history`);
  }

  async getHistoryByAsset(asset: string): Promise<HistoryEntry[]> {
    return this.fetchWithError(`${API_BASE_URL}/history/asset/${asset}`);
  }

  async getHistoryByTransaction(transactionId: string): Promise<HistoryEntry[]> {
    return this.fetchWithError(`${API_BASE_URL}/history/transaction/${transactionId}`);
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.fetchWithError(`${API_BASE_URL.replace('/api', '')}/health`);
      return true;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();