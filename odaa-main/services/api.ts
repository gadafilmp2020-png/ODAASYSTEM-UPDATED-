
import { User, Transaction, MarketOrder, ActiveTrade } from '../types';
import { MOCK_USERS } from '../constants';

// Keys matched to System.tsx to ensure shared data access
const STORAGE_KEYS = {
    USERS: 'odaa_users_v12',
    MARKET: 'odaa_market_v12',
    TRADES: 'odaa_trades_v12'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocal = (key: string, def: any) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : def;
    } catch { return def; }
};

// API is now primarily a set of helpers for the System component
// Most state mutation logic has been moved to System.tsx to ensure React state consistency
export const api = {
  async getMarketOrders() { 
      await delay(500);
      return getLocal(STORAGE_KEYS.MARKET, []);
  },

  async getActiveTrades(userId: string) { 
      await delay(300);
      const trades = getLocal(STORAGE_KEYS.TRADES, []);
      return trades.filter((t: ActiveTrade) => t.buyerId === userId || t.sellerId === userId);
  },

  // Helper to generate IDs
  generateId(prefix: string = 'id') {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
