<script lang="ts">
  import RewardCard from './RewardCard.svelte';
  import { rewards, starBalance } from '$lib/stores/rewards';
  import { derived } from 'svelte/store';

  const list = rewards;
  const stars = starBalance;
</script>

<div class="grid">
  {#each $list as r}
    <RewardCard {r} reward={r} />
  {/each}
</div>

<style>
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));}
.grid .card{padding:16px}
</style>
