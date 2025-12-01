<script lang="ts">
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';

    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }

    interface Props {
        templates: Template[];
        selectedId?: string;
        onSelect: (template: Template, duration: number) => void;
    }

    let { templates = [], selectedId = '', onSelect }: Props = $props();
    let selectedPreview: Template | null = $state(null);
    let duration = $state(1); // Timer duration in minutes, default to 1

    function openPreview(template: Template) {
        selectedPreview = template;
    }

    function closePreview() {
        selectedPreview = null;
    }

    function selectTemplate(template: Template) {
        onSelect(template, duration);
        closePreview();
    }
    
    // Format duration display
    function formatDuration(minutes: number): string {
        if (minutes === 1) return '1 minute';
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
        return `${hours}h ${mins}m`;
    }

    function getQuestionTypeIcon(type: string): string {
        switch (type) {
            case 'text':
                return '📝';
            case 'select':
                return '📋';
            case 'number':
                return '🔢';
            default:
                return '❓';
        }
    }

    function getRatingTypeIcon(starType?: string): string {
        switch (starType) {
            case 'stars':
                return '⭐';
            case 'slider':
                return '🎚️';
            case 'emoji':
                return '😊';
            case 'numeric':
                return '🔢';
            default:
                return '⭐';
        }
    }

    function getRatingTypeName(starType?: string): string {
        if (!starType) return 'Stars';
        return starType.charAt(0).toUpperCase() + starType.slice(1);
    }
</script>

<div class="template-selector">
    {#if templates.length === 0}
        <div class="empty-state">
            <p>📋 No templates available</p>
        </div>
    {:else}
        <div class="template-grid">
            {#each templates as template}
                <button
                    class="template-card card"
                    class:selected={selectedId === template.id}
                    onclick={() => openPreview(template)}
                >
                    <div class="card-header">
                        <h4>{template.name}</h4>
                        <span class="badge badge-info">{template.questions.length} Q</span>
                    </div>

                    <p class="card-description">
                        {template.description || 'No description provided'}
                    </p>

                    <div class="card-footer">
                        <div class="question-types">
                            {#each [...new Set(template.questions.map((q) => q.type))] as type}
                                <span class="type-icon" title={type}>
                                    {getQuestionTypeIcon(type)}
                                </span>
                            {/each}
                            {#if template.questions.some((q) => q.stars)}
                                <span class="type-icon" title="Has ratings">⭐</span>
                            {/if}
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>

{#if selectedPreview}
    <div 
        class="modal-overlay" 
        role="presentation"
        tabindex="-1"
        onclick={closePreview}
        onkeydown={(e) => e.key === 'Escape' && closePreview()}
    >
        <div 
            class="modal-content card" 
            role="dialog"
            tabindex="0"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <div>
                    <h2>{selectedPreview.name}</h2>
                    <p class="modal-subtitle">Template ID: {selectedPreview.id}</p>
                </div>
                <button class="btn-close" onclick={closePreview}>✕</button>
            </div>

            {#if selectedPreview.description}
                <div class="modal-description">
                    <p>{selectedPreview.description}</p>
                </div>
            {/if}

            <!-- Timer Duration Slider -->
            <div class="timer-section">
                <label for="duration-slider-old" class="timer-label">
                    <span class="timer-icon">⏱️</span>
                    <span>Session Duration: <strong>{formatDuration(duration)}</strong></span>
                </label>
                <input 
                    id="duration-slider-old"
                    type="range" 
                    min="1" 
                    max="120" 
                    bind:value={duration}
                    class="duration-slider"
                />
                <div class="slider-labels">
                    <span>1 min</span>
                    <span>30 min</span>
                    <span>1 hr</span>
                    <span>2 hrs</span>
                </div>
            </div>

            <div class="modal-body">
                <h3>Questions ({selectedPreview.questions.length})</h3>

                {#each selectedPreview.questions as question, i}
                    <div class="question-preview">
                        <div class="question-preview-header">
                            <span class="badge badge-info">Q{i + 1}</span>
                            <span class="badge badge-secondary">{question.type}</span>
                            {#if question.stars}
                                <span class="badge badge-accent">
                                    {getRatingTypeIcon(question.starType)}
                                    {getRatingTypeName(question.starType)} Rating
                                </span>
                            {/if}
                        </div>

                        <p class="question-label">{question.label}</p>

                        {#if question.type === 'select' && question.options}
                            <div class="options-preview">
                                <span class="options-label">Options:</span>
                                <ul>
                                    {#each question.options as option}
                                        <li>{option}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" onclick={closePreview}>Close</button>
                {#if selectedPreview}
                    <button class="btn-primary" onclick={() => selectTemplate(selectedPreview!)}>
                        Use This Template
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .template-selector {
        width: 100%;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--color-text-secondary);
    }

    .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .template-card {
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        text-align: left;
        font-family: inherit;
        border: 2px solid var(--color-border);
    }

    .template-card:hover {
        border-color: var(--color-accent);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.2);
        transform: translateY(-2px);
    }

    .template-card.selected {
        border-color: var(--color-accent);
        background-color: rgba(123, 104, 166, 0.05);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.25);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 0.75rem;
    }

    .card-header h4 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--color-text-primary);
        flex: 1;
        line-height: 1.3;
    }

    .card-description {
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        margin: 0;
        flex: 1;
        line-height: 1.4;
    }

    .card-footer {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-top: 0.75rem;
        margin-top: 0.75rem;
        border-top: 1px solid var(--color-border);
    }

    .question-types {
        display: flex;
        gap: 0.25rem;
    }

    .type-icon {
        font-size: 1.2rem;
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
        max-width: 700px;
        width: 100%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
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
        font-size: 1.5rem;
        color: var(--color-text-primary);
    }

    .modal-subtitle {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0.25rem 0 0 0;
        font-family: monospace;
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
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
    }

    .modal-description {
        padding: 1rem 1.5rem;
        background: var(--color-bg-primary);
        border-bottom: 1px solid var(--color-border);
    }

    .modal-description p {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
    }

    .timer-section {
        padding: 1rem 1.5rem;
        background: var(--color-bg-secondary);
        border-bottom: 1px solid var(--color-border);
    }

    .timer-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text-primary);
        font-size: 1rem;
        margin-bottom: 1rem;
        cursor: default;
    }

    .timer-icon {
        font-size: 1.5rem;
    }

    .duration-slider {
        width: 100%;
        height: 8px;
        border-radius: 5px;
        background: var(--color-border);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
    }

    .duration-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--color-accent);
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(123, 104, 166, 0.3);
        transition: all 0.2s;
    }

    .duration-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.4);
    }

    .duration-slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--color-accent);
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(123, 104, 166, 0.3);
        transition: all 0.2s;
    }

    .duration-slider::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.4);
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .modal-body h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: var(--color-text-primary);
    }

    .question-preview {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 0.75rem;
    }

    .question-preview-header {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }

    .question-label {
        margin: 0.5rem 0 0 0;
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .options-preview {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--color-border);
    }

    .options-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 600;
    }

    .options-preview ul {
        margin: 0.5rem 0 0 0;
        padding-left: 1.5rem;
    }

    .options-preview li {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0.25rem 0;
    }

    .modal-footer {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }

    @media (max-width: 768px) {
        .template-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
