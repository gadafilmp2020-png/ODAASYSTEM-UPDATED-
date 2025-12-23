
export enum Rank {
  MEMBER = 'Distributor',
  LEADER = 'Star Agent',
  MANAGER = 'Ruby Manager',
  DIRECTOR = 'Emerald Director',
  DIAMOND = 'Crown Diamond'
}

export type Role = 'ADMIN' | 'MEMBER';

export interface SystemSettings {
  // Economics
  currencyRate: number; // OTF to USD/ETB base
  joiningFee: number;
  referralBonus: number;
  matchingBonus: number;
  levelIncomeBonus: number;
  p2pFeePercent: number;
  withdrawalFeePercent: number;
  
  binaryDailyCap: number;

  // Trading Bot Market Values
  honeyValue: number;
  coffeeValue: number;
  
  // Permissions / Switches
  allowRegistrations: boolean;
  allowP2P: boolean;
  allowWithdrawals: boolean;
  maintenanceMode: boolean;

  // Information
  systemAnnouncement: string;
  supportEmail: string;
  
  // Bank
  bankName?: string;
  accountNumber?: string;
  accountName?: string;

  // P2P Constraints
  minOTFSell?: number;
  maxOTFSell?: number;
  minOTFBuy?: number;
  maxOTFBuy?: number;
  minOTFRateETB?: number;
  maxOTFRateETB?: number;

  // Crypto
  cryptoExchangeName?: string;
  cryptoWalletAddress?: string;
  cryptoNetwork?: string;

  // Security
  securityCooldownHours?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string; // User ID or 'ADMIN'
  senderName: string;
  recipientId: string; // 'ADMIN' or User ID
  text: string;
  timestamp: string; // ISO String
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
  phoneNumber: string; // Added phone number
  role: Role;
  joinDate: string;
  rank: Rank;
  parentId: string | null; // Tree Placement (Upline in Binary Tree)
  leg?: 'LEFT' | 'RIGHT' | null; // Binary Leg Position
  sponsorId: string | null; // Referrer (Direct Sponsor for Unilevel Bonus)
  balance: number;
  totalEarnings: number;
  avatar: string;
  avatarUrl?: string; // Custom uploaded avatar URL
  downlineCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  password?: string;
  
  // Granular Restrictions
  walletLocked?: boolean;
  commissionsSuspended?: boolean;

  // Binary System Tracking
  binaryLeftCount: number;
  binaryRightCount: number;
  binaryPaidPairs: number;
  
  dailyBinaryEarnings?: { date: string; amount: number };

  // Placement info
  placementType?: 'AUTO' | 'MANUAL';

  // Security
  allowedDeviceIds?: string[];
  
  // Settings
  notificationPreferences?: NotificationPreferences;
  
  // KYC
  kycStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycData?: VerificationRequest;

  // Presence
  isOnline?: boolean;
  lastActive?: string;

  // NFT
  ownedNFTs?: string[];

  // Bank & Crypto for P2P
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  cryptoWalletAddress?: string;
  cryptoExchangeName?: string;
  cryptoNetwork?: string;
  
  // Security
  securityCooldownUntil?: string;
  googleAuthSecret?: string;
  isGoogleAuthEnabled?: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  country: string;
  idType: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE';
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  idNumber?: string;
  dob?: string;
  frontImage?: string; 
  backImage?: string; 
  selfieImage?: string;
  documentUrl?: string; // Simulated URL
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PendingRegistration {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  ftNumber: string; // Financial Transaction Number
  sponsorId: string; // The user who will get the commission
  requestedBy: string; // The user ID who submitted the request
  date: string;
  paymentMethod?: 'WALLET' | 'BANK';
  
  // Placement Strategy
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
  type: 'BUY' | 'SELL';
  requestorId: string; // The user who clicked the button
  targetUserId: string; // The other party (Seller for Buy, Buyer for Sell)
  requestorName: string;
  targetUserName: string;
  amount: number;
  fee: number;
  total: number;
  ftNumber?: string; // For Buy requests
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string; // For admin view
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'COMMISSION' | 'TRANSFER' | 'LEVEL_INCOME' | 'MATCHING_BONUS' | 'JOINING_FEE' | 'P2P_TRANSFER' | 'SERVICE_FEE' | 'ADMIN_ADJUSTMENT' | 'TRADE_INVESTMENT';
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  depositStage?: 'REQUEST' | 'WAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'COMPLETED';
  description: string;
  method?: string;
  bankDetails?: string; // For Withdrawal Destination
  ftNumber?: string; // For Deposit Verification
  proofUrl?: string; // URL for uploaded proof of payment
  adminResponseTxId?: string; // For Withdrawal Completion
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

export interface NodeData {
  id: string;
  name: string;
  rank: Rank;
  leg: 'LEFT' | 'RIGHT' | null;
  binaryLeftCount?: number;
  binaryRightCount?: number;
  binaryPaidPairs: number;
  children: NodeData[];
}

export interface SystemBackup {
  metadata: {
    version: string;
    timestamp: string;
    exportedBy: string;
  };
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