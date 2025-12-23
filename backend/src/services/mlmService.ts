import User from '../models/User';
import Transaction from '../models/Transaction';

const SETTINGS = {
    JOINING_FEE: 500,
    REFERRAL_BONUS: 100,
    MATCHING_BONUS: 100,
    LEVEL_INCOME: 5,
    MAX_LEVEL: 5,
    BINARY_DAILY_CAP_PAIRS: 20 // THE FIX: Sustainability Cap
};

export const isDescendant = async (targetId: string, rootId: string): Promise<boolean> => {
    if (targetId === rootId) return true;
    let curr = await (User as any).findByPk(targetId, { attributes: ['parentId'] });
    let depth = 0;
    while (curr && curr.parentId && depth < 100) {
        if (curr.parentId === rootId) return true;
        curr = await (User as any).findByPk(curr.parentId, { attributes: ['parentId'] });
        depth++;
    }
    return false;
};

export const findAutoPlacement = async (rootId: string): Promise<{ parentId: string, leg: 'LEFT' | 'RIGHT' }> => {
    const queue = [rootId];
    const rootUser = await (User as any).findByPk(rootId);
    if (!rootUser) {
        const firstUser = await (User as any).findOne({ order: [['createdAt', 'ASC']] });
        if(firstUser) return { parentId: firstUser.id, leg: 'LEFT' };
        return { parentId: rootId, leg: 'LEFT' };
    }

    let loopCount = 0;
    while (queue.length > 0 && loopCount < 5000) {
        const currId = queue.shift();
        loopCount++;
        const leftChild = await (User as any).findOne({ where: { parentId: currId, leg: 'LEFT' }, attributes: ['id'] });
        const rightChild = await (User as any).findOne({ where: { parentId: currId, leg: 'RIGHT' }, attributes: ['id'] });
        if (!leftChild) return { parentId: currId!, leg: 'LEFT' };
        if (!rightChild) return { parentId: currId!, leg: 'RIGHT' };
        queue.push(leftChild.id);
        queue.push(rightChild.id);
    }
    return { parentId: rootId, leg: 'LEFT' };
};

export const processNewMember = async (newUser: User) => {
    const date = new Date().toISOString().split('T')[0];
    const adminUser = await (User as any).findOne({ where: { role: 'ADMIN' } });

    // --- 1. PRODUCT LINKING: Starter Commodity Pack (10% back) ---
    const productCredit = SETTINGS.JOINING_FEE * 0.10;
    newUser.balance += productCredit;
    await (Transaction as any).create({
        userId: newUser.id, userName: newUser.name, type: 'MARKET_CREDIT', amount: productCredit,
        date, status: 'APPROVED', description: `Product Activation: Starter Commodity Pack`
    });
    // Fixed: Cast to any to access save() method on Sequelize model instance
    await (newUser as any).save();

    // --- 2. REVENUE INFLOW: Joining Fee to Company ---
    if (adminUser) {
        adminUser.balance += SETTINGS.JOINING_FEE;
        await (Transaction as any).create({
            userId: adminUser.id, userName: adminUser.name, type: 'JOINING_FEE', amount: SETTINGS.JOINING_FEE,
            date, status: 'APPROVED', description: `Revenue: Activation Fee (${newUser.username})`
        });
        // Fixed: Cast to any to access save() method
        await (adminUser as any).save();
    }

    // --- 3. SPONSOR & LEVEL BONUSES ---
    if (newUser.sponsorId) {
        const sponsor = await (User as any).findByPk(newUser.sponsorId);
        if (sponsor) {
            sponsor.balance += SETTINGS.REFERRAL_BONUS;
            sponsor.totalEarnings += SETTINGS.REFERRAL_BONUS;
            sponsor.downlineCount += 1;
            if (sponsor.downlineCount >= 5 && sponsor.rank === 'Distributor') sponsor.rank = 'Star Agent';
            // Fixed: Cast to any to access save() method
            await (sponsor as any).save();
            await (Transaction as any).create({
                userId: sponsor.id, userName: sponsor.name, type: 'COMMISSION', amount: SETTINGS.REFERRAL_BONUS,
                date, status: 'APPROVED', description: `Direct Referral: ${newUser.username}`
            });

            let currentUplineId = sponsor.sponsorId;
            let currentLevel = 2;
            while (currentUplineId && currentLevel <= SETTINGS.MAX_LEVEL) {
                const upline = await (User as any).findByPk(currentUplineId);
                if (!upline) break;
                upline.balance += SETTINGS.LEVEL_INCOME;
                upline.totalEarnings += SETTINGS.LEVEL_INCOME;
                // Fixed: Cast to any to access save() method
                await (upline as any).save();
                await (Transaction as any).create({
                    userId: upline.id, userName: upline.name, type: 'LEVEL_INCOME', amount: SETTINGS.LEVEL_INCOME,
                    date, status: 'APPROVED', description: `Level ${currentLevel} Income: ${newUser.username}`
                });
                currentUplineId = upline.sponsorId;
                currentLevel++;
            }
        }
    }

    // --- 4. BINARY MATCHING (Recursive Tree Traversal with 20-Pair Daily Cap) ---
    let currentNodeId: string | null = newUser.parentId;
    let fromNodeId: string = newUser.id;
    let loopCount = 0;

    while (currentNodeId && loopCount < 500) {
        const parent = await (User as any).findByPk(currentNodeId);
        if (!parent) break;

        const leftChild = await (User as any).findOne({ where: { parentId: parent.id, leg: 'LEFT' }, attributes: ['id'] });
        if (leftChild && leftChild.id === fromNodeId) parent.binaryLeftCount += 1;
        else parent.binaryRightCount += 1;

        const totalPairs = Math.min(parent.binaryLeftCount, parent.binaryRightCount);
        const unpaidPairs = totalPairs - parent.binaryPaidPairs;

        if (unpaidPairs > 0) {
            // Check Daily Cap
            let dailyData = { date: '', count: 0 };
            try { dailyData = JSON.parse(parent.dailyBinaryPairs || '{}'); } catch(e) {}
            if (dailyData.date !== date) dailyData = { date, count: 0 };

            const remainingInCap = Math.max(0, SETTINGS.BINARY_DAILY_CAP_PAIRS - dailyData.count);
            const payablePairs = Math.min(unpaidPairs, remainingInCap);

            if (payablePairs > 0) {
                const bonus = payablePairs * SETTINGS.MATCHING_BONUS;
                parent.balance += bonus;
                parent.totalEarnings += bonus;
                dailyData.count += payablePairs;
                parent.dailyBinaryPairs = JSON.stringify(dailyData);
                
                await (Transaction as any).create({
                    userId: parent.id, userName: parent.name, type: 'MATCHING_BONUS', amount: bonus,
                    date, status: 'APPROVED', description: `Binary Match (${payablePairs} pairs)${payablePairs < unpaidPairs ? ' - LIMIT REACHED' : ''}`
                });
            }
            
            parent.binaryPaidPairs = totalPairs;
            if (totalPairs >= 50 && parent.rank === 'Star Agent') parent.rank = 'Ruby Manager';
            if (totalPairs >= 200 && parent.rank === 'Ruby Manager') parent.rank = 'Emerald Director';
            if (totalPairs >= 1000 && parent.rank === 'Emerald Director') parent.rank = 'Crown Diamond';
        }

        // Fixed: Cast to any to access save() method
        await (parent as any).save();
        fromNodeId = parent.id;
        currentNodeId = parent.parentId;
        loopCount++;
    }
};