import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Op } from 'sequelize';
import { processNewMember, findAutoPlacement } from '../services/mlmService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, username, email, password, phoneNumber, sponsorUsername, placementMode, manualParentUsername, manualLeg } = req.body;

  try {
    // 1. Check Duplicates
    const userExists = await (User as any).findOne({ 
        where: { 
            [Op.or]: [{ email }, { username }] 
        } 
    });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Setup Hierarchy & Placement
    let sponsorId: string | null = null;
    let parentId: string | null = null;
    let leg: 'LEFT' | 'RIGHT' = 'LEFT';

    const userCount = await (User as any).count();
    const isFirstUser = userCount === 0;

    if (!isFirstUser) {
        // Find Sponsor
        const sponsor = await (User as any).findOne({ where: { username: sponsorUsername || 'admin' } });
        if (!sponsor) {
             res.status(404).json({ message: 'Sponsor not found' });
             return;
        }
        sponsorId = sponsor.id;

        // Determine Placement (Auto vs Manual)
        if (placementMode === 'MANUAL' && manualParentUsername) {
            const manualParent = await (User as any).findOne({ where: { username: manualParentUsername } });
            if (manualParent) {
                // Verify if the requested leg is actually free
                const occupied = await (User as any).findOne({ where: { parentId: manualParent.id, leg: manualLeg } });
                if (!occupied) {
                    parentId = manualParent.id;
                    leg = manualLeg as 'LEFT' | 'RIGHT';
                } else {
                    // Fallback to Auto if manual spot is taken
                    const placement = await findAutoPlacement(sponsor.id);
                    parentId = placement.parentId;
                    leg = placement.leg;
                }
            } else {
                 const placement = await findAutoPlacement(sponsor.id);
                 parentId = placement.parentId;
                 leg = placement.leg;
            }
        } else {
            // Auto Placement Algorithm
            const placement = await findAutoPlacement(sponsor.id);
            parentId = placement.parentId;
            leg = placement.leg;
        }
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User Record
    const user = await (User as any).create({
      name,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      sponsorId,
      parentId,
      leg,
      placementType: placementMode || 'AUTO',
      role: isFirstUser ? 'ADMIN' : 'MEMBER',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      balance: 0,
      totalEarnings: 0,
      binaryLeftCount: 0,
      binaryRightCount: 0,
      binaryPaidPairs: 0,
      downlineCount: 0,
      isTwoFactorEnabled: false,
      allowedDeviceIds: '[]',
      status: 'ACTIVE',
      walletLocked: false,
      kycStatus: 'NONE',
      isOnline: false
    });

    // 5. Trigger MLM Calculations (Commissions & Stats)
    if (!isFirstUser) {
        await processNewMember(user as any);
    }

    res.status(201).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password, deviceId } = req.body;

  try {
    const user = await (User as any).findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      if (user.status === 'BLOCKED') {
          res.status(403).json({ message: 'Account is blocked.' });
          return;
      }

      // Handle Device Authorization
      let devices: string[] = [];
      try {
          devices = JSON.parse(user.allowedDeviceIds || '[]');
      } catch (e) { devices = []; }

      if (user.role === 'ADMIN' && deviceId && !devices.includes(deviceId)) {
           devices.push(deviceId);
           await (User as any).update({ allowedDeviceIds: JSON.stringify(devices) }, { where: { id: user.id } });
      }

      res.json({
        _id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        balance: user.balance,
        rank: user.rank,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  const user = await (User as any).findByPk(req.user.id);
  if (user) {
    const userData = user.toJSON();
    res.json({ ...userData, _id: user.id });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};