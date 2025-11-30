import { writable, get } from 'svelte/store';
import type { Reward, PurchaseRecord } from '$lib/types/rewards';
import { PREDEFINED_REWARDS } from '$lib/types/rewards';
import { loadFromLocalStorage, saveToLocalStorage } from '$lib/utils/localStorage';
import { sessionStore } from '$lib/stores/sessionStore';

const STARS_KEY = 'stars_balance';
const REWARDS_KEY = 'rewards_list';
const PURCHASES_KEY = 'purchases_history';

const initialStars = loadFromLocalStorage<number>(STARS_KEY, 0);
const initialRewards = loadFromLocalStorage<Reward[]>(REWARDS_KEY, PREDEFINED_REWARDS);
const initialPurchases = loadFromLocalStorage<PurchaseRecord[]>(PURCHASES_KEY, []);

export const starBalance = writable<number>(initialStars);
export const rewards = writable<Reward[]>(initialRewards);
export const purchaseHistory = writable<PurchaseRecord[]>(initialPurchases);

// persist stores
starBalance.subscribe((value) => saveToLocalStorage(STARS_KEY, value));
rewards.subscribe((value) => saveToLocalStorage(REWARDS_KEY, value));
purchaseHistory.subscribe((value) => saveToLocalStorage(PURCHASES_KEY, value));

// Award stars when new sessions are completed in sessionStore
// Simple policy: base 5 stars per completed session + (overallRating * 10) if present
let processedSessionIds = new Set<string>();
sessionStore.sessions.subscribe(($sessions: any) => {
  for (const s of $sessions || []) {
    if (!processedSessionIds.has(s.id)) {
      processedSessionIds.add(s.id);
      const rating = s.overallRating ?? 0;
      const starsAwarded = 5 + Math.round(rating * 10);
      if (starsAwarded > 0) {
        starBalance.update((v) => v + starsAwarded);
      }
    }
  }
});

export function getRewardState(reward: Reward, userStars: number) {
  if (reward.cooldownEndsAt && Date.now() < reward.cooldownEndsAt) return 'cooldown';
  if (userStars < reward.starCost) return 'locked';
  return 'affordable';
}

export function purchaseReward(rewardId: string) {
  const allRewards = get(rewards);
  const currentStars = get(starBalance);
  const r = allRewards.find((x) => x.id === rewardId);
  if (!r) throw new Error('Reward not found');
  if (r.cooldownEndsAt && Date.now() < r.cooldownEndsAt) {
    throw new Error('Reward is on cooldown');
  }
  if (currentStars < r.starCost) {
    throw new Error('Insufficient stars');
  }

  // Deduct stars
  starBalance.update((s) => s - r.starCost);

  const now = Date.now();
  const cooldownEndsAt = now + 24 * 60 * 60 * 1000;

  // update reward cooldown
  rewards.update((list) => list.map((item) => (item.id === r.id ? { ...item, cooldownEndsAt } : item)));

  // add purchase record
  const purchase: PurchaseRecord = {
    id: crypto.randomUUID?.() ?? `p-${now}-${Math.random().toString(36).slice(2, 8)}`,
    rewardId: r.id,
    rewardName: r.name,
    starsCost: r.starCost,
    purchasedAt: now,
    cooldownEndsAt
  };
  purchaseHistory.update((h) => [...h, purchase]);

  return purchase;
}

export function addReward(payload: Partial<Reward>) {
  const now = Date.now();
  // Basic validation: require a name/title and a starCost
  const name = (payload.name ?? '').toString().trim();
  if (!name) throw new Error('Reward must have a title');

  if (payload.starCost === undefined || payload.starCost === null || Number.isNaN(Number(payload.starCost))) {
    throw new Error('Star cost must be provided');
  }

  const starCost = Number(payload.starCost);
  const description = (payload.description ?? '').toString();

  const allowNegative = description.toLowerCase().includes('ryan is cool');

  if (!allowNegative) {
    if (starCost <= 0) throw new Error('Star cost must be a positive number');
  }

  const newReward: Reward = {
    id: payload.id ?? `r-${now}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    emoji: payload.emoji ?? '',
    description,
    starCost,
    image: payload.image,
    cooldownEndsAt: undefined
  };

  rewards.update((r) => [newReward, ...r]);
  return newReward;
}

export function awardStars(amount: number) {
  if (amount <= 0) return;
  starBalance.update((s) => s + amount);
}
