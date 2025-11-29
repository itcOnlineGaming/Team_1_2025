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
  { id: '2', name: 'Takeaway Meal', emoji: '🍕', description: 'Order your favorite food', starCost: 50 },
  { id: '3', name: 'Movie Night', emoji: '🎬', description: 'Cinema or streaming treat', starCost: 75 },
  { id: '4', name: 'Coffee Treat', emoji: '☕', description: 'Premium coffee break', starCost: 25 },
  { id: '5', name: 'Gaming Session', emoji: '🎮', description: 'Guilt-free gaming time', starCost: 60 },
  { id: '6', name: 'Shopping Spree', emoji: '🛍️', description: 'Treat yourself shopping', starCost: 150 },
  { id: '7', name: 'Dessert Special', emoji: '🍰', description: 'Sweet indulgence', starCost: 40 },
  { id: '8', name: 'Spa Day', emoji: '💆', description: 'Relaxation and self-care', starCost: 200 }
];
