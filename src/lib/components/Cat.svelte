
<script lang="ts">
  import { type BodyAccessory, type HeadAccessory, type SkinColour, Emotions} from "../../types/Cat";

    export let percentage : number;
    export let Head : HeadAccessory;
    export let Skin : SkinColour;
    export let Body : BodyAccessory;
    export let streak : number;
    let emotion: Emotions;

    switch (true) {
    case percentage >= 80:
        emotion = Emotions.Happy;
        break;
    case percentage >= 50:
        emotion = Emotions.Neutral;
        break;
    default:
        emotion = Emotions.Sad;
    }
    
</script>

<div>
  <div>Percentage: {percentage}</div>
  <div>Head ID: {Head}</div>
    <div>Skin ID: {Skin}</div>
    <div>Body ID: {Body}</div>
  <div>Streak: {streak}</div>
  <div>Emotion: {emotion}</div>
</div>
