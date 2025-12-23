import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface TransactionAttributes {
  id: string;
  userId: string;
  userName: string;
  type: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  depositStage: 'REQUEST' | 'WAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'COMPLETED' | null;
  description: string;
  method: string | null;
  ftNumber: string | null;
  proofUrl: string | null;
  adminResponseTxId: string | null;
  bankDetails: string | null;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'status' | 'depositStage' | 'method' | 'ftNumber' | 'proofUrl' | 'adminResponseTxId' | 'bankDetails'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  declare id: string;
  declare userId: string;
  declare userName: string;
  declare type: string;
  declare amount: number;
  declare date: string;
  declare status: 'PENDING' | 'APPROVED' | 'REJECTED';
  declare depositStage: 'REQUEST' | 'WAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'COMPLETED' | null;
  declare description: string;
  declare method: string | null;
  declare ftNumber: string | null;
  declare proofUrl: string | null;
  declare adminResponseTxId: string | null;
  declare bankDetails: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

(Transaction as any).init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
  depositStage: { type: DataTypes.ENUM('REQUEST', 'WAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'COMPLETED'), allowNull: true },
  description: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: true },
  ftNumber: { type: DataTypes.STRING, allowNull: true },
  proofUrl: { type: DataTypes.TEXT('long'), allowNull: true },
  adminResponseTxId: { type: DataTypes.STRING, allowNull: true },
  bankDetails: { type: DataTypes.STRING, allowNull: true }
}, {
  sequelize,
  tableName: 'transactions',
  timestamps: true
});

export default Transaction;