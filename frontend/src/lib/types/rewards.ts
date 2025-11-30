export interface Reward {
  id: string;
  name: string;
  emoji: string;
  description: string;
  starCost: number;
  image?: string;
  cooldownEndsAt?: number; // Unix timestamp
}

export interface PurchaseRecord {
  id: string;
  rewardId: string;
  rewardName: string;
  starsCost: number;
  purchasedAt: number;
  cooldownEndsAt: number;
}

export type RewardState = 'locked' | 'affordable' | 'cooldown';

export const PREDEFINED_REWARDS: Reward[] = [
  { id: '1', name: 'Night Out', emoji: '🎉', description: 'Enjoy a night out', starCost: 100 },
];
