import axios from 'axios';
import type { PortfolioResponse, SyncResponse, HistoryResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const portfolioApi = {
  getCurrentPortfolio: async (): Promise<PortfolioResponse> => {
    const { data } = await api.get<PortfolioResponse>('/portfolio/current');
    return data;
  },

  syncPortfolio: async (): Promise<SyncResponse> => {
    const { data } = await api.post<SyncResponse>('/portfolio/sync');
    return data;
  },

  getHistory: async (limit: number = 30): Promise<HistoryResponse> => {
    const { data } = await api.get<HistoryResponse>(`/portfolio/history?limit=${limit}`);
    return data;
  },

  createSnapshot: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/portfolio/snapshot');
    return data;
  },
};

export default api;
