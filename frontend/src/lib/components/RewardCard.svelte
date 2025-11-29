<script lang="ts">
  import type { Reward } from '$lib/types/rewards';
  import { getRewardState, purchaseReward } from '$lib/stores/rewards';
  import { starBalance } from '$lib/stores/rewards';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  export let reward: Reward;

  let userStars = 0;
  const unsubscribe = starBalance.subscribe((v) => (userStars = v));

  $: state = getRewardState(reward, userStars);

  function handleBuy() {
    try {
      const purchase = purchaseReward(reward.id);
      // simple feedback
      alert(`Purchased ${purchase.rewardName}!`);
    } catch (e: any) {
      alert(e?.message || 'Unable to purchase');
    }
  }

  onMount(() => {
    return () => unsubscribe();
  });
</script>

<div class="card reward-card {state}">
  {#if reward.image}
    <div class="image-wrap">
      <img src={reward.image} alt={reward.name} />
    </div>
  {:else}
    <div class="emoji">{reward.emoji}</div>
  {/if}

  <h3 class="title">{reward.name}</h3>
  <p class="desc">{reward.description}</p>
  <div class="meta">
    <div class="cost">⭐ {reward.starCost}</div>
    {#if state === 'cooldown'}
      <div class="cooldown">On cooldown</div>
    {/if}
  </div>
  <button on:click={handleBuy} disabled={state !== 'affordable'} class="buy">{state==='affordable'?'Purchase':'Unavailable'}</button>
</div>

<style>
.reward-card{transition:transform .18s ease, box-shadow .18s ease;overflow:hidden;border-radius:12px}
.reward-card:hover{transform:translateY(-8px);}
.reward-card.locked{opacity:.5;}
.reward-card.cooldown{opacity:.7;}
.reward-card .image-wrap{width:100%;height:140px;overflow:hidden;background:var(--color-card-bg);display:flex;align-items:center;justify-content:center}
.reward-card .image-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.reward-card .emoji{font-size:2.2rem;padding:18px;text-align:center}
.reward-card .meta{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.reward-card .buy{margin-top:12px}
</style>
