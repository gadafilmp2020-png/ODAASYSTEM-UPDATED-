
import { User, Transaction, MarketOrder, ActiveTrade, Rank } from '../types';
import { MOCK_USERS, MOCK_TRANSACTIONS, INITIAL_COMPANY_CAPITAL } from '../constants';

// --- MOCK DATABASE HELPER (Client-Side) ---
// Must match System.tsx STORAGE_VERSION
const STORAGE_VERSION = 'v31_LIVE_STABLE'; 
const STORAGE_KEYS = {
    USERS: `odaa_users_${STORAGE_VERSION}`,
    TRANSACTIONS: `odaa_tx_${STORAGE_VERSION}`
};

const mockDb = {
    getUsers: (): User[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USERS);
            let users: User[] = stored ? JSON.parse(stored) : [...MOCK_USERS];
            
            // Critical: Ensure Admin always exists for Demo Access
            const adminExists = users.some(u => u.username === 'admin');
            if (!adminExists) {
                const defaultAdmin = MOCK_USERS.find(u => u.role === 'ADMIN');
                if (defaultAdmin) {
                    users.push(defaultAdmin);
                    // Persist immediate fix
                    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                }
            }
            return users;
        } catch { return MOCK_USERS; }
    },
    saveUser: (user: User) => {
        const users = mockDb.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) users[index] = user;
        else users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },
    findUser: (username: string): User | undefined => {
        return mockDb.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    }
};

// --- REAL API LOGIC ---

const getBaseUrl = () => {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Production: Point to the API subdomain
    return 'https://api.etcareproduct.com/api';
};

const API_URL = getBaseUrl();

// Helper to safely parse JSON or throw specific error to trigger fallback
const handleResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
        return data;
    } else {
        // If we get HTML (404/500) from cPanel, throw error
        throw new Error("API_UNREACHABLE");
    }
};

const getHeaders = () => {
  const session = localStorage.getItem('odaa_session_v30');
  const token = session ? JSON.parse(session).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// --- API EXPORT WITH AUTOMATIC FALLBACK ---

export const api = {
  // Auth
  async login(credentials: any) {
    try {
        // 1. Try Real Backend
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        return await handleResponse(res);
    } catch (e: any) {
        console.warn("[API] Server unreachable, using local mock:", e.message);
        
        // 2. Mock Fallback
        const users = mockDb.getUsers();
        const user = users.find(u => u.username.toLowerCase() === credentials.username.toLowerCase());
        
        // Allow admin/admin or matched password
        if (user && (user.password === credentials.password || (credentials.username === 'admin' && credentials.password === 'admin'))) {
             // Simulate Token Response
             return { ...user, token: 'mock-jwt-token-123' };
        }
        throw new Error("Invalid credentials (Mock Mode)");
    }
  },

  async register(data: any) {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await handleResponse(res);
    } catch (e: any) {
        console.warn("[API] Server unreachable, using local mock:", e.message);
        
        // Mock Registration
        const existing = mockDb.findUser(data.username);
        if (existing) throw new Error("User already exists");

        const newUser: User = {
            id: `u-${Date.now()}`,
            ...data,
            role: 'MEMBER',
            balance: 0,
            totalEarnings: 0,
            rank: Rank.MEMBER,
            joinDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            avatar: `https://ui-avatars.com/api/?name=${data.name}`,
            downlineCount: 0,
            binaryLeftCount: 0, 
            binaryRightCount: 0,
            binaryPaidPairs: 0,
            kycStatus: 'NONE'
        };
        mockDb.saveUser(newUser);
        return { ...newUser, token: 'mock-jwt-token-new' };
    }
  },

  // Data Fetching
  async getDashboardData() {
    try {
        const res = await fetch(`${API_URL}/users/dashboard`, { headers: getHeaders() });
        return await handleResponse(res);
    } catch (e) {
        // Fallback: Get current user from session and reload from mock db
        const session = localStorage.getItem('odaa_session_v30');
        if (session) {
            const { id } = JSON.parse(session);
            const users = mockDb.getUsers();
            const user = users.find(u => u.id === id);
            if (user) return { user, transactions: [] }; // Return empty tx for now
        }
        throw new Error('Session Expired');
    }
  },

  async getTree() {
    try {
        const res = await fetch(`${API_URL}/users/tree`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Tree fetch failed");
        return await res.json();
    } catch (e) {
        console.warn("[API] Fetching local tree");
        return mockDb.getUsers();
    }
  }
};
