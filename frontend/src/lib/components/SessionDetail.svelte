<script lang="ts">
    import type { Session } from '$lib/stores/sessionStore';
    import { createEventDispatcher } from 'svelte';

    interface Props {
        session: Session;
    }

    let { session }: Props = $props();
    const dispatch = createEventDispatcher();

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Get all responses as an array
    let responseEntries = $derived(Object.entries(session.responses));
    let hasResponses = $derived(responseEntries.length > 0);
</script>

<div class="session-detail-card">
    <div class="session-header">
        <div class="session-title">
            <h3>{session.templateName || 'Work Session'}</h3>
            <p class="session-date">{formatDate(session.startTime)}</p>
        </div>
        <div class="session-stats">
            <div class="stat-pill">
                <span class="stat-icon">⏱️</span>
                {formatDuration(session.duration)}
            </div>
            {#if session.overallRating}
                <div class="stat-pill rating-pill">
                    <span class="stat-icon">⭐</span>
                    {session.overallRating}/5
                </div>
            {/if}
        </div>
    </div>

    {#if hasResponses}
        <div class="responses-section">
            <h4>Session Feedback</h4>
            <div class="responses-list">
                {#each responseEntries as [id, response], index}
                    <div class="response-item">
                        <div class="response-question">
                            <span class="question-number">Q{index + 1}</span>
                            <span class="question-text">{response.question || 'Question'}</span>
                        </div>
                        <div class="response-answer">
                            {#if response.rating !== undefined}
                                <div class="rating-display">
                                    {#each Array(5) as _, i}
                                        <span class="star" class:filled={i < response.rating}>
                                            {i < response.rating ? '★' : '☆'}
                                        </span>
                                    {/each}
                                    <span class="rating-value">{response.rating}/5</span>
                                </div>
                            {:else if response.answer}
                                <p class="text-answer">{response.answer}</p>
                            {:else}
                                <p class="no-answer">No response provided</p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="no-responses">
            <p>No evaluation questions were answered for this session.</p>
        </div>
    {/if}
</div>

<style>
    .session-detail-card {
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        transition: all 0.2s;
    }

    .session-detail-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .session-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--color-border);
    }

    .session-title h3 {
        margin: 0 0 0.25rem 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
    }

    .session-date {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .session-stats {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--color-bg-primary);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
    }

    .rating-pill {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: white;
        border: none;
    }

    .stat-icon {
        font-size: 1rem;
    }

    .responses-section {
        margin-top: 1.5rem;
    }

    .responses-section h4 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .responses-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .response-item {
        background: var(--color-bg-primary);
        padding: 1rem;
        border-radius: 8px;
        border-left: 3px solid var(--color-accent);
    }

    .response-question {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .question-number {
        background: var(--color-accent);
        color: white;
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
    }

    .question-text {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 0.95rem;
        line-height: 1.4;
    }

    .response-answer {
        margin-left: 2.5rem;
    }

    .rating-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .star {
        color: var(--color-text-secondary);
        font-size: 1.25rem;
    }

    .star.filled {
        color: #FFD700;
    }

    .rating-value {
        margin-left: 0.5rem;
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 0.95rem;
    }

    .text-answer {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
        font-size: 0.95rem;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .no-answer {
        margin: 0;
        color: var(--color-text-secondary);
        font-style: italic;
        opacity: 0.6;
    }

    .no-responses {
        padding: 2rem;
        text-align: center;
        color: var(--color-text-secondary);
        font-style: italic;
    }

    @media (max-width: 768px) {
        .session-header {
            flex-direction: column;
            gap: 1rem;
        }

        .session-stats {
            width: 100%;
            justify-content: flex-start;
        }

        .response-answer {
            margin-left: 0;
            margin-top: 0.5rem;
        }

        .response-question {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
</style>
