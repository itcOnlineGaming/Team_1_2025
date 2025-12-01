<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import TutorialManager from '$lib/components/TutorialManager.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TutorialManager />
{@render children?.()}
