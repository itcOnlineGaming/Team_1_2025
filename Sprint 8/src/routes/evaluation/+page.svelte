<script lang="ts">
    import EvaluationQuestionnaire, {
        type Question
    } from '$lib/components/EvaluationQuestionnaire.svelte';
    import Popup from '$lib/components/Popup.svelte';
    import { selectedTemplate } from '$lib/stores/templateStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let showEndPopup = $state(false);
    let feedbackResponses = $state({
        intuitive: 3,
        issues: 'No',
        issueDetails: '',
        likelihood: 3
    });

    console.log(selectedTemplate);
    let template = $state($selectedTemplate);

    onMount(() => {
        if (!$selectedTemplate) {
            alert('Please select a template first');
            goto('/');
        }
    });

    const onSubmit = (responses: Record<string, any>) => {
        console.log('Questionnaire responses:', responses);
        console.log('Template used:', $selectedTemplate?.name);

        const existingQuestionnaires = localStorage.getItem('allQuestionnaires');
        const allQuestionnaires = existingQuestionnaires ? JSON.parse(existingQuestionnaires) : [];

        allQuestionnaires.push({
            sessionId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            templateId: $selectedTemplate?.id,
            templateName: $selectedTemplate?.name,
            responses: responses
        });

        localStorage.setItem('allQuestionnaires', JSON.stringify(allQuestionnaires));

        showEndPopup = true;
    };

    function submitFeedback() {
        console.log('Feedback submitted:', feedbackResponses);

        const existingData = localStorage.getItem('allFeedback');
        const allResponses = existingData ? JSON.parse(existingData) : [];

        allResponses.push({
            sessionId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            templateId: $selectedTemplate?.id,
            templateName: $selectedTemplate?.name,
            feedback: feedbackResponses
        });

        localStorage.setItem('allFeedback', JSON.stringify(allResponses));

        localStorage.removeItem('userFeedback');

        showEndPopup = false;
        alert('Thank you! Your feedback has been recorded.');
        selectedTemplate.set(null);
        goto('/');
    }
</script>

{#if template}
    <div class="page-container">
        <div class="page-header">
            <h1>{template.name}</h1>
            <p class="template-description">{template.description}</p>
        </div>

        <EvaluationQuestionnaire template={template.questions} handleSubmit={onSubmit} />
    </div>

    <Popup bind:isOpen={showEndPopup} title="Thank You!" showCloseButton={false}>
        <div class="feedback-form">
            <p class="thank-you-text">
                Thank you for taking the time to test our evaluation system! Please answer a few quick
                questions about your experience.
            </p>

            <div class="question">
                <label for="intuitive"> How intuitive was the questionnaire interface? (1-5) </label>
                <input
                    type="range"
                    id="intuitive"
                    min="1"
                    max="5"
                    bind:value={feedbackResponses.intuitive}
                />
                <span class="rating-value">{feedbackResponses.intuitive}</span>
            </div>

            <div class="question">
                <label for="issues"> Did you encounter any issues completing the evaluation? </label>
                <select id="issues" class="input-field" bind:value={feedbackResponses.issues}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>

                {#if feedbackResponses.issues === 'Yes'}
                    <textarea
                        class="input-field"
                        placeholder="Please describe the issues you encountered..."
                        bind:value={feedbackResponses.issueDetails}
                        rows="3"
                    ></textarea>
                {/if}
            </div>

            <div class="question">
                <label for="likelihood"> How likely are you to use this system? (1-5) </label>
                <input
                    type="range"
                    id="likelihood"
                    min="1"
                    max="5"
                    bind:value={feedbackResponses.likelihood}
                />
                <span class="rating-value">{feedbackResponses.likelihood}</span>
            </div>

            <button class="btn-primary btn-full" onclick={submitFeedback}> Submit Feedback </button>
        </div>
    </Popup>
{:else}
    <div class="loading">
        <p>Loading template...</p>
    </div>
{/if}

<style>
    .page-container {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding-bottom: 2rem;
    }

    .page-header {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem 1rem;
        text-align: center;
    }

    .page-header h1 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 2rem;
    }

    .template-description {
        color: var(--color-text-secondary);
        font-size: 1rem;
        margin: 0;
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        font-size: 1.25rem;
        color: var(--color-text-secondary);
    }

    .feedback-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .thank-you-text {
        margin: 0;
        line-height: 1.6;
        color: var(--color-text-primary);
    }

    .question {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .question label {
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .rating-value {
        align-self: center;
        font-weight: 600;
        color: var(--color-accent);
        font-size: 1.25rem;
    }
</style>
