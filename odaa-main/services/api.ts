
import { User, Transaction, MarketOrder, ActiveTrade } from '../types';

// Cast import.meta to any to resolve TS error about missing env property on ImportMeta
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const user = localStorage.getItem('odaa_session_v30');
  const token = user ? JSON.parse(user).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // Data Fetching
  async getDashboardData() {
    const res = await fetch(`${API_URL}/users/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  async getTree() {
    const res = await fetch(`${API_URL}/users/tree`, { headers: getHeaders() });
    return res.json();
  }
};
