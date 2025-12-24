
import { User } from '../types';

export interface RiskFactor {
    id: string;
    label: string;
    impact: number;
    isNegative: boolean;
}

/**
 * Calculates a dynamic risk score (0-100).
 * High score (80+) = Secure
 * Medium score (50-79) = Guarded
 * Low score (<50) = Critical / Restricted
 */
export const calculateUserRiskScore = (user: User): { score: number, factors: RiskFactor[] } => {
    let score = 20; // Base score for any registered node
    const factors: RiskFactor[] = [];

    // 1. Identity Verification (KYC)
    if (user.kycStatus === 'VERIFIED') {
        score += 40;
        factors.push({ id: 'kyc', label: 'Identity Synchronized', impact: 40, isNegative: false });
    } else if (user.kycStatus === 'PENDING') {
        score += 10;
        factors.push({ id: 'kyc_pending', label: 'Identity Sync Pending', impact: 10, isNegative: false });
    } else {
        factors.push({ id: 'no_kyc', label: 'Identity Unlinked', impact: -20, isNegative: true });
    }

    // 2. 2-Step Verification
    if (user.isTwoFactorEnabled) {
        score += 30;
        factors.push({ id: '2fa', label: '2FA Protocol Active', impact: 30, isNegative: false });
    } else {
        factors.push({ id: 'no_2fa', label: 'No Secondary Auth', impact: -30, isNegative: true });
    }

    // 3. Wallet Restrictions
    if (user.walletLocked) {
        score -= 50;
        factors.push({ id: 'locked', label: 'Vault Access Restricted', impact: -50, isNegative: true });
    }

    // 4. Security Cooldown
    if (user.securityCooldownUntil) {
        const expiry = new Date(user.securityCooldownUntil);
        if (expiry > new Date()) {
            score -= 20;
            factors.push({ id: 'cooldown', label: 'Security Cooldown Active', impact: -20, isNegative: true });
        }
    }

    // 5. Activity Status
    if (user.status === 'BLOCKED') {
        score = 0;
        factors.push({ id: 'blocked', label: 'Node Fully Terminated', impact: -100, isNegative: true });
    }

    // Ensure bounds
    const finalScore = Math.max(0, Math.min(100, score));

    return { score: finalScore, factors };
};

export const getRiskColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-500';
};

export const getRiskBgClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
};
