<script lang="ts">
  import { type BodyAccessory, type HeadAccessory, type SkinColour, Emotions } from "../../../types/Cat";
  import { getEmotion } from "./catEmotion";

  export let percentage: number;
  export let Head: HeadAccessory;
  export let Skin: SkinColour;
  export let Body: BodyAccessory;
  export let streak: number;
  let emotion: Emotions;

  const getAsciiCat = (emotion: Emotions): string => {
  switch (emotion) {
    case Emotions.Happy:
      return " /\\_/\\ \n( ^.^ )\n > ^ < ";  // Happy cat
    case Emotions.Neutral:
      return " /\\_/\\ \n( -.- )\n > ^ < ";  // Neutral cat
    case Emotions.Sad:
      return " /\\_/\\ \n( T.T )\n > ^ < ";  // Sad cat
    case Emotions.Elated:
      return " /\\_/\\ \n( o.o )\n > ^ < ";  // Elated cat
    default:
      return "";
  }
};

  $: emotion = getEmotion(percentage, streak);
  $: cat = getAsciiCat(emotion);



</script>

<style>
  .container {
    font-family: monospace;
    white-space: pre;
    line-height: 1.4;
    background-color: #f0f0f0;
    border-radius: 6px;
    padding: 12px 16px;
    max-width: 240px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    color: #333;
  }
  .label {
    font-weight: 600;
    margin-bottom: 6px;
  }
  .value {
    margin-left: 5px;
    color: #007acc;
  }
  .row {
    margin-bottom: 8px;
  }
</style>

<div class="container">
  <div class="row">
    <span class="label">Percentage:</span>
    <span class="value">{percentage} %</span>
  </div>
  <div class="row">
    <span class="label">Streak:</span>
    <span class="value">{streak}</span>
  </div>
  <div class="row">
    <span class="label">Emotion:</span>
    <span class="value">{emotion}</span>
  </div>
  <div>
    {cat}
  </div>
</div>
  
