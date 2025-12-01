<script lang="ts">
    import { sessionStore } from '$lib/stores/sessionStore';
    import TemplateSelector from '$lib/components/TemplateSelector.svelte';
    import SessionTimer from '$lib/components/SessionTimer.svelte';
    import EvaluationQuestionnaire from '$lib/components/EvaluationQuestionnaire.svelte';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';
    import templatesData from '$lib/data/templates.json';
    import { get } from 'svelte/store';


    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }

    let templates: Template[] = templatesData.templates as Template[];
    let showTemplateSelector = false;
    let showQuestionnaire = false;
    let showGraphs = false;
    
    let activeSession;
    $: activeSession = get(sessionStore.activeSession);

    function handleStartSession() {
        showTemplateSelector = true;
    }

    function handleTemplateSelect(template: Template) {
        sessionStore.startSession(template);
        showTemplateSelector = false;
    }

    function handleEndSession() {
        showQuestionnaire = true;
    }

    function handleQuestionnaireSubmit(responses: Record<string, any>) {
        sessionStore.endSession(responses);
        showQuestionnaire = false;
        showGraphs = true;
    }

    function handleCancelSession() {
        sessionStore.cancelSession();
        showQuestionnaire = false;
    }

    function closeGraphs() {
        showGraphs = false;
    }
</script>

<div class="session-manager">
    {#if !activeSession && !showTemplateSelector && !showQuestionnaire}
        <div class="session-controls">
            <button class="btn-primary btn-large" on:click={handleStartSession}>
                🎯 Start New Session
            </button>
        </div>
    {/if}

    {#if activeSession && !showQuestionnaire}
        <SessionTimer 
            session={activeSession} 
            onEnd={handleEndSession}
        />
    {/if}
</div>

{#if showTemplateSelector}
    <div
        class="modal-overlay"
        role="button"
        tabindex="0"
        aria-label="Close template selector modal"
        on:click={() => showTemplateSelector = false}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { showTemplateSelector = false; } }}
    >
        <div
            class="modal-content card"
            role="dialog"
            aria-modal="true"
            on:click={(e) => e.stopPropagation()}
            tabindex="0"
            on:keydown={(e) => { if (e.key === 'Escape') { showTemplateSelector = false; } }}
        >
            <div class="modal-header">
                <h2>Select a Template</h2>
                <button class="btn-close" on:click={() => showTemplateSelector = false}>✕</button>
            </div>
            <div class="modal-body">
                <TemplateSelector 
                    {templates}
                    onSelect={handleTemplateSelect}
                />
            </div>
        </div>
    </div>
{/if}

{#if showQuestionnaire && activeSession}
    <div class="modal-overlay">
        <div class="modal-content card" style="max-width: 900px;">
            <div class="modal-header">
                <h2>Session Evaluation</h2>
                <button class="btn-close" on:click={handleCancelSession}>✕</button>
            </div>
            <div class="modal-body">
                <EvaluationQuestionnaire 
                    template={activeSession.questions}
                    handleSubmit={handleQuestionnaireSubmit}
                />
            </div>
        </div>
    </div>
{/if}

{#if showGraphs}
    <div
        class="modal-overlay"
        role="button"
        tabindex="0"
        aria-label="Close session analytics modal"
        on:click={closeGraphs}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { closeGraphs(); } }}
    >
        <div
            class="modal-content card"
            style="max-width: 1200px;"
            role="dialog"
            aria-modal="true"
            tabindex="0"
            on:click={(e) => e.stopPropagation()}
            on:keydown={(e) => { if (e.key === 'Escape') { closeGraphs(); } }}
        >
            <div class="modal-header">
                <h2>Session Analytics</h2>
                <button class="btn-close" on:click={closeGraphs}>✕</button>
            </div>
            <div class="modal-body">
                <SessionGraphs showTable={true}  />
            </div>
        </div>
    </div>
{/if}

<style>
    .session-manager {
        padding: 2rem;
    }

    .session-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }

    /* Hide the start button by default and reveal on hover or keyboard focus */
    .session-controls .btn-primary {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .session-manager:hover .session-controls .btn-primary,
    .session-manager:focus-within .session-controls .btn-primary {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
    }

    .btn-large {
        padding: 1.5rem 3rem;
        font-size: 1.2rem;
        font-weight: 600;
    }

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
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
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
</style>
