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
        background: var(--color-card-bg);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 0;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .session-detail-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, var(--color-primary), var(--color-accent));
        transform: scaleY(0);
        transform-origin: top;
        transition: transform 0.3s ease;
    }

    .session-detail-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: var(--color-primary);
        transform: translateY(-2px);
    }

    .session-detail-card:hover::before {
        transform: scaleY(1);
    }

    .session-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 2px solid var(--color-border);
        gap: 1rem;
    }

    .session-title h3 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 1.35rem;
        font-weight: 700;
    }

    .session-date {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        font-weight: 500;
    }

    .session-stats {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--color-bg-secondary);
        padding: 0.6rem 1.1rem;
        border-radius: 20px;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text-primary);
        border: 2px solid var(--color-border);
        white-space: nowrap;
        transition: all 0.2s ease;
    }

    .stat-pill:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .rating-pill {
        background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
        color: white;
        border: none;
        box-shadow: 0 2px 8px rgba(123, 104, 166, 0.3);
    }

    .rating-pill:hover {
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.4);
    }

    .stat-icon {
        font-size: 1.1rem;
    }

    .responses-section {
        margin-top: 1.75rem;
    }

    .responses-section h4 {
        margin: 0 0 1.25rem 0;
        color: var(--color-text-primary);
        font-size: 1.15rem;
        font-weight: 700;
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
        background: var(--color-bg-secondary);
        padding: 1.25rem;
        border-radius: 10px;
        border-left: 4px solid var(--color-accent);
        transition: all 0.2s ease;
    }

    .response-item:hover {
        background: var(--color-card-bg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transform: translateX(4px);
    }

    .response-question {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
    }

    .question-number {
        background: var(--color-accent);
        color: white;
        padding: 0.3rem 0.7rem;
        border-radius: 14px;
        font-size: 0.8rem;
        font-weight: 800;
        flex-shrink: 0;
        min-width: 32px;
        text-align: center;
    }

    .question-text {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 1rem;
        line-height: 1.5;
    }

    .response-answer {
        margin-left: 2.75rem;
    }

    .rating-display {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .star {
        color: var(--color-text-secondary);
        font-size: 1.35rem;
        transition: all 0.2s ease;
    }

    .star.filled {
        color: var(--color-warning, #FFD700);
        text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
    }

    .rating-value {
        margin-left: 0.75rem;
        color: var(--color-text-primary);
        font-weight: 700;
        font-size: 1rem;
        padding: 0.25rem 0.75rem;
        background: rgba(123, 104, 166, 0.1);
        border-radius: 12px;
    }

    .text-answer {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.7;
        font-size: 0.95rem;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .no-answer {
        margin: 0;
        color: var(--color-text-secondary);
        font-style: italic;
        opacity: 0.6;
        font-size: 0.9rem;
    }

    .no-responses {
        padding: 2.5rem;
        text-align: center;
        color: var(--color-text-secondary);
        font-style: italic;
        background: var(--color-bg-secondary);
        border-radius: 10px;
        border: 2px dashed var(--color-border);
    }

    .no-responses p {
        margin: 0;
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .session-detail-card {
            padding: 1.5rem;
            margin-bottom: 1rem;
        }

        .session-header {
            flex-direction: column;
            gap: 1rem;
            padding-bottom: 1rem;
        }

        .session-title h3 {
            font-size: 1.2rem;
        }

        .session-date {
            font-size: 0.85rem;
        }

        .session-stats {
            width: 100%;
            justify-content: flex-start;
        }

        .stat-pill {
            font-size: 0.85rem;
            padding: 0.5rem 0.9rem;
        }

        .response-answer {
            margin-left: 0;
            margin-top: 0.5rem;
        }

        .response-question {
            flex-direction: column;
            gap: 0.5rem;
        }

        .responses-section h4 {
            font-size: 1.05rem;
        }

        .response-item {
            padding: 1rem;
        }

        .no-responses {
            padding: 2rem 1rem;
        }
    }

    @media (max-width: 480px) {
        .session-detail-card {
            padding: 1.25rem;
        }

        .session-title h3 {
            font-size: 1.1rem;
        }

        .stat-pill {
            font-size: 0.8rem;
            padding: 0.45rem 0.8rem;
        }

        .stat-icon {
            font-size: 1rem;
        }

        .question-text {
            font-size: 0.95rem;
        }

        .text-answer {
            font-size: 0.9rem;
        }
    }
</style>
