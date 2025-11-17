<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { sessionStats } from '$lib/stores/sessionStore';
    import { storeStore, availableStars } from '$lib/stores/storeStore';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
    import { onMount } from 'svelte';

    let stars = $state(0);
    let stats = $state<any>(null);
    let purchases = $state<any>([]);
    let cooldowns = $state<Map<number, { onCooldown: boolean; timeRemaining: number }>>(new Map());

    // Store items that can be purchased
    const storeItems = [
        {
            id: 1,
            name: 'Night Out',
            description: 'Treat yourself to a fun night out with friends!',
            stars: 50,
            icon: '🎉',
            category: 'experience'
        },
        {
            id: 2,
            name: 'Takeaway Meal',
            description: 'Order your favorite takeaway - you earned it!',
            stars: 25,
            icon: '🍕',
            category: 'food'
        },
        {
            id: 3,
            name: 'Movie Night',
            description: 'Cinema tickets or streaming rental for a cozy night in',
            stars: 15,
            icon: '🎬',
            category: 'entertainment'
        },
        {
            id: 4,
            name: 'Coffee Treat',
            description: 'Your favorite coffee shop beverage',
            stars: 10,
            icon: '☕',
            category: 'food'
        },
        {
            id: 5,
            name: 'Gaming Session',
            description: '2 hours of guilt-free gaming time',
            stars: 20,
            icon: '🎮',
            category: 'entertainment'
        },
        {
            id: 6,
            name: 'Shopping Spree',
            description: 'Small shopping budget for something nice',
            stars: 40,
            icon: '🛍️',
            category: 'shopping'
        },
        {
            id: 7,
            name: 'Dessert Special',
            description: 'Ice cream, cake, or your favorite sweet treat',
            stars: 12,
            icon: '🍰',
            category: 'food'
        },
        {
            id: 8,
            name: 'Spa Day',
            description: 'Relaxing spa treatment or massage',
            stars: 60,
            icon: '💆',
            category: 'wellness'
        }
    ];

    onMount(() => {
        // Subscribe to available stars
        const unsubscribeStars = availableStars.subscribe((s) => {
            stars = s;
        });

        // Subscribe to session stats
        const unsubscribeStats = sessionStats.subscribe((s) => {
            stats = s;
        });

        // Subscribe to store state for purchases
        const unsubscribeStore = storeStore.subscribe((s) => {
            purchases = s.purchases;
        });

        // Update cooldowns periodically
        const updateCooldowns = () => {
            const newCooldowns = new Map();
            storeItems.forEach(item => {
                const cooldownInfo = storeStore.isItemOnCooldown(item.id);
                newCooldowns.set(item.id, cooldownInfo);
            });
            cooldowns = newCooldowns;
        };

        updateCooldowns();
        const interval = setInterval(updateCooldowns, 1000);

        return () => {
            unsubscribeStars();
            unsubscribeStats();
            unsubscribeStore();
            clearInterval(interval);
        };
    });

    function formatTimeRemaining(ms: number): string {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    function purchaseItem(item: typeof storeItems[0]) {
        const cooldown = cooldowns.get(item.id);
        
        if (cooldown?.onCooldown) {
            alert(`This item is on cooldown! Available again in ${formatTimeRemaining(cooldown.timeRemaining)}`);
            return;
        }

        if (stars >= item.stars) {
            if (confirm(`Purchase ${item.name} for ${item.stars} stars?\n\nThis item will be locked for 24 hours after purchase.`)) {
                storeStore.purchaseItem(item.id, item.name, item.stars);
                alert(`🎉 Congratulations! You've claimed ${item.name}!\n\n${item.stars} stars have been deducted from your balance.\n\nThis reward is now on a 24-hour cooldown.`);
            }
        } else {
            alert(`You need ${item.stars - stars} more stars to purchase this item. Keep completing sessions!`);
        }
    }

    function goBack() {
        goto(`${base}/`);
    }
</script>

<div class="store-page">
    <div class="page-header">
        <button class="btn-back" onclick={goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </button>
        <h1>⭐ Rewards Store</h1>
        <div class="star-balance">
            <span class="balance-label">Your Stars:</span>
            <span class="balance-amount">{stars} ⭐</span>
        </div>
    </div>

    <div class="store-intro">
        <p>Earn stars by completing sessions and providing ratings. Trade your stars for real-world rewards!</p>
    </div>

    {#if stats && stats.totalSessions > 0}
        <div class="items-grid">
            {#each storeItems as item (item.id)}
                {@const cooldown = cooldowns.get(item.id)}
                {@const isOnCooldown = cooldown?.onCooldown || false}
                {@const canAfford = stars >= item.stars}
                <div class="store-item" class:affordable={canAfford && !isOnCooldown} class:on-cooldown={isOnCooldown}>
                    <div class="item-icon">{item.icon}</div>
                    {#if isOnCooldown && cooldown}
                        <div class="cooldown-badge">
                            🔒 {formatTimeRemaining(cooldown.timeRemaining)}
                        </div>
                    {/if}
                    <h3>{item.name}</h3>
                    <p class="item-description">{item.description}</p>
                    <div class="item-footer">
                        <div class="item-price">
                            <span class="price-amount">{item.stars}</span>
                            <span class="price-icon">⭐</span>
                        </div>
                        <button 
                            class="btn-purchase"
                            class:btn-disabled={!canAfford || isOnCooldown}
                            onclick={() => purchaseItem(item)}
                            disabled={!canAfford || isOnCooldown}
                        >
                            {isOnCooldown ? 'Cooldown' : (canAfford ? 'Claim' : 'Locked')}
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="empty-state">
            <div class="empty-icon">⭐</div>
            <h2>Start Earning Stars!</h2>
            <p>Complete sessions and provide ratings to earn stars that you can exchange for rewards.</p>
            <button class="btn-primary btn-large" onclick={goBack}>
                Start Your First Session
            </button>
        </div>
    {/if}
</div>

<MobileBottomNav />

<style>
    .store-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        padding-bottom: 6rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .page-header h1 {
        margin: 0;
        color: var(--color-text-on-dark);
        font-size: 2rem;
        flex: 1;
        text-align: center;
    }

    .btn-back {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    .btn-back:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateX(-2px);
    }

    .star-balance {
        background: var(--color-accent);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .balance-label {
        font-size: 0.9rem;
    }

    .balance-amount {
        font-size: 1.25rem;
    }

    .store-intro {
        background: var(--color-card-bg);
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        text-align: center;
        border: 2px solid var(--color-border);
    }

    .store-intro p {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.05rem;
    }

    .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .store-item {
        background: var(--color-card-bg);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        transition: all 0.3s;
        opacity: 0.7;
        position: relative;
    }

    .store-item.on-cooldown {
        opacity: 0.5;
        border-color: var(--color-text-muted);
    }

    .store-item.on-cooldown .item-icon {
        filter: grayscale(100%);
    }

    .cooldown-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--color-text-muted);
        color: var(--color-card-bg);
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 1;
    }

    .store-item.affordable {
        opacity: 1;
        border-color: var(--color-accent);
    }

    .store-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .item-icon {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 1rem;
    }

    .store-item h3 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
        text-align: center;
    }

    .item-description {
        margin: 0 0 1.5rem 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        text-align: center;
        flex: 1;
    }

    .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--color-border);
    }

    .item-price {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 700;
        color: var(--color-accent);
    }

    .price-amount {
        font-size: 1.5rem;
    }

    .price-icon {
        font-size: 1.25rem;
    }

    .btn-purchase {
        background: var(--color-accent);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.95rem;
    }

    .btn-purchase:hover:not(:disabled) {
        background: var(--color-accent-hover);
        transform: scale(1.05);
    }

    .btn-purchase.btn-disabled {
        background: var(--color-text-secondary);
        cursor: not-allowed;
        opacity: 0.6;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        margin-top: 2rem;
        background: var(--color-card-bg);
        border-radius: 12px;
        border: 2px dashed var(--color-border);
    }

    .empty-icon {
        font-size: 5rem;
        margin-bottom: 1rem;
    }

    .empty-state h2 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
    }

    .empty-state p {
        margin: 0 0 2rem 0;
        color: var(--color-text-secondary);
        font-size: 1.05rem;
    }

    .btn-large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }

    @media (max-width: 768px) {
        .store-page {
            padding: 1rem;
            padding-bottom: 6rem;
        }

        .btn-back {
            display: none;
        }

        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .page-header h1 {
            order: -1;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .btn-back {
            width: 100%;
            justify-content: center;
        }

        .star-balance {
            width: 100%;
            justify-content: center;
            order: -2;
            margin-bottom: 0.5rem;
        }

        .items-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
