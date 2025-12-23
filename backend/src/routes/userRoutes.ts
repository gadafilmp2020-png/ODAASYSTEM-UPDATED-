
import express from 'express';
import { getGenealogyTree, getDownline, getDashboardData } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/tree', protect, getGenealogyTree);
router.get('/team', protect, getDownline);
router.get('/dashboard', protect, getDashboardData);

export default router;
