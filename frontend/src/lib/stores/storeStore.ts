import { writable, derived } from 'svelte/store';
import { sessionStats } from './sessionStore';

export interface Purchase {
	itemId: number;
	itemName: string;
	stars: number;
	purchaseTime: number;
	cooldownUntil: number; // Timestamp when item becomes available again
}

export interface StoreState {
	purchases: Purchase[];
	totalStarsSpent: number;
}

function createStoreStore() {
	const storeState = writable<StoreState>({
		purchases: [],
		totalStarsSpent: 0
	});

	// Load from localStorage on init
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('storeState');
		if (stored) {
			try {
				storeState.set(JSON.parse(stored));
			} catch (error) {
				console.error('Error parsing store state from localStorage:', error);
				localStorage.removeItem('storeState');
			}
		}
	}

	// Save to localStorage whenever state changes
	storeState.subscribe((value) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('storeState', JSON.stringify(value));
		}
	});

	return {
		subscribe: storeState.subscribe,

		purchaseItem: (itemId: number, itemName: string, starCost: number) => {
			const now = Date.now();
			const cooldownUntil = now + 24 * 60 * 60 * 1000; // 24 hours from now

			const purchase: Purchase = {
				itemId,
				itemName,
				stars: starCost,
				purchaseTime: now,
				cooldownUntil
			};

			storeState.update((state) => ({
				purchases: [...state.purchases, purchase],
				totalStarsSpent: state.totalStarsSpent + starCost
			}));
		},

		isItemOnCooldown: (itemId: number): { onCooldown: boolean; timeRemaining: number } => {
			let result = { onCooldown: false, timeRemaining: 0 };

			storeState.subscribe((state) => {
				const now = Date.now();
				const lastPurchase = state.purchases
					.filter((p) => p.itemId === itemId)
					.sort((a, b) => b.purchaseTime - a.purchaseTime)[0];

				if (lastPurchase && lastPurchase.cooldownUntil > now) {
					result = {
						onCooldown: true,
						timeRemaining: lastPurchase.cooldownUntil - now
					};
				}
			})();

			return result;
		},

		clearPurchaseHistory: () => {
			storeState.set({
				purchases: [],
				totalStarsSpent: 0
			});
		}
	};
}

export const storeStore = createStoreStore();

// Derived store for available stars (earned - spent)
export const availableStars = derived(
	[sessionStats, storeStore],
	([$sessionStats, $storeState]) => {
		if (!$sessionStats) return 0;

		// Calculate total stars earned from all session ratings
		const totalEarned = $sessionStats.sessions.reduce((total, session) => {
			const sessionStars = Object.values(session.responses)
				.filter((r) => r.rating !== undefined && r.rating > 0)
				.reduce((sum, r) => sum + (r.rating || 0), 0);
			return total + sessionStars;
		}, 0);

		// If sessions were cleared but purchases remain, reset purchases to prevent negative balance
		if (totalEarned === 0 && $storeState.totalStarsSpent > 0) {
			// Clear purchase history since there are no sessions to earn from
			if (typeof window !== 'undefined') {
				localStorage.setItem('storeState', JSON.stringify({ purchases: [], totalStarsSpent: 0 }));
			}
			return 0;
		}

		// Subtract spent stars, ensure never negative
		return Math.max(0, totalEarned - $storeState.totalStarsSpent);
	}
);
