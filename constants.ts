
import { Rank, User, Transaction } from './types';

// Helper to generate dates
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const ADMIN_USER_ID = 'admin1';
export const REFERRAL_BONUS_AMOUNT = 50.00; // Direct Referral
export const MATCHING_BONUS_AMOUNT = 100.00; // 1:1 Binary Match
export const JOINING_FEE_AMOUNT = 1000.00; // New Member Fee
export const INITIAL_COMPANY_CAPITAL = 0; // Starting Balance
export const OTF_VALUE_USD = 0.025; // Keep for reference
export const OTF_VALUE_ETB = 1.19; // New ETB Rate

export const COMPANY_BANK_DETAILS = {
  bankName: 'Commercial Bank of Ethiopia',
  accountNumber: '1000123456789',
  accountName: 'Odaa System LLC'
};

export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Odaa Administrator',
    username: 'admin',
    email: 'admin@odaasystem.com',
    role: 'ADMIN',
    joinDate: '2023-01-01',
    rank: Rank.DIAMOND,
    parentId: null,
    leg: null,
    sponsorId: null,
    balance: 999999.00,
    totalEarnings: 0,
    // Dark theme avatar
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=18181b&color=84cc16', 
    downlineCount: 0,
    status: 'ACTIVE',
    password: 'admin', // Default admin password
    binaryLeftCount: 0,
    binaryRightCount: 0,
    binaryPaidPairs: 0,
    phoneNumber: '+251900000000',
    kycStatus: 'VERIFIED',
    isOnline: true 
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];
