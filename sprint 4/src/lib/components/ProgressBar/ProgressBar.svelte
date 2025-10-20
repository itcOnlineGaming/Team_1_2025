<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { progressBarColor } from './getProgressColour';

  export let percentage: number = 0;

  $: colour = progressBarColor(percentage);

  const animated = tweened(0, {
    duration: 800,
    easing: cubicOut,
  });

  $: animated.set(Math.min(Math.max(percentage, 0), 100));
</script>

<style>
  .container {
    width: 100%;
    height: 20px;
    background: #ddd;
    border-radius: 10px;
    overflow: hidden;
  }

  .bar {
    height: 100%;
    transition: width 0.2s ease;
  }
</style>

<div class="container">
  <div
    class="bar"
    style="width: {$animated}%; background: {colour};"
  ></div>
</div>
