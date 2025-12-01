<script lang="ts">
    import type { EvaluationTemplate } from '$lib/data/evaluationTemplates';

    interface Props {
        isOpen: boolean;
        templates: EvaluationTemplate[];
        onSelect: (template: EvaluationTemplate, duration: number) => void;
        onCancel: () => void;
    }

    let { isOpen = $bindable(), templates, onSelect, onCancel }: Props = $props();
    
    // Timer duration state (in minutes, default to 1)
    let duration = $state(1);

    function handleSelect(template: EvaluationTemplate) {
        onSelect(template, duration);
    }

    function handleCancel() {
        // Reset duration to default when canceling
        duration = 1;
        onCancel();
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
</script>

{#if isOpen}
    <div 
        class="modal-overlay" 
        role="button" 
        tabindex="0"
        onclick={handleCancel} 
        onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && handleCancel()}
        aria-label="Close template selector"
    >
        <div 
            class="modal-content card" 
            role="dialog" 
            aria-modal="true" 
            tabindex="0" 
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <h2>Select Evaluation Template</h2>
                <button class="btn-close" onclick={handleCancel}>✕</button>
            </div>
            <div class="modal-body">
                <p class="template-intro">Choose an evaluation template for your session. This will determine the questions you'll answer after the timer ends.</p>
                
                <!-- Timer Duration Slider -->
                <div class="timer-section">
                    <label for="duration-slider" class="timer-label">
                        <span class="timer-icon">⏱️</span>
                        <span>Session Duration: <strong>{formatDuration(duration)}</strong></span>
                    </label>
                    <input 
                        id="duration-slider"
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
                
                <div class="templates-grid">
                    {#each templates as template}
                        <button 
                            class="template-card"
                            onclick={() => handleSelect(template)}
                        >
                            <div class="template-icon">📋</div>
                            <h3>{template.name}</h3>
                            <p class="template-description">{template.description}</p>
                            <div class="template-meta">
                                <span class="question-count">
                                    {template.questionCount} questions
                                </span>
                            </div>
                            <div class="template-select-btn">
                                Select Template →
                            </div>
                        </button>
                    {/each}
                    
                    <!-- No Template Option -->
                    <button 
                        class="template-card no-template-card"
                        onclick={() => handleSelect({ id: 'none', name: 'No Template', description: 'No pre-set questions - start with a blank evaluation', questionCount: 0 })}
                    >
                        <div class="template-icon">📝</div>
                        <h3>No Template</h3>
                        <p class="template-description">Start with a blank evaluation - no pre-set questions</p>
                        <div class="template-select-btn">
                            Start Blank →
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
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
        z-index: 10000;
        padding: 1rem;
    }

    .modal-content {
        max-width: 700px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
        background: var(--color-card-bg);
        border-radius: 12px;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background-color: var(--color-bg-secondary);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
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

    .template-intro {
        color: var(--color-text-secondary);
        margin: 0 0 1.5rem 0;
        font-size: 0.95rem;
        line-height: 1.6;
    }

    .timer-section {
        background: var(--color-bg-secondary);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
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

    .templates-grid {
        display: grid;
        gap: 1rem;
    }

    .template-card {
        background: var(--color-card-bg);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
    }

    .template-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(123, 104, 166, 0.2);
    }

    .template-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    .template-card h3 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.2rem;
        font-weight: 600;
    }

    .template-description {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .template-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .question-count {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .template-select-btn {
        margin-top: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--color-accent);
        color: white;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
        transition: all 0.2s;
    }

    .template-card:hover .template-select-btn {
        background: var(--color-accent-hover);
        transform: translateX(4px);
    }

    .no-template-card {
        border-color: var(--color-text-secondary);
        opacity: 0.9;
    }

    .no-template-card:hover {
        border-color: var(--color-text-secondary);
        opacity: 1;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .no-template-card .template-select-btn {
        background: var(--color-text-secondary);
    }

    .no-template-card:hover .template-select-btn {
        background: var(--color-text-primary);
    }
</style>
