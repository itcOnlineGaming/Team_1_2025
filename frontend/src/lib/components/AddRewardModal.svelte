<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { addReward } from '$lib/stores/rewards';

  const dispatch = createEventDispatcher();

  let name = '';
  // no emoji for user-created rewards when an image is provided
  let emoji = '';
  let description = '';
  let starCost = 10;
  let imageFile: File | null = null;
  let preview = '';

  function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    imageFile = f;
    if (f) {
      const reader = new FileReader();
      reader.onload = () => (preview = String(reader.result));
      reader.readAsDataURL(f);
    } else preview = '';
  }

  function submit() {
    try {
      const r = addReward({ name: (name ?? '').toString().trim(), emoji, description, starCost: Number(starCost), image: preview });
      dispatch('added', { reward: r });
      // reset
      name = '';
      description = '';
      starCost = 10;
      preview = '';
    } catch (e: any) {
      alert(e?.message || 'Unable to create reward');
    }
  }
</script>

<div class="modal">
  <h3>Add Reward</h3>
  <label>Name <input bind:value={name} /></label>
  <label>Description <textarea bind:value={description}></textarea></label>
  <label>Star Cost <input type="number" bind:value={starCost} min="1"/></label>
  <label>Image <input type="file" accept="image/*" on:change={handleFile} /></label>
  {#if preview}
    <img src={preview} alt="preview" style="max-width:100px;display:block;margin-top:8px" />
  {/if}
  <div style="margin-top:12px"><button on:click={submit}>Create</button></div>
</div>

<style>
.modal{padding:12px}
label{display:block;margin-top:8px}
input,textarea{width:100%;box-sizing:border-box}
</style>
