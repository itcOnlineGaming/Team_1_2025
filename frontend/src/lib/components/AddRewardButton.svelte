<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AddRewardModal from './AddRewardModal.svelte';
  let open = false;
  const dispatch = createEventDispatcher();
  function toggle() { open = !open; }
</script>

<div>
  <button on:click={toggle} class="btn-add">➕ Add Reward</button>
  {#if open}
    <div class="overlay" on:click={() => (open = false)}></div>
    <div class="dialog"><AddRewardModal on:added={(e) => { open = false; dispatch('added', e.detail); }} /></div>
  {/if}
</div>

<style>
.btn-add{padding:8px 12px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4)}
.dialog{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;padding:12px;border-radius:6px;z-index:60;max-width:420px;width:90%}
</style>
