<script lang="ts">
    import { selectedTemplate } from '$lib/stores/templateStore';
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';
    import EvaluationQuestionnaire from '$lib/components/EvaluationQuestionnaire.svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }

    interface Props {
        initialTemplate?: Template;
        isEditMode?: boolean;
    }

    let { initialTemplate, isEditMode = false }: Props = $props();

    let template = $state<Template>(
        initialTemplate || {
            id: '',
            name: '',
            description: '',
            questions: [
                {
                    id: 'q1',
                    label: 'How do you feel about this session?',
                    type: 'none',
                    stars: true,
                    starType: 'emoji',
                    required: true
                },
                {
                    id: 'q2',
                    label: 'Additional comments',
                    type: 'textarea',
                    stars: false,
                    required: true
                }
            ]
        }
    );

    let message = $state('');
    let isLoading = $state(false);
    let showPreview = $state(false);

    function addQuestion() {
        const newQuestion: Question = {
            id: `q${template.questions.length + 1}`,
            label: '',
            type: 'text',
            stars: false,
            required: false
        };
        // Insert before the last question (Additional comments)
        const newQuestions = [...template.questions];
        newQuestions.splice(newQuestions.length - 1, 0, newQuestion);
        template.questions = newQuestions;
        // Reindex all questions
        template.questions = template.questions.map((q, i) => ({
            ...q,
            id: `q${i + 1}`
        }));
    }

    function removeQuestion(index: number) {
        const totalQuestions = template.questions.length;
        
        if (index === 0) {
            message = 'Cannot remove the default session rating question';
            return;
        }
        
        if (index === totalQuestions - 1) {
            message = 'Cannot remove the required additional comments question';
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
        template.questions = [...template.questions];
    }

    function removeOption(questionIndex: number, optionIndex: number) {
        const question = template.questions[questionIndex];
        if (question.options) {
            question.options = question.options.filter((_, i) => i !== optionIndex);
            template.questions = [...template.questions];
        }
    }

    function toggleStars(questionIndex: number) {
        const question = template.questions[questionIndex];
        if (question.stars && !question.starType) {
            question.starType = 'slider';
        }
        template.questions = [...template.questions];
    }

    function handleTypeChange(questionIndex: number) {
        const question = template.questions[questionIndex];
        
        if (question.type === 'none') {
            question.stars = true;
            if (!question.starType) {
                question.starType = 'slider';
            }
        }
        
        template.questions = [...template.questions];
    }

    function validateQuestion(question: Question): string | null {
        if (question.type === 'none' && !question.stars) {
            return 'Rating-only questions must have a rating type selected';
        }
        if (question.type === 'select' && (!question.options || question.options.length === 0)) {
            return 'Select questions must have at least one option';
        }
        if (!question.label || question.label.trim() === '') {
            return 'Question label is required';
        }
        return null;
    }

    function openPreview() {
        if (template.questions.length === 0) {
            message = 'Please add at least one question to preview';
            return;
        }
        showPreview = true;
    }

    function closePreview() {
        showPreview = false;
    }

    function handlePreviewSubmit(responses: Record<string, any>) {
        console.log('Preview responses:', responses);
        alert('Preview submission successful! (This is just a preview - no data was saved)');
    }

    async function saveTemplate() {
    if (!template.id || !template.name || template.questions.length === 0) {
        message = 'Please fill in all required fields and add at least one question';
        return;
    }

    for (let i = 0; i < template.questions.length; i++) {
        const validationError = validateQuestion(template.questions[i]);
        if (validationError) {
            message = `Question ${i + 1}: ${validationError}`;
            return;
        }
    }

    isLoading = true;
    message = '';

    try {
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode 
            ? `${base}/api/templates/${template.id}` 
            : `${base}/api/templates`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(template)
        });

        if (response.ok) {
            message = isEditMode 
                ? 'Template updated successfully!' 
                : 'Template saved successfully!';
            selectedTemplate.set(template);
            
            // Redirect to templates list after successful save
            setTimeout(() => {
                goto(`${base}/templates/view`);
            }, 1500);
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


    // Helper function to check if a question is a default locked question
    function isDefaultQuestion(index: number): boolean {
        return index === 0 || index === template.questions.length - 1;
    }
</script>

<div class="template-creator">
    <div class="header-section">
        <h2>{isEditMode ? 'Edit Template' : 'Create New Template'}</h2>
        <button type="button" onclick={openPreview} class="btn-info">
            Preview Template
        </button>
    </div>

<div class="form-group">
    <label for="template-id">Template ID *</label>
    <input
        id="template-id"
        type="text"
        class="input-field"
        bind:value={template.id}
        placeholder="e.g., user-satisfaction"
        disabled={isEditMode}
        required
    />
    {#if isEditMode}
        <p class="field-hint">Template ID cannot be changed when editing</p>
    {/if}
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
        ></textarea>
    </div>

    <div class="questions-section">
        <h3>Questions</h3>

        {#each template.questions as question, i}
            <div class="card question-card" class:default-question={isDefaultQuestion(i)}>
                <div class="question-header">
                    <span class="question-number">
                        Question {i + 1}
                        {#if i === 0}
                            <span class="default-badge">Default Rating</span>
                        {:else if i === template.questions.length - 1}
                            <span class="default-badge">Required Comment</span>
                        {/if}
                    </span>
                    {#if !isDefaultQuestion(i)}
                        <button type="button" onclick={() => removeQuestion(i)} class="btn-danger btn-sm"> ✕ </button>
                    {/if}
                </div>

                <div class="form-group">
                    <label for="question-label-{i}">
                        Question Label {isDefaultQuestion(i) ? '(locked)' : '*'}
                    </label>
                    <input
                        id="question-label-{i}"
                        type="text"
                        class="input-field"
                        bind:value={question.label}
                        placeholder="Enter your question"
                        disabled={isDefaultQuestion(i)}
                        required
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="question-type-{i}">
                            Question Type {isDefaultQuestion(i) ? '(locked)' : '*'}
                        </label>
                        <select 
                            id="question-type-{i}" 
                            class="input-field" 
                            bind:value={question.type} 
                            disabled={isDefaultQuestion(i)}
                            onchange={() => handleTypeChange(i)}
                        >
                            <option value="text">Text</option>
                            <option value="textarea">Multiline Text</option>
                            <option value="select">Select</option>
                            <option value="number">Number</option>
                            <option value="none">⭐ Rating Only (No Text Field)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="question-stars-{i}" class="checkbox-label">
                            <input 
                                id="question-stars-{i}"
                                type="checkbox" 
                                bind:checked={question.stars} 
                                disabled={isDefaultQuestion(i) || question.type === 'none'}
                                onchange={() => toggleStars(i)}
                            />
                            Include Rating 
                            {#if i === 0}
                                (always on)
                            {:else if question.type === 'none'}
                                (required for rating-only)
                            {/if}
                        </label>
                    </div>
                </div>

                {#if question.type === 'none'}
                    <div class="info-banner">
                        <span class="info-icon">ℹ️</span>
                        <span>Rating-only questions display only a rating selector without a text input field.</span>
                    </div>
                {/if}

                {#if question.stars}
                    <div class="form-group">
                        <label for="question-star-type-{i}">
                            Rating Type {isDefaultQuestion(i) ? '(locked)' : '*'}
                        </label>
                        <select 
                            id="question-star-type-{i}"
                            class="input-field" 
                            bind:value={question.starType} 
                            disabled={isDefaultQuestion(i)}
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
                            <label for="question-required-{i}" class="checkbox-label">
                                <input 
                                    id="question-required-{i}"
                                    type="checkbox" 
                                    bind:checked={question.required}
                                    disabled={isDefaultQuestion(i)}
                                />
                                Required {isDefaultQuestion(i) ? '(always required)' : ''}
                            </label>
                        </div>
                    </div>

                    {#if (question.type === 'text' || question.type === 'textarea') && !question.stars}
                        <div class="form-row">
                            <div class="form-group">
                                <label for="question-min-length-{i}">Min Length</label>
                                <input
                                    id="question-min-length-{i}"
                                    type="number"
                                    class="input-field"
                                    bind:value={question.minLength}
                                    placeholder="Minimum characters"
                                    min="0"
                                />
                            </div>
                            <div class="form-group">
                                <label for="question-max-length-{i}">Max Length</label>
                                <input
                                    id="question-max-length-{i}"
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
                                <label for="question-min-{i}">Min Value</label>
                                <input
                                    id="question-min-{i}"
                                    type="number"
                                    class="input-field"
                                    bind:value={question.min}
                                    placeholder="Minimum value"
                                />
                            </div>
                            <div class="form-group">
                                <label for="question-max-{i}">Max Value</label>
                                <input
                                    id="question-max-{i}"
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
                            <h4>Options</h4>
                            <button type="button" onclick={() => addOption(i)} class="btn-info btn-sm">
                                + Add Option
                            </button>
                        </div>

                        {#if question.options}
                            {#each question.options as option, j}
                                <div class="option-row">
                                    <input
                                        id="question-{i}-option-{j}"
                                        type="text"
                                        class="input-field"
                                        bind:value={question.options[j]}
                                        placeholder="Option {j + 1}"
                                    />
                                    <button
                                        type="button"
                                        onclick={() => removeOption(i, j)}
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

        <button type="button" onclick={addQuestion} class="btn-success btn-full">
            + Add Question
        </button>
        <p class="add-question-hint">New questions will be added before "Additional comments"</p>
    </div>

    <button type="button" onclick={saveTemplate} disabled={isLoading} class="btn-primary btn-full">
    {#if isLoading}
        {isEditMode ? 'Updating...' : 'Saving...'}
    {:else}
        {isEditMode ? 'Update Template' : 'Save Template'}
    {/if}
</button>


    {#if message}
        <div class="message" class:message-success={message.includes('success')} class:message-error={!message.includes('success')}>
            {message}
        </div>
    {/if}
</div>

<!-- Preview Modal -->
{#if showPreview}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-overlay" role="presentation" tabindex="-1" onclick={closePreview} onkeydown={(e) => e.key === 'Escape' && closePreview()}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="modal-content card preview-modal" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <div>
                    <h2>Template Preview</h2>
                    <p class="modal-subtitle">{template.name || 'Untitled Template'}</p>
                    {#if template.description}
                        <p class="modal-description-text">{template.description}</p>
                    {/if}
                </div>
                <button class="btn-close" onclick={closePreview}>✕</button>
            </div>
            <div class="modal-body">
                <div class="preview-notice">
                    <span class="notice-icon">ℹ️</span>
                    <span>This is a preview. Submissions won't be saved.</span>
                </div>
                <EvaluationQuestionnaire 
                    template={template.questions}
                    handleSubmit={handlePreviewSubmit}
                />
            </div>
        </div>
    </div>
{/if}

<style>
    .field-hint {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-top: 0.25rem;
        font-style: italic;
    }

    .template-creator {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .template-creator h2 {
        color: var(--color-text-primary);
        margin: 0;
    }

    .template-creator h3 {
        color: var(--color-text-primary);
        margin: 0 0 1.5rem 0;
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

    .info-banner {
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #1565c0;
        font-size: 0.9rem;
    }

    .info-icon {
        font-size: 1.1rem;
    }

    .add-question-hint {
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-style: italic;
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

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(79, 52, 34, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
    }

    .preview-modal {
        max-width: 1000px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
    }

    .modal-subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        font-weight: 600;
    }

    .modal-description-text {
        margin: 0.5rem 0 0 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .btn-close:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .preview-notice {
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #1565c0;
        font-size: 0.95rem;
    }

    .notice-icon {
        font-size: 1.25rem;
    }

    @media (max-width: 768px) {
        .template-creator {
            padding: 1rem;
        }

        .header-section {
            flex-direction: column;
            align-items: flex-start;
        }

        .modal-content {
            max-height: 95vh;
        }
    }
</style>
