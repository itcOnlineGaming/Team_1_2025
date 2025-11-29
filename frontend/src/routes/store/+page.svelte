<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
  import RewardGrid from '$lib/components/RewardGrid.svelte';
  import StarBalance from '$lib/components/StarBalance.svelte';
  import AddRewardButton from '$lib/components/AddRewardButton.svelte';
  import { starBalance } from '$lib/stores/rewards';
  let stars = 0;
  const unsub = starBalance.subscribe((v) => (stars = v));
  import { onDestroy } from 'svelte';
  onDestroy(() => unsub());

  function goBack() {
    goto(`${base}/`);
  }
</script>

<div class="page">
  <button class="btn-back" onclick={goBack} title="Go back">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    Back
  </button>

  <header class="page-header">
    <h1>Reward Store</h1>
    <div class="header-actions">
      <StarBalance />
      <AddRewardButton />
    </div>
  </header>

  <main>
    <RewardGrid />
  </main>

  <MobileBottomNav />
</div>

<style>
.page{padding:18px;padding-bottom:6rem;min-height:100vh}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.header-actions{display:flex;gap:12px;align-items:center}
main{min-height:200px}

.btn-back{
  position:absolute;
  top:18px;
  left:18px;
  background:var(--color-card-bg);
  color:var(--color-text-primary);
  border:1px solid var(--color-border);
  padding:0.6rem 1.2rem;
  border-radius:8px;
  cursor:pointer;
  font-size:0.95rem;
  font-weight:500;
  transition:all 0.2s;
  display:flex;
  align-items:center;
  gap:0.5rem;
  z-index:10;
}

.btn-back svg{width:18px;height:18px}

.btn-back:hover{background:var(--color-primary);color:white;border-color:var(--color-primary)}

@media (max-width:768px){
  .btn-back{display:none}
  .page{padding:12px;padding-bottom:6rem}
}
</style>