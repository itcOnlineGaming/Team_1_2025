<script lang="ts">
  import { starBalance } from '$lib/stores/rewards';
  import { onMount } from 'svelte';
  let stars = 0;
  const unsub = starBalance.subscribe((v) => (stars = v));
  onMount(() => () => unsub());
</script>

<div class="star-balance">
  <div class="label">Your Stars</div>
  <div class="value">⭐ {stars}</div>
</div>

<style>
.star-balance{display:flex;align-items:center;gap:12px;color:var(--color-text-on-dark)}
.star-balance .value{font-weight:700}
</style>
