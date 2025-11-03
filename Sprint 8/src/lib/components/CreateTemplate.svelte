<script lang="ts">
	import { selectedTemplate } from '$lib/stores/templateStore';
	import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';

	interface Template {
		id: string;
		name: string;
		description: string;
		questions: Question[];
	}

	let template: Template = {
		id: '',
		name: '',
		description: '',
		questions: []
	};

	let message = '';
	let isLoading = false;

	function addQuestion() {
		const newQuestion: Question = {
			id: `q${template.questions.length + 1}`,
			label: '',
			type: 'text',
			stars: false
		};
		template.questions = [...template.questions, newQuestion];
	}

	function removeQuestion(index: number) {
		template.questions = template.questions.filter((_, i) => i !== index);
		// Re-index question IDs
		template.questions = template.questions.map((q, i) => ({
			...q,
			id: `q${i + 1}`
		}));
	}

	function addOption(questionIndex: number) {
		const question = template.questions[questionIndex];
		if (!question.options) {
			question.options = [];
		}
		question.options = [...question.options, ''];
		template.questions = template.questions;
	}

	function removeOption(questionIndex: number, optionIndex: number) {
		const question = template.questions[questionIndex];
		if (question.options) {
			question.options = question.options.filter((_, i) => i !== optionIndex);
			template.questions = template.questions;
		}
	}

	async function saveTemplate() {
		if (!template.id || !template.name || template.questions.length === 0) {
			message = 'Please fill in all required fields and add at least one question';
			return;
		}

		isLoading = true;
		message = '';

		try {
			const response = await fetch('/api/templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(template)
			});

			if (response.ok) {
				message = 'Template saved successfully!';
				selectedTemplate.set(template);
				template = {
					id: '',
					name: '',
					description: '',
					questions: []
				};
			} else {
				const error = await response.text();
				message = `Error: ${error}`;
			}
		} catch (error) {
			message = `Error saving template: ${error}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="template-creator">
	<h2>Create New Template</h2>

	<div class="form-group">
		<label for="template-id">Template ID *</label>
		<input
			id="template-id"
			type="text"
			bind:value={template.id}
			placeholder="e.g., user-satisfaction"
			required
		/>
	</div>

	<div class="form-group">
		<label for="template-name">Template Name *</label>
		<input
			id="template-name"
			type="text"
			bind:value={template.name}
			placeholder="e.g., User Satisfaction Survey"
			required
		/>
	</div>

	<div class="form-group">
		<label for="template-desc">Description</label>
		<textarea
			id="template-desc"
			bind:value={template.description}
			placeholder="Brief description of the template"
			rows="3"
		/>
	</div>

	<div class="questions-section">
		<div class="section-header">
			<h3>Questions</h3>
			<button type="button" on:click={addQuestion} class="btn-add"> + Add Question </button>
		</div>

		{#each template.questions as question, i}
			<div class="question-card">
				<div class="question-header">
					<span class="question-number">Question {i + 1}</span>
					<button type="button" on:click={() => removeQuestion(i)} class="btn-remove"> ✕ </button>
				</div>

				<div class="form-group">
					<label>Question Label *</label>
					<input
						type="text"
						bind:value={question.label}
						placeholder="Enter your question"
						required
					/>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label>Question Type *</label>
						<select bind:value={question.type}>
							<option value="text">Text</option>
							<option value="select">Select</option>
							<option value="number">Number</option>
						</select>
					</div>

					<div class="form-group">
						<label>
							<input type="checkbox" bind:checked={question.stars} />
							Include Star Rating
						</label>
					</div>
				</div>

				{#if question.type === 'select'}
					<div class="options-section">
						<div class="section-header">
							<label>Options</label>
							<button type="button" on:click={() => addOption(i)} class="btn-add-small">
								+ Add Option
							</button>
						</div>

						{#if question.options}
							{#each question.options as option, j}
								<div class="option-row">
									<input
										type="text"
										bind:value={question.options[j]}
										placeholder="Option {j + 1}"
									/>
									<button
										type="button"
										on:click={() => removeOption(i, j)}
										class="btn-remove-small"
									>
										✕
									</button>
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<button type="button" on:click={saveTemplate} disabled={isLoading} class="btn-save">
		{isLoading ? 'Saving...' : 'Save Template'}
	</button>

	{#if message}
		<div class="message" class:success={message.includes('success')}>
			{message}
		</div>
	{/if}
</div>

<style>
	.template-creator {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.form-group input[type='text'],
	.form-group input[type='number'],
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: end;
	}

	.form-row .form-group {
		flex: 1;
	}

	.questions-section {
		margin: 2rem 0;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.question-card {
		background: #f9f9f9;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		border: 1px solid #e0e0e0;
	}

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.question-number {
		font-weight: 600;
		color: #555;
	}

	.options-section {
		margin-top: 1rem;
		padding: 1rem;
		background: white;
		border-radius: 4px;
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.option-row input {
		flex: 1;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn-add {
		background: #4caf50;
		color: white;
	}

	.btn-add:hover {
		background: #45a049;
	}

	.btn-add-small {
		background: #2196f3;
		color: white;
		font-size: 0.8rem;
		padding: 0.4rem 0.8rem;
	}

	.btn-remove {
		background: #f44336;
		color: white;
		padding: 0.3rem 0.6rem;
	}

	.btn-remove-small {
		background: #ff5252;
		color: white;
		padding: 0.4rem 0.6rem;
	}

	.btn-save {
		background: #2196f3;
		color: white;
		padding: 1rem 2rem;
		font-size: 1rem;
		width: 100%;
		font-weight: 600;
	}

	.btn-save:hover:not(:disabled) {
		background: #0b7dda;
	}

	.btn-save:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 4px;
		background: #f44336;
		color: white;
	}

	.message.success {
		background: #4caf50;
	}
</style>
