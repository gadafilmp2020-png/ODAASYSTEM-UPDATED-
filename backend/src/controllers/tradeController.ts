import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';

// @desc    Initiate P2P Trade
// @route   POST /api/trade/initiate
// @access  Private
export const initiateTrade = async (req: any, res: Response) => {
    const { targetUsername, amount, type } = req.body; // type: 'BUY' or 'SELL'
    const requestorId = req.user.id;

    try {
        const targetUser = await (User as any).findOne({ where: { username: targetUsername } });
        if (!targetUser) {
            res.status(404).json({ message: 'Target user not found' });
            return;
        }

        if (targetUser.id === requestorId) {
            res.status(400).json({ message: 'Cannot trade with yourself' });
            return;
        }

        // Calculate Fees
        const FEE_PERCENT = 0.02; // 2%
        const fee = amount * FEE_PERCENT;
        const total = amount + fee;

        // If Requestor is SELLING, check balance immediately
        if (type === 'SELL') {
            const seller = await (User as any).findByPk(requestorId);
            if (seller!.balance < total) {
                res.status(400).json({ message: 'Insufficient balance' });
                return;
            }
            // Lock funds (Deduct now, hold in escrow/pending state via logic or separate collection)
            // For simplicity in this demo, we just verify balance. 
            // In production, move funds to an escrow wallet.
        }

        // Create P2P Request Record (Simulated via Transaction with specific status)
        // In a real DB, you'd have a 'Trade' model. Here we use Transaction for simplicity.
        const trade = await (Transaction as any).create({
            userId: requestorId,
            userName: req.user.name,
            type: 'P2P_TRANSFER',
            amount: amount,
            status: 'PENDING', // Waiting for Seller to Accept/Buyer to Pay
            description: `P2P ${type} Request with ${targetUser.username}`,
            ftNumber: `P2P-${Date.now()}` // Unique Ref
        });

        res.status(201).json(trade);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seller Releases Funds (No Admin Intervention)
// @route   POST /api/trade/release
// @access  Private
export const releaseTrade = async (req: any, res: Response) => {
    const { tradeId, pin } = req.body;
    const sellerId = req.user.id;

    try {
        const seller = await (User as any).findByPk(sellerId);
        
        // verify PIN
        if(seller?.transactionPin !== pin) {
             res.status(401).json({ message: 'Invalid Security PIN' });
             return;
        }

        // Find trade (Simulated lookup)
        // Logic: Find the transaction, verify status is 'PAID_VERIFYING' or 'PENDING'
        // Execute transfer
        
        // ... (Transfer Logic: Deduct from Seller, Add to Buyer, Add Fee to Admin) ...

        res.json({ message: 'Funds Released Successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};