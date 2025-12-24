
export enum Rank {
  MEMBER = 'Distributor',
  LEADER = 'Star Agent',
  MANAGER = 'Ruby Manager',
  DIRECTOR = 'Emerald Director',
  DIAMOND = 'Crown Diamond'
}

export type Role = 'ADMIN' | 'MEMBER' | 'SUPPORT';
export type Language = 'en' | 'am' | 'om';

export type Permission = 
  | 'VIEW_ADMIN_CONSOLE'
  | 'MANAGE_FINANCES'
  | 'MANAGE_USERS'
  | 'VIEW_GLOBAL_TREE'
  | 'VIEW_MEMBER_DASHBOARD'
  | 'ACCESS_WALLET'
  | 'P2P_TRADE'
  | 'REGISTER_MEMBERS'
  | 'VIEW_TEAM';

export interface SystemSettings {
  currencyRate: number;
  joiningFee: number;
  referralBonus: number;
  matchingBonus: number;
  levelIncomeBonus: number;
  p2pFeePercent: number;
  withdrawalFeePercent: number;
  binaryDailyCap: number; // Monetary Cap
  maxDailyBinaryPairs: number; // Pair Count Cap (e.g., 20)
  
  honeyValue: number;
  coffeeValue: number;
  allowRegistrations: boolean;
  allowP2P: boolean;
  allowWithdrawals: boolean;
  maintenanceMode: boolean;
  systemAnnouncement: string;
  supportEmail: string;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  accountName: string;
  
  // Mobile Money (New)
  mobileMoneyName?: string; // e.g., Telebirr, M-Pesa
  mobileMoneyNumber?: string;
  
  minOTFSell: number;
  maxOTFSell: number;
  minOTFBuy: number;
  maxOTFBuy: number;
  minOTFRateETB: number;
  maxOTFRateETB: number;
  
  // Time & Limiting Configuration (New)
  opsStartTime?: string;
  opsEndTime?: string;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  minAccountAgeDays?: number;
  p2pDailyLimit?: number;

  // Crypto
  cryptoExchangeName: string;
  cryptoWalletAddress: string;
  cryptoNetwork: string;
  
  securityCooldownHours: number;
  tradeCooldownMinutes: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  timestamp: string;
  read: boolean;
  isAdminReply?: boolean;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: Role;
  joinDate: string;
  rank: Rank;
  parentId: string | null;
  leg?: 'LEFT' | 'RIGHT' | null;
  sponsorId: string | null;
  balance: number;
  totalEarnings: number;
  honeyBalance: number;
  coffeeBalance: number;
  avatar: string;
  avatarUrl?: string;
  downlineCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  password?: string;
  transactionPin?: string;
  walletLocked?: boolean;
  commissionsSuspended?: boolean;
  
  // Advanced Binary Tracking
  binaryLeftCount: number;
  binaryRightCount: number;
  binaryLeftVolume: number;
  binaryRightVolume: number;
  binaryPaidVolume: number;
  binaryPaidPairs: number;
  careerVolume: number;
  
  dailyBinaryEarnings?: { date: string; amount: number };
  dailyBinaryPairs?: { date: string; count: number }; // Added for 20 pair limit
  
  placementType?: 'AUTO' | 'MANUAL';
  allowedDeviceIds?: string[];
  isTwoFactorEnabled?: boolean;
  twoFactorMethod?: 'MANUAL' | 'EMAIL' | 'PHONE' | 'GOOGLE_AUTH';
  twoFactorSecret?: string;
  googleAuthSecret?: string;
  isGoogleAuthEnabled?: boolean;
  securityCooldownUntil?: string; 
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  cryptoWalletAddress?: string;
  cryptoExchangeName?: string;
  cryptoNetwork?: string;
  notificationPreferences?: NotificationPreferences;
  kycStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycData?: VerificationRequest;
  isOnline?: boolean;
  lastActive?: string;
  ownedNFTs?: string[];
  bio?: string;
  riskScore?: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  country: string;
  idType: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE'; 
  idNumber?: string;
  dob?: string;
  documentUrl?: string;
  frontImage?: string; 
  backImage?: string; 
  selfieImage?: string; 
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface PendingRegistration {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  ftNumber: string;
  sponsorId: string;
  requestedBy: string;
  date: string;
  paymentMethod?: 'WALLET' | 'BANK';
  placementMode: 'AUTO' | 'MANUAL';
  manualParentUsername?: string;
  manualLeg?: 'LEFT' | 'RIGHT';
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  username: string;
  name: string;
  date: string;
  status: 'PENDING' | 'APPROVED';
}

export interface DeviceApprovalRequest {
  id: string;
  username: string;
  deviceId: string;
  ip: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface P2PRequest {
  id: string;
  type: 'SEND' | 'REQUEST'; 
  requestorId: string; 
  targetUserId: string; 
  requestorName: string;
  targetUserName: string;
  amount: number;
  fee: number;
  total: number;
  status: 'PENDING_SENDER' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED';
  date: string;
  twoFactorVerified?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'COMMISSION' | 'TRANSFER' | 'LEVEL_INCOME' | 'MATCHING_BONUS' | 'JOINING_FEE' | 'P2P_TRANSFER' | 'SERVICE_FEE' | 'ADMIN_ADJUSTMENT' | 'TRADE_INVESTMENT';
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  depositStage?: 'REQUEST' | 'WAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'COMPLETED';
  description: string;
  method?: string;
  bankDetails?: string;
  ftNumber?: string;
  proofUrl?: string;
  adminResponseTxId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  date: string;
  read: boolean;
  targetView?: ViewState;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'PROFILE_UPDATE' | 'TRANSACTION_REQUEST' | 'REGISTRATION_REQUEST' | 'REGISTRATION_APPROVAL' | 'WITHDRAWAL_ACTION' | 'OTHER' | 'P2P_ACTION' | 'SECURITY_ACTION' | 'SYSTEM_CONFIG' | 'ADMIN_ADJUSTMENT' | 'DATA_RESTORE' | 'TRADE_ACTION';
  details: string;
  timestamp: string;
}

export interface SystemBackup {
  metadata: { version: string; timestamp: string; exportedBy: string; };
  data: {
    users: User[];
    transactions: Transaction[];
    settings: SystemSettings;
    logs: ActivityLog[];
    pendingRegistrations: PendingRegistration[];
    p2pRequests: P2PRequest[];
    passwordResetRequests: PasswordResetRequest[];
    deviceApprovalRequests: DeviceApprovalRequest[];
    messages: ChatMessage[];
    verificationRequests: VerificationRequest[];
  };
}

export interface MarketOrder {
  id: string;
  userId: string;
  username: string;
  type: 'BUY' | 'SELL';
  amountOTF: number;
  priceETB: number;
  minQuantity: number;
  bankDetails: string;
}

export interface ActiveTrade {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  amountOTF: number;
  priceETB: number;
  totalCostETB: number;
  status: 'WAITING_PAYMENT' | 'PAID_VERIFYING' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  expiresAt: number;
  sellerBankDetails: string;
  ftNumber?: string;
  createdAt: string;
}

export type ViewState = 'DASHBOARD' | 'GENEALOGY' | 'WALLET' | 'TEAM' | 'MARKETPLACE' | 'REGISTER' | 'ADMIN_DASHBOARD' | 'COMPANY_BALANCE' | 'SECURITY';
