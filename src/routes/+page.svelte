<!-- +page.svelte -->
<script lang="ts">
  import Cat from '$lib/components/Cat.svelte'; 
  import { BodyAccessory, HeadAccessory, SkinColour } from '../types/Cat';

  let percentage : number = 100;
  let Head : HeadAccessory = HeadAccessory.None;
  let Body : BodyAccessory = BodyAccessory.None;
  let Skin : SkinColour = SkinColour.White;
  let streak = 1;
</script>

<main>
  <Cat {percentage} {Head} {Body} {Skin} {streak} />
</main>