<script lang="ts">
	import Popup from '$lib/components/Popup.svelte';
	import TemplateSelector from '$lib/components/TemplateSelector.svelte';
	import { selectedTemplate } from '$lib/stores/templateStore';
	import { goto } from '$app/navigation';
	import templatesData from '$lib/data/templates.json';

	let showInitialPopup = $state(true);
	let consentChecked = $state(false);
	let selectedTemplateData: any = $state(null);

	const templates = templatesData.templates;

	function handleTemplateSelect(template: any) {
		selectedTemplateData = template;
		console.log('Template selected:', template);
	}

	function startTest() {
		if (consentChecked && selectedTemplateData) {
			selectedTemplate.set(selectedTemplateData);
			showInitialPopup = false;
			goto('/evaluation');
		}
	}

	function goToAdmin() {
		goto('/admin');
	}

	function goToViewTemplates() {
		goto('/templates/view');
	}
</script>

<main>
	<div class="nav-buttons">
		<button class="nav-btn" onclick={goToAdmin}>Admin</button>
		<button class="nav-btn" onclick={goToViewTemplates}>View Templates</button>
	</div>
	<h1>Welcome</h1>

	<button
		onclick={() => {
			showInitialPopup = true;
		}}
	>
		Start Test
	</button>
</main>

<Popup bind:isOpen={showInitialPopup} title="Welcome to Our User Test" showCloseButton={false}>
	<div class="popup-inner">
		<p><strong>Purpose:</strong> You're testing an evaluation questionnaire system.</p>

		<p>
			<strong>Your Task:</strong> Please complete the questionnaire and provide honest feedback about
			your experience.
		</p>

		<p><strong>Time Required:</strong> Approximately 1-2 minutes</p>

		<div class="template-section">
			<label><strong>Select a Template:</strong></label>
			<TemplateSelector
				{templates}
				selectedId={selectedTemplateData?.id || ''}
				onSelect={handleTemplateSelect}
			/>

			{#if selectedTemplateData}
				<p class="template-description">{selectedTemplateData.description}</p>
			{/if}
		</div>

		<div class="consent-section">
			<label>
				<input type="checkbox" bind:checked={consentChecked} />
				I consent to participate in this user test
			</label>
		</div>

		<button
			class="start-btn"
			onclick={startTest}
			disabled={!consentChecked || !selectedTemplateData}
		>
			Start Test
		</button>
	</div>
</Popup>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
	}

	.nav-buttons {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	button:hover:not(:disabled) {
		background-color: #45a049;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.nav-btn {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		background-color: #2196f3;
	}

	.nav-btn:hover {
		background-color: #0b7dda;
	}

	.popup-inner {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.popup-inner p {
		margin: 0;
		line-height: 1.6;
	}

	.template-section {
		margin-top: 0.5rem;
		padding: 1rem;
		background-color: #f0f4ff;
		border-radius: 4px;
	}

	.template-section label {
		display: block;
		margin-bottom: 0.75rem;
	}

	.template-description {
		margin-top: 0.75rem;
		margin-bottom: 0;
		font-size: 0.9rem;
		color: #666;
		font-style: italic;
		padding: 0.5rem;
		background-color: white;
		border-radius: 4px;
	}

	.consent-section {
		margin-top: 0.5rem;
		padding: 1rem;
		background-color: #f9fafb;
		border-radius: 4px;
	}

	.consent-section label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.consent-section input[type='checkbox'] {
		cursor: pointer;
	}

	.start-btn {
		margin-top: 0.5rem;
		width: 100%;
	}
</style>
