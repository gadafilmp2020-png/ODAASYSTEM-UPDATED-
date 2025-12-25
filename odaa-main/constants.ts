
import { Rank, User, Transaction, Role, Permission } from './types';

// Helper to generate dates
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const ADMIN_USER_ID = 'admin1';
export const JOINING_FEE_AMOUNT = 1000.00; // 1000 OTF = 1000 PV
export const REFERRAL_BONUS_PERCENT = 0.15; // 15% Direct Referral
export const MATCHING_BONUS_PERCENT = 0.10; // 10% Binary Match of Weak Leg

// Fix: Exports required by System.tsx
export const REFERRAL_BONUS_AMOUNT = JOINING_FEE_AMOUNT * REFERRAL_BONUS_PERCENT;
export const MATCHING_BONUS_AMOUNT = JOINING_FEE_AMOUNT * MATCHING_BONUS_PERCENT;

export const INITIAL_COMPANY_CAPITAL = 100000;
export const OTF_VALUE_ETB = 1.19; // Official Rate

// --- CENTRALIZED COMPANY PAYMENT DETAILS ---
export const COMPANY_BANK_DETAILS = {
  bankName: 'Commercial Bank of Ethiopia',
  accountNumber: '1000998877665',
  accountName: 'Odaa Global Systems'
};

export const COMPANY_CRYPTO_DETAILS = {
  exchange: 'Binance',
  network: 'BEP20 (BSC)',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
};

// --- SECURITY PROTOCOL & POLICIES ---
export const ROLE_POLICIES: Record<Role, Permission[]> = {
  ADMIN: [
    'VIEW_ADMIN_CONSOLE',
    'MANAGE_FINANCES',
    'MANAGE_USERS',
    'VIEW_GLOBAL_TREE',
    'VIEW_MEMBER_DASHBOARD', 
    'ACCESS_WALLET', 
    'P2P_TRADE', 
    'REGISTER_MEMBERS',
    'VIEW_TEAM'
  ],
  MEMBER: [
    'VIEW_MEMBER_DASHBOARD',
    'ACCESS_WALLET', 
    'P2P_TRADE', 
    'REGISTER_MEMBERS',
    'VIEW_TEAM'
  ],
  SUPPORT: [
    'VIEW_ADMIN_CONSOLE',
    'MANAGE_USERS',
    'VIEW_GLOBAL_TREE'
  ]
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_POLICIES[role]?.includes(permission) || false;
};

export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'System Root',
    username: 'admin',
    email: 'root@odaasystem.com',
    role: 'ADMIN',
    joinDate: '2023-01-01',
    rank: Rank.DIAMOND,
    parentId: null,
    leg: null,
    sponsorId: null,
    balance: INITIAL_COMPANY_CAPITAL,
    honeyBalance: 5000,
    coffeeBalance: 5000,
    totalEarnings: 0,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=84cc16',
    downlineCount: 0,
    status: 'ACTIVE',
    password: 'admin',
    transactionPin: '1234',
    binaryLeftCount: 0,
    binaryRightCount: 0,
    binaryLeftVolume: 0,
    binaryRightVolume: 0,
    binaryPaidVolume: 0,
    careerVolume: 0,
    binaryPaidPairs: 0,
    phoneNumber: '+251900000000',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isTwoFactorEnabled: false,
    twoFactorSecret: ''
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];
