import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';

// @desc    Get complete tree structure
// @route   GET /api/users/tree
// @access  Private
export const getGenealogyTree = async (req: any, res: Response) => {
    try {
        const users = await (User as any).findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team list
// @route   GET /api/users/team
// @access  Private
export const getDownline = async (req: any, res: Response) => {
    try {
        const users = await (User as any).findAll({
            attributes: { exclude: ['password'] }
        }); 
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Dashboard Data (Profile + Recent Tx)
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboardData = async (req: any, res: Response) => {
    try {
        const user = await (User as any).findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if(!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const transactions = await (Transaction as any).findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        
        res.json({
            user,
            transactions
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};