
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Op } from 'sequelize';
import { processNewMember, findAutoPlacement } from '../services/mlmService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'odaa_secret_2026_key', {
    expiresIn: '30d',
  });
};

/**
 * EMERGENCY SEED: If DB is empty, create the first admin
 */
const seedAdminIfEmpty = async () => {
    try {
        const count = await (User as any).count();
        if (count === 0) {
            console.log("Database empty. Initializing Root Admin...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt); // Default password: admin
            
            await (User as any).create({
                name: 'System Administrator',
                username: 'admin',
                email: 'admin@system.live',
                password: hashedPassword,
                phoneNumber: '+25100000000',
                role: 'ADMIN',
                rank: 'Crown Diamond',
                status: 'ACTIVE',
                balance: 1000000,
                kycStatus: 'VERIFIED'
            });
            console.log("Root Admin created: admin / admin");
        }
    } catch (e) {
        console.error("Seeding Warning (Non-Fatal):", e);
    }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, username, email, password, phoneNumber, sponsorUsername, placementMode, manualParentUsername, manualLeg } = req.body;

  try {
    const userExists = await (User as any).findOne({ 
        where: { [Op.or]: [{ email }, { username }] } 
    });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    let sponsorId: string | null = null;
    let parentId: string | null = null;
    let leg: 'LEFT' | 'RIGHT' = 'LEFT';

    const userCount = await (User as any).count();
    const isFirstUser = userCount === 0;

    if (!isFirstUser) {
        const sponsor = await (User as any).findOne({ where: { username: sponsorUsername || 'admin' } });
        if (!sponsor) {
             res.status(404).json({ message: 'Sponsor node not found' });
             return;
        }
        sponsorId = sponsor.id;

        if (placementMode === 'MANUAL' && manualParentUsername) {
            const manualParent = await (User as any).findOne({ where: { username: manualParentUsername } });
            if (manualParent) {
                const occupied = await (User as any).findOne({ where: { parentId: manualParent.id, leg: manualLeg } });
                if (!occupied) {
                    parentId = manualParent.id;
                    leg = manualLeg as 'LEFT' | 'RIGHT';
                } else {
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
            const placement = await findAutoPlacement(sponsor.id);
            parentId = placement.parentId;
            leg = placement.leg;
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=84cc16`,
      balance: isFirstUser ? 1000000 : 0,
      totalEarnings: 0,
      status: 'ACTIVE',
      kycStatus: isFirstUser ? 'VERIFIED' : 'NONE'
    });

    if (!isFirstUser) {
        await processNewMember(user as any);
    }

    res.status(201).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        token: generateToken(user.id),
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password, deviceId } = req.body;

  try {
    // Check if we need to seed the admin first
    await seedAdminIfEmpty();

    const user = await (User as any).findOne({ where: { username } });

    if (user) {
      // 1. Try standard bcrypt compare
      let isMatch = await bcrypt.compare(password, user.password);
      
      // 2. Self-Healing: Check plaintext match (Common in cPanel/manual edits)
      if (!isMatch && password === user.password) {
          console.log(`[AUTH] Fixing plaintext password for user ${username}`);
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          isMatch = true;
      }

      if (isMatch) {
        if (user.status === 'BLOCKED') {
            res.status(403).json({ message: 'Access Denied: Node Restricted' });
            return;
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
        res.status(401).json({ message: 'Invalid credentials: Password Mismatch' });
      }
    } else {
      res.status(401).json({ message: `Invalid credentials: User '${username}' not found` });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Link Failure: " + error.message });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  const user = await (User as any).findByPk(req.user.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User node not found' });
  }
};
