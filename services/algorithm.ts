
import { User, Transaction, SystemSettings, Rank } from '../types';

/**
 * Finds the first available spot in the binary tree using Breadth-First Search (BFS).
 * Fills Left leg first, then Right.
 */
export const findAutoPlacement = (users: User[], rootId: string): { parentId: string, leg: 'LEFT' | 'RIGHT' } => {
    const userMap = new Map(users.map(u => [u.id, u]));
    const queue = [rootId];

    // Safety: If root doesn't exist, default to first user or admin
    if (!userMap.has(rootId)) return { parentId: users[0]?.id || 'admin1', leg: 'LEFT' };

    while (queue.length > 0) {
        const currId = queue.shift()!;
        
        // Find direct children
        const children = users.filter(u => u.parentId === currId);
        const leftChild = children.find(c => c.leg === 'LEFT');
        const rightChild = children.find(c => c.leg === 'RIGHT');

        // Priority 1: Fill Left Empty Slot
        if (!leftChild) return { parentId: currId, leg: 'LEFT' };
        
        // Priority 2: Fill Right Empty Slot
        if (!rightChild) return { parentId: currId, leg: 'RIGHT' };

        // If both full, add to queue to search next level
        queue.push(leftChild.id);
        queue.push(rightChild.id);
    }

    return { parentId: rootId, leg: 'LEFT' };
};

/**
 * Checks if a target user is a descendant of a specific root.
 * Used to ensure Tree Integrity (prevent cross-line placement).
 */
export const isDescendant = (users: User[], targetId: string, rootId: string): boolean => {
    if (targetId === rootId) return true;
    
    let curr = users.find(u => u.id === targetId);
    let depth = 0;
    
    while (curr && curr.parentId && depth < 100) {
        if (curr.parentId === rootId) return true;
        curr = users.find(u => u.id === curr.parentId);
        depth++;
    }
    
    return false;
};

/**
 * MAIN ALGORITHM: Processes a new user registration.
 * 1. Calculates Joining Fee
 * 2. Assigns Referral Bonus
 * 3. Distributes Level Income (Unilevel)
 * 4. Calculates Binary Matching Bonus (Traversing up)
 * 5. Returns updated User list and new Transactions
 */
export const processNewMemberLogic = (
    newUser: User,
    currentUsers: User[],
    settings: SystemSettings
): { updatedUsers: User[], newTransactions: Transaction[] } => {
    
    // Create a mutable map for efficient updates
    const usersMap = new Map(currentUsers.map(u => [u.id, { ...u }]));
    
    // Add new user to map
    usersMap.set(newUser.id, newUser);

    const newTx: Transaction[] = [];
    const date = new Date().toISOString().split('T')[0];
    const { joiningFee, referralBonus, levelIncomeBonus, matchingBonus } = settings;

    // --- 1. JOINING FEE (Company Credit) ---
    newTx.push({
        id: `tx-join-${newUser.id}`,
        userId: newUser.id,
        userName: newUser.name,
        type: 'JOINING_FEE',
        amount: joiningFee,
        date,
        status: 'APPROVED',
        description: 'Membership Joining Fee'
    });

    // --- 2. SPONSOR & LEVEL BONUS ---
    if (newUser.sponsorId) {
        const sponsor = usersMap.get(newUser.sponsorId);
        if (sponsor) {
            // Direct Referral
            sponsor.balance += referralBonus;
            sponsor.totalEarnings += referralBonus;
            sponsor.downlineCount = (sponsor.downlineCount || 0) + 1;
            
            // Check Rank Upgrade (Simple Logic: 5 directs = Leader)
            if (sponsor.downlineCount >= 5 && sponsor.rank === Rank.MEMBER) {
                sponsor.rank = Rank.LEADER;
            }

            newTx.push({
                id: `tx-ref-${newUser.id}`,
                userId: sponsor.id,
                userName: sponsor.name,
                type: 'COMMISSION',
                amount: referralBonus,
                date,
                status: 'APPROVED',
                description: `Direct Referral Bonus from ${newUser.username}`
            });

            // Unilevel (Levels 2-5)
            let currentUplineId = sponsor.sponsorId;
            let currentLevel = 2;
            const maxLevel = 5;

            while (currentUplineId && currentLevel <= maxLevel) {
                const upline = usersMap.get(currentUplineId);
                if (!upline) break;

                upline.balance += levelIncomeBonus;
                upline.totalEarnings += levelIncomeBonus;
                
                newTx.push({
                    id: `tx-lvl-${newUser.id}-${currentLevel}`,
                    userId: upline.id,
                    userName: upline.name,
                    type: 'LEVEL_INCOME',
                    amount: levelIncomeBonus,
                    date,
                    status: 'APPROVED',
                    description: `Level ${currentLevel} Income from ${newUser.username}`
                });

                currentUplineId = upline.sponsorId;
                currentLevel++;
            }
        }
    }

    // --- 3. BINARY MATCHING BONUS ---
    // Traverse UP the tree from the Placement Parent
    let currentNode = newUser;
    let loopSafety = 0;

    while (currentNode.parentId && loopSafety < 500) {
        const parent = usersMap.get(currentNode.parentId);
        if (!parent) break;

        // Determine which leg the update came from
        if (currentNode.leg === 'LEFT') {
            parent.binaryLeftCount = (parent.binaryLeftCount || 0) + 1;
        } else if (currentNode.leg === 'RIGHT') {
            parent.binaryRightCount = (parent.binaryRightCount || 0) + 1;
        }

        // Check for Matches
        const currentLeft = parent.binaryLeftCount || 0;
        const currentRight = parent.binaryRightCount || 0;
        const pairs = Math.min(currentLeft, currentRight);
        const paidPairs = parent.binaryPaidPairs || 0;
        
        const newPairs = pairs - paidPairs;

        if (newPairs > 0) {
            const binaryBonus = newPairs * matchingBonus;
            
            parent.balance += binaryBonus;
            parent.totalEarnings += binaryBonus;
            parent.binaryPaidPairs = pairs;
            
            // Rank Logic based on volume (Simplified)
            if (pairs >= 50 && parent.rank === Rank.LEADER) parent.rank = Rank.MANAGER;
            if (pairs >= 200 && parent.rank === Rank.MANAGER) parent.rank = Rank.DIRECTOR;
            if (pairs >= 1000 && parent.rank === Rank.DIRECTOR) parent.rank = Rank.DIAMOND;

            newTx.push({
                id: `tx-match-${parent.id}-${Date.now()}-${loopSafety}`,
                userId: parent.id,
                userName: parent.name,
                type: 'MATCHING_BONUS',
                amount: binaryBonus,
                date,
                status: 'APPROVED',
                description: `Binary Match Bonus (${newPairs} New Pairs)`
            });
        }

        // Move up
        currentNode = parent;
        loopSafety++;
    }

    return { 
        updatedUsers: Array.from(usersMap.values()), 
        newTransactions: newTx 
    };
};
