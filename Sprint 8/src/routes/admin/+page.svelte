<script lang="ts">
	import { onMount } from 'svelte';

	let allFeedback = $state([]);

	onMount(() => {
		const data = localStorage.getItem('allFeedback');
		allFeedback = data ? JSON.parse(data) : [];
	});

	function downloadCSV() {
		const csv = convertToCSV(allFeedback);
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `feedback_${new Date().toISOString()}.csv`;
		a.click();
	}

	function convertToCSV(data) {
		if (data.length === 0) return '';

		const headers = [
			'Session ID',
			'Timestamp',
			'Intuitive Rating',
			'Had Issues',
			'Issue Details',
			'Likelihood Rating',
			'Template Name'
		];
		const rows = data.map((item) => [
			item.sessionId,
			item.timestamp,
			item.feedback.intuitive,
			item.feedback.issues,
			item.feedback.issueDetails || '',
			item.feedback.likelihood,
			item.templateName
		]);

		return [headers, ...rows].map((row) => row.join(',')).join('\n');
	}

	function clearData() {
		if (confirm('Are you sure you want to clear all feedback?')) {
			localStorage.removeItem('allFeedback');
			allFeedback = [];
		}
	}
</script>

<main>
	<h1>Feedback Admin Panel</h1>
	<p>Total responses: {allFeedback.length}</p>

	<div class="actions">
		<button onclick={downloadCSV}>Download CSV</button>
		<button onclick={clearData} class="danger">Clear All Data</button>
	</div>

	<div class="responses">
		{#each allFeedback as response}
			<div class="response-card">
				<p><strong>Time:</strong> {new Date(response.timestamp).toLocaleString()}</p>
				<p><strong>Intuitive:</strong> {response.feedback.intuitive}/5</p>
				<p><strong>Issues:</strong> {response.feedback.issues}</p>
				{#if response.feedback.issueDetails}
					<p><strong>Details:</strong> {response.feedback.issueDetails}</p>
				{/if}
				<p><strong>Likelihood:</strong> {response.feedback.likelihood}/5</p>
				<p><strong>Template Name:</strong> {response.templateName}</p>
				<p><strong>Template Id:</strong> {response.templateId}</p>
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin: 2rem 0;
	}

	button {
		padding: 0.75rem 1.5rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button.danger {
		background-color: #f44336;
	}

	.responses {
		display: grid;
		gap: 1rem;
	}

	.response-card {
		border: 1px solid #e5e7eb;
		padding: 1rem;
		border-radius: 8px;
		background-color: #f9fafb;
	}

	.response-card p {
		margin: 0.5rem 0;
	}
</style>
