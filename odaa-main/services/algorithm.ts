import { User, Transaction, SystemSettings, Rank } from '../types';
import { REFERRAL_BONUS_PERCENT, MATCHING_BONUS_PERCENT } from '../constants';

/**
 * findAutoPlacement:
 * Uses BFS to find the next available empty spot in the binary tree.
 * Priority: Fill Left Leg First to ensure spillover.
 */
export const findAutoPlacement = (users: User[], rootId: string): { parentId: string, leg: 'LEFT' | 'RIGHT' } => {
    const userMap = new Map(users.map(u => [u.id, u]));
    const queue = [rootId];

    if (!userMap.has(rootId)) return { parentId: users[0]?.id || 'admin1', leg: 'LEFT' };

    while (queue.length > 0) {
        const currId = queue.shift()!;
        
        const children = users.filter(u => u.parentId === currId);
        const leftChild = children.find(c => c.leg === 'LEFT');
        const rightChild = children.find(c => c.leg === 'RIGHT');

        if (!leftChild) return { parentId: currId, leg: 'LEFT' };
        if (!rightChild) return { parentId: currId, leg: 'RIGHT' };

        queue.push(leftChild.id);
        queue.push(rightChild.id);
    }

    return { parentId: rootId, leg: 'LEFT' };
};

/**
 * calculateRank:
 * Determines user rank based on Career Volume and Downline Count.
 */
const calculateRank = (user: User): Rank => {
    const vol = user.careerVolume || 0;
    const directs = user.downlineCount || 0;

    if (vol >= 100000 && directs >= 10) return Rank.DIAMOND;
    if (vol >= 25000 && directs >= 5) return Rank.DIRECTOR;
    if (vol >= 5000 && directs >= 3) return Rank.MANAGER;
    if (vol >= 1000 || directs >= 2) return Rank.LEADER;
    
    return Rank.MEMBER;
};

/**
 * runCommissionProtocol:
 * The core engine processing all compensation logic for a new user entry.
 */
