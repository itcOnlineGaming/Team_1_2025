
<script lang="ts">
  import { type BodyAccessory, type HeadAccessory, type SkinColour, Emotions} from "../../../types/Cat";
  import { getEmotion } from "./catEmotion";

    export let percentage : number;
    export let Head : HeadAccessory;
    export let Skin : SkinColour;
    export let Body : BodyAccessory;
    export let streak : number;
    let emotion: Emotions;

    $: emotion = getEmotion(percentage , streak);

</script>

<div style="font-family: monospace; white-space: pre; line-height: 1.2;">
  <div>Percentage: {percentage} %</div>
  <div>Head ID: {Head}</div>
  <div>Skin ID: {Skin}</div>
  <div>Body ID: {Body}</div>
  <div>Streak: {streak}</div>
  <div>Emotion: {emotion}</div>
</div>

