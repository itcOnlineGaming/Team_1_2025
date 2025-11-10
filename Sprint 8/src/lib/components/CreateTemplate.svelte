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
        questions: [
            {
                id: 'q1',
                label: 'How do you feel about this session?',
                type: 'text',
                stars: true,
                starType: 'slider',
                required: true
            }
        ]
    };

    let message = '';
    let isLoading = false;

    function addQuestion() {
        const newQuestion: Question = {
            id: `q${template.questions.length + 1}`,
            label: '',
            type: 'text',
            stars: false,
            required: false
        };
        template.questions = [...template.questions, newQuestion];
    }

    function removeQuestion(index: number) {
        if (index === 0) {
            message = 'Cannot remove the default session rating question';
            return;
        }
        template.questions = template.questions.filter((_, i) => i !== index);
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

    function toggleStars(questionIndex: number) {
        const question = template.questions[questionIndex];
        if (question.stars && !question.starType) {
            question.starType = 'slider';
        }
        template.questions = template.questions;
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
                    questions: [
                        {
                            id: 'q1',
                            label: 'How do you feel about this session?',
                            type: 'text',
                            stars: true,
                            starType: 'stars',
                            required: true
                        }
                    ]
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
            class="input-field"
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
            class="input-field"
            bind:value={template.name}
            placeholder="e.g., User Satisfaction Survey"
            required
        />
    </div>

    <div class="form-group">
        <label for="template-desc">Description</label>
        <textarea
            id="template-desc"
            class="input-field"
            bind:value={template.description}
            placeholder="Brief description of the template"
            rows="3"
        />
    </div>

    <div class="questions-section">
        <div class="section-header">
            <h3>Questions</h3>
            <button type="button" on:click={addQuestion} class="btn-success"> + Add Question </button>
        </div>

        {#each template.questions as question, i}
            <div class="card question-card" class:default-question={i === 0}>
                <div class="question-header">
                    <span class="question-number">
                        Question {i + 1}
                        {#if i === 0}
                            <span class="default-badge">Default</span>
                        {/if}
                    </span>
                    {#if i !== 0}
                        <button type="button" on:click={() => removeQuestion(i)} class="btn-danger btn-sm"> ✕ </button>
                    {/if}
                </div>

                <div class="form-group">
                    <label>Question Label {i === 0 ? '(locked)' : '*'}</label>
                    <input
                        type="text"
                        class="input-field"
                        bind:value={question.label}
                        placeholder="Enter your question"
                        disabled={i === 0}
                        required
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Question Type {i === 0 ? '(locked)' : '*'}</label>
                        <select class="input-field" bind:value={question.type} disabled={i === 0}>
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                            <option value="number">Number</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                bind:checked={question.stars} 
                                disabled={i === 0}
                                on:change={() => toggleStars(i)}
                            />
                            Include Rating {i === 0 ? '(always on)' : ''}
                        </label>
                    </div>
                </div>

                {#if question.stars}
                    <div class="form-group">
                        <label>Rating Type {i === 0 ? '(locked)' : '*'}</label>
                        <select 
                            class="input-field" 
                            bind:value={question.starType} 
                            disabled={i === 0}
                        >
                            <option value="stars">⭐ Stars</option>
                            <option value="slider">🎚️ Slider</option>
                            <option value="emoji">😊 Emoji</option>
                            <option value="numeric">🔢 Numeric Buttons</option>
                        </select>
                    </div>
                {/if}

                <!-- Validation Section -->
                <div class="validation-section">
                    <h4>Validation Rules</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    bind:checked={question.required}
                                    disabled={i === 0}
                                />
                                Required {i === 0 ? '(always required)' : ''}
                            </label>
                        </div>
                    </div>

                    {#if question.type === 'text' && !question.stars}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Min Length</label>
                                <input
                                    type="number"
                                    class="input-field"
                                    bind:value={question.minLength}
                                    placeholder="Minimum characters"
                                    min="0"
                                />
                            </div>
                            <div class="form-group">
                                <label>Max Length</label>
                                <input
                                    type="number"
                                    class="input-field"
                                    bind:value={question.maxLength}
                                    placeholder="Maximum characters"
                                    min="0"
                                />
                            </div>
                        </div>
                    {/if}

                    {#if question.type === 'number'}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Min Value</label>
                                <input
                                    type="number"
                                    class="input-field"
                                    bind:value={question.min}
                                    placeholder="Minimum value"
                                />
                            </div>
                            <div class="form-group">
                                <label>Max Value</label>
                                <input
                                    type="number"
                                    class="input-field"
                                    bind:value={question.max}
                                    placeholder="Maximum value"
                                />
                            </div>
                        </div>
                    {/if}
                </div>

                {#if question.type === 'select'}
                    <div class="options-section">
                        <div class="section-header">
                            <label>Options</label>
                            <button type="button" on:click={() => addOption(i)} class="btn-info btn-sm">
                                + Add Option
                            </button>
                        </div>

                        {#if question.options}
                            {#each question.options as option, j}
                                <div class="option-row">
                                    <input
                                        type="text"
                                        class="input-field"
                                        bind:value={question.options[j]}
                                        placeholder="Option {j + 1}"
                                    />
                                    <button
                                        type="button"
                                        on:click={() => removeOption(i, j)}
                                        class="btn-danger btn-sm"
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

    <button type="button" on:click={saveTemplate} disabled={isLoading} class="btn-primary btn-full">
        {isLoading ? 'Saving...' : 'Save Template'}
    </button>

    {#if message}
        <div class="message" class:message-success={message.includes('success')} class:message-error={!message.includes('success')}>
            {message}
        </div>
    {/if}
</div>

<style>
    .template-creator {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .template-creator h2 {
        color: var(--color-text-primary);
        margin-bottom: 2rem;
    }

    .template-creator h3 {
        color: var(--color-text-primary);
        margin: 0;
    }

    .template-creator h4 {
        color: var(--color-text-primary);
        font-size: 0.95rem;
        margin-bottom: 1rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
        width: 100%;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .form-group .input-field {
        width: 100%;
        max-width: none;
    }

    .checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .form-row {
        display: flex;
        gap: 1rem;
        align-items: end;
        width: 100%;
    }

    .form-row .form-group {
        flex: 1;
        min-width: 0;
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
        margin-bottom: 1rem;
        padding: 2rem;
        width: 100%;
    }

    .question-card.default-question {
        background: #E8F5E9;
        border: 2px solid var(--color-success);
    }

    .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .question-number {
        font-weight: 600;
        color: var(--color-text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .default-badge {
        background: var(--color-success);
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .validation-section {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px dashed var(--color-border);
    }

    .options-section {
        margin-top: 1rem;
        padding: 1.5rem;
        background: var(--color-bg-secondary);
        border-radius: 4px;
        border: 1px solid var(--color-border);
    }

    .option-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        width: 100%;
    }

    .option-row input {
        flex: 1;
        min-width: 0;
    }
</style>