export const processNewMemberLogic = (
    newUser: User,
    currentUsers: User[],
    settings: SystemSettings
): { updatedUsers: User[], newTransactions: Transaction[] } => {
    
    // 1. Initialize State Map
    const usersMap = new Map(currentUsers.map(u => [u.id, { ...u }]));
    usersMap.set(newUser.id, newUser);

    const newTx: Transaction[] = [];
    const date = new Date().toISOString().split('T')[0];
    
    // Configuration from Settings
    const JOINING_PV = settings.joiningFee; // 1 OTF = 1 PV
    const REF_BONUS = JOINING_PV * (settings.referralBonus > 0 ? (settings.referralBonus/1000) : REFERRAL_BONUS_PERCENT); // Fallback logic
    const LEVEL_PERCENTAGES = [0.05, 0.04, 0.03, 0.02, 0.01]; // Level 1-5

    // --- PHASE 1: COMPANY REVENUE ---
    const admin = Array.from(usersMap.values()).find(u => u.role === 'ADMIN');
    if (admin) {
        admin.balance += JOINING_PV;
        newTx.push({
            id: `sys-${newUser.id}-rev`,
            userId: admin.id,
            userName: admin.name,
            type: 'JOINING_FEE',
            amount: JOINING_PV,
            date,
            status: 'APPROVED',
            description: `Revenue: Member Activation @${newUser.username}`
        });
    }

    // --- PHASE 2: SPONSOR & UNILEVEL BONUS ---
    if (newUser.sponsorId) {
        const sponsor = usersMap.get(newUser.sponsorId);
        
        // A. Direct Sponsor Bonus
        if (sponsor) {
            sponsor.balance += REF_BONUS;
            sponsor.totalEarnings += REF_BONUS;
            sponsor.downlineCount = (sponsor.downlineCount || 0) + 1;
            sponsor.careerVolume = (sponsor.careerVolume || 0) + JOINING_PV;
            
            // Check Rank
            sponsor.rank = calculateRank(sponsor);

            newTx.push({
                id: `comm-dir-${newUser.id}`,
                userId: sponsor.id,
                userName: sponsor.name,
                type: 'COMMISSION',
                amount: REF_BONUS,
                date,
                status: 'APPROVED',
                description: `Direct Sponsor Bonus (15%) from ${newUser.username}`
            });

            // B. Unilevel (Generation) Bonus
            let currentUplineId = sponsor.sponsorId;
            let level = 0; // Starts at Sponsor's Upline (Level 2 relative to New User)

            while (currentUplineId && level < LEVEL_PERCENTAGES.length) {
                const upline = usersMap.get(currentUplineId);
                if (!upline) break;

                const bonusAmount = JOINING_PV * LEVEL_PERCENTAGES[level];
                upline.balance += bonusAmount;
                upline.totalEarnings += bonusAmount;
                upline.careerVolume = (upline.careerVolume || 0) + JOINING_PV;
                upline.rank = calculateRank(upline);

                newTx.push({
                    id: `comm-lvl-${newUser.id}-${level + 2}`,
                    userId: upline.id,
                    userName: upline.name,
                    type: 'LEVEL_INCOME',
                    amount: bonusAmount,
                    date,
                    status: 'APPROVED',
                    description: `Generation ${level + 2} Bonus from ${newUser.username}`
                });

                currentUplineId = upline.sponsorId;
                level++;
            }
        }
    }

    // --- PHASE 3: BINARY ENGINE (Volume & Flushing) ---
    let currentNode = newUser;
    let safetyCounter = 0;

    // Traverse UP the Binary Tree
    while (currentNode.parentId && safetyCounter < 1000) {
        const parent = usersMap.get(currentNode.parentId);
        if (!parent) break;

        // 1. Add Volume to the specific Leg
        if (currentNode.leg === 'LEFT') {
            parent.binaryLeftCount = (parent.binaryLeftCount || 0) + 1;
            parent.binaryLeftVolume = (parent.binaryLeftVolume || 0) + JOINING_PV;
        } else if (currentNode.leg === 'RIGHT') {
            parent.binaryRightCount = (parent.binaryRightCount || 0) + 1;
            parent.binaryRightVolume = (parent.binaryRightVolume || 0) + JOINING_PV;
        }

        // 2. Calculate Matching (10% of Weak Leg)
        // Note: Using Volume, not Count.
        const leftVol = parent.binaryLeftVolume;
        const rightVol = parent.binaryRightVolume;
        
        // Find matchable volume
        const matchable = Math.min(leftVol, rightVol);
        
        if (matchable > 0) {
            const binaryBonus = matchable * MATCHING_BONUS_PERCENT; // 10%
            
            // Check Daily Cap
            if (!parent.dailyBinaryEarnings || parent.dailyBinaryEarnings.date !== date) {
                parent.dailyBinaryEarnings = { date, amount: 0 };
            }
            
            const remainingCap = Math.max(0, settings.binaryDailyCap - parent.dailyBinaryEarnings.amount);
            const payout = Math.min(binaryBonus, remainingCap);

            if (payout > 0) {
                parent.balance += payout;
                parent.totalEarnings += payout;
                parent.dailyBinaryEarnings.amount += payout;

                // 3. FLUSHING MECHANISM
                // Deduct the matched volume from both legs
                parent.binaryLeftVolume -= matchable;
                parent.binaryRightVolume -= matchable;
                parent.binaryPaidVolume = (parent.binaryPaidVolume || 0) + matchable;

                newTx.push({
                    id: `bin-${parent.id}-${Date.now()}-${safetyCounter}`,
                    userId: parent.id,
                    userName: parent.name,
                    type: 'MATCHING_BONUS',
                    amount: payout,
                    date,
                    status: 'APPROVED',
                    description: `Binary Match: ${matchable} PV Flushed ${payout < binaryBonus ? '(CAPPED)' : ''}`
                });
            }
        }

        currentNode = parent;
        safetyCounter++;
    }

    return { 
        updatedUsers: Array.from(usersMap.values()), 
        newTransactions: newTx 
    };
};