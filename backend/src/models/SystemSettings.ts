
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface SystemSettingAttributes {
  id: number;
  currencyRate: number;
  joiningFee: number;
  referralBonus: number;
  matchingBonus: number;
  levelIncomeBonus: number;
  p2pFeePercent: number;
  withdrawalFeePercent: number;
  binaryDailyCap: number;
  
  // Payment Gateways
  bankName: string;
  accountNumber: string;
  accountName: string;
  mobileMoneyName: string;
  mobileMoneyNumber: string;
  cryptoExchangeName: string;
  cryptoWalletAddress: string;
  cryptoNetwork: string;

  // Switches & Logic
  allowRegistrations: boolean;
  allowP2P: boolean;
  allowWithdrawals: boolean;
  maintenanceMode: boolean;
}

interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id'> {}

class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
  declare id: number;
  declare currencyRate: number;
  declare joiningFee: number;
  declare referralBonus: number;
  declare matchingBonus: number;
  declare levelIncomeBonus: number;
  declare p2pFeePercent: number;
  declare withdrawalFeePercent: number;
  declare binaryDailyCap: number;
  declare bankName: string;
  declare accountNumber: string;
  declare accountName: string;
  declare mobileMoneyName: string;
  declare mobileMoneyNumber: string;
  declare cryptoExchangeName: string;
  declare cryptoWalletAddress: string;
  declare cryptoNetwork: string;
  declare allowRegistrations: boolean;
  declare allowP2P: boolean;
  declare allowWithdrawals: boolean;
  declare maintenanceMode: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

(SystemSetting as any).init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  currencyRate: { type: DataTypes.FLOAT, defaultValue: 1.19 },
  joiningFee: { type: DataTypes.FLOAT, defaultValue: 1000 },
  referralBonus: { type: DataTypes.FLOAT, defaultValue: 150 },
  matchingBonus: { type: DataTypes.FLOAT, defaultValue: 100 },
  levelIncomeBonus: { type: DataTypes.FLOAT, defaultValue: 5 },
  p2pFeePercent: { type: DataTypes.FLOAT, defaultValue: 2 },
  withdrawalFeePercent: { type: DataTypes.FLOAT, defaultValue: 3 },
  binaryDailyCap: { type: DataTypes.FLOAT, defaultValue: 5000 },
  
  // Payment
  bankName: { type: DataTypes.STRING, defaultValue: 'Commercial Bank' },
  accountNumber: { type: DataTypes.STRING, defaultValue: '' },
  accountName: { type: DataTypes.STRING, defaultValue: '' },
  mobileMoneyName: { type: DataTypes.STRING, defaultValue: 'Telebirr' },
  mobileMoneyNumber: { type: DataTypes.STRING, defaultValue: '' },
  cryptoExchangeName: { type: DataTypes.STRING, defaultValue: 'Binance' },
  cryptoWalletAddress: { type: DataTypes.STRING, defaultValue: '' },
  cryptoNetwork: { type: DataTypes.STRING, defaultValue: 'BEP20' },

  // Switches
  allowRegistrations: { type: DataTypes.BOOLEAN, defaultValue: true },
  allowP2P: { type: DataTypes.BOOLEAN, defaultValue: true },
  allowWithdrawals: { type: DataTypes.BOOLEAN, defaultValue: true },
  maintenanceMode: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  sequelize,
  tableName: 'system_settings',
  timestamps: true
});

export default SystemSetting;
