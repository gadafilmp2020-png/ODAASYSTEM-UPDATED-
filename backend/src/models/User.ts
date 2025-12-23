import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface UserAttributes {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MEMBER';
  rank: string;
  sponsorId: string | null;
  parentId: string | null;
  leg: 'LEFT' | 'RIGHT' | null;
  placementType: 'AUTO' | 'MANUAL';
  balance: number;
  totalEarnings: number;
  binaryLeftCount: number;
  binaryRightCount: number;
  binaryPaidPairs: number;
  dailyBinaryPairs: string; // JSON string: { date: string, count: number } for 20-pair cap
  downlineCount: number;
  avatar: string;
  transactionPin?: string;
  riskScore: number; // 0-100 security score
  isTwoFactorEnabled: boolean;
  allowedDeviceIds: string; // Stored as JSON string in SQL
  status: 'ACTIVE' | 'BLOCKED';
  walletLocked: boolean;
  kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  isOnline: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'balance' | 'totalEarnings' | 'binaryLeftCount' | 'binaryRightCount' | 'binaryPaidPairs' | 'dailyBinaryPairs' | 'downlineCount' | 'riskScore' | 'isTwoFactorEnabled' | 'allowedDeviceIds' | 'status' | 'walletLocked' | 'kycStatus' | 'isOnline'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare phoneNumber: string;
  declare role: 'ADMIN' | 'MEMBER';
  declare rank: string;
  declare sponsorId: string | null;
  declare parentId: string | null;
  declare leg: 'LEFT' | 'RIGHT' | null;
  declare placementType: 'AUTO' | 'MANUAL';
  declare balance: number;
  declare totalEarnings: number;
  declare binaryLeftCount: number;
  declare binaryRightCount: number;
  declare binaryPaidPairs: number;
  declare dailyBinaryPairs: string;
  declare downlineCount: number;
  declare avatar: string;
  declare transactionPin: string;
  declare riskScore: number;
  declare isTwoFactorEnabled: boolean;
  declare allowedDeviceIds: string;
  declare status: 'ACTIVE' | 'BLOCKED';
  declare walletLocked: boolean;
  declare kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  declare isOnline: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

(User as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('ADMIN', 'MEMBER'), defaultValue: 'MEMBER' },
  rank: { type: DataTypes.STRING, defaultValue: 'Distributor' },
  sponsorId: { type: DataTypes.UUID, allowNull: true },
  parentId: { type: DataTypes.UUID, allowNull: true },
  leg: { type: DataTypes.ENUM('LEFT', 'RIGHT'), allowNull: true },
  placementType: { type: DataTypes.ENUM('AUTO', 'MANUAL'), defaultValue: 'AUTO' },
  balance: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  binaryLeftCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  binaryRightCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  binaryPaidPairs: { type: DataTypes.INTEGER, defaultValue: 0 },
  dailyBinaryPairs: { type: DataTypes.TEXT, defaultValue: '{}' },
  downlineCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  avatar: { type: DataTypes.TEXT, defaultValue: '' },
  transactionPin: { type: DataTypes.STRING, allowNull: true },
  riskScore: { type: DataTypes.INTEGER, defaultValue: 100 },
  isTwoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  allowedDeviceIds: { type: DataTypes.TEXT, defaultValue: '[]' },
  status: { type: DataTypes.ENUM('ACTIVE', 'BLOCKED'), defaultValue: 'ACTIVE' },
  walletLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  kycStatus: { type: DataTypes.ENUM('NONE', 'PENDING', 'VERIFIED', 'REJECTED'), defaultValue: 'NONE' },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true
});

export default User;