<script lang="ts">
	import Popup from '$lib/components/Popup.svelte';
	import { selectedTemplate } from '$lib/stores/templateStore';
	import { goto } from '$app/navigation';
	import templatesData from '$lib/data/templates.json';

	let showInitialPopup = $state(true);
	let consentChecked = $state(false);
	let selectedTemplateId = $state('');

	const templates = templatesData.templates;

	function startTest() {
		if (consentChecked && selectedTemplateId) {
			const template = templates.find((t) => t.id === selectedTemplateId);
			if (template) {
				selectedTemplate.set(template);
				showInitialPopup = false;
				goto('/evaluation');
			}
		}
	}
</script>

<main>
	<h1>Welcome</h1>
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
			<label for="template-select"><strong>Select a Template:</strong></label>
			<select id="template-select" bind:value={selectedTemplateId} class="template-select">
				<option value="">Choose a template...</option>
				{#each templates as template}
					<option value={template.id}>{template.name}</option>
				{/each}
			</select>

			{#if selectedTemplateId}
				{@const selectedTemplateData = templates.find((t) => t.id === selectedTemplateId)}
				{#if selectedTemplateData}
					<p class="template-description">{selectedTemplateData.description}</p>
				{/if}
			{/if}
		</div>

		<div class="consent-section">
			<label>
				<input type="checkbox" bind:checked={consentChecked} />
				I consent to participate in this user test
			</label>
		</div>

		<button class="start-btn" onclick={startTest} disabled={!consentChecked || !selectedTemplateId}>
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
		margin-bottom: 0.5rem;
	}

	.template-select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		background-color: white;
		cursor: pointer;
	}

	.template-select:focus {
		outline: none;
		border-color: #4caf50;
		box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
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
