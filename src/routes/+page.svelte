<script lang="ts">
  import Cat from '$lib/components/Cat/Cat.svelte';
  import { BodyAccessory, HeadAccessory, SkinColour } from '../types/Cat';

  let wordsNeeded : number = 300;
  let Head: HeadAccessory = HeadAccessory.None;
  let Body: BodyAccessory = BodyAccessory.None;
  let Skin: SkinColour = SkinColour.White;
  let streak = 1;

  let userInput = '';

    $: wordCount = userInput.trim().length === 0 
    ? 0 
    : userInput.trim().split(/\s+/).length;

    $: percentage = Number(Math.min(wordCount / wordsNeeded, 1).toFixed(2)) * 100;


    function handleNewDay(){
        if (wordCount<wordsNeeded){
            streak = 0;
        }
        else {
            streak ++;
        }
        userInput='';
    }


</script>

<style>
  .container {
    position: relative;
    padding: 1rem;
    height: 100vh;
  }

  .cat-top-right {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .typing-box {
    width: 60vw;
    font-size: 1.2rem;
    padding: 0.5rem;
    height: 40vh;
  }

  .word-count {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: #555;
  }
</style>

<div class="container">
  <div class="cat-top-right">
    <Cat {percentage} {Head} {Body} {Skin} {streak} />
  </div>

  <textarea
  class="typing-box"
  bind:value={userInput}
  placeholder="Type here..."
  aria-label="Typing box"
/>
  <div class="word-count">Word count: {wordCount} / {wordsNeeded}</div>

  <button onclick={handleNewDay}>Next Day</button>
</div>
