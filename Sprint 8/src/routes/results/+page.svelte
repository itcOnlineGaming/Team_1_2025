<script lang="ts">
    import { sessionStore, sessionStats } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { Session } from '$lib/stores/sessionStore';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';

    let sessions = $state<Session[]>([]);
    let stats = $state<any>(null);
    let selectedSession = $state<Session | null>(null);
    let showDetailModal = $state(false);

    onMount(() => {
        const unsubscribeSessions = sessionStore.sessions.subscribe((s) => {
            sessions = s;
        });

        const unsubscribeStats = sessionStats.subscribe((s) => {
            stats = s;
        });

        return () => {
            unsubscribeSessions();
            unsubscribeStats();
        };
    });

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function viewSessionDetail(session: Session) {
        selectedSession = session;
        showDetailModal = true;
    }

    function closeDetailModal() {
        showDetailModal = false;
        selectedSession = null;
    }

    function goBack() {
        goto('/');
    }

    function clearAllData() {
        if (confirm('Are you sure you want to delete all session data? This cannot be undone.')) {
            sessionStore.clearAllSessions();
            alert('All session data has been cleared.');
        }
    }

    function exportData() {
        const dataStr = JSON.stringify({ sessions, stats }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="results-page">
    <div class="page-header">
        <button class="btn-back" onclick={goBack}>← Back to Home</button>
        <h1>📊 Session Results</h1>
        <div class="header-actions">
            <button class="btn-info btn-sm" onclick={exportData}>
                📥 Export Data
            </button>
            <button class="btn-danger btn-sm" onclick={clearAllData}>
                🗑️ Clear All
            </button>
        </div>
    </div>

        {#if stats}
        <SessionGraphs showTable={true} onViewDetails={viewSessionDetail} />
    {:else}
        <div class="empty-state card">
            <div class="empty-icon">📭</div>
            <h2>No Sessions Yet</h2>
            <p>Start your first session to see results and analytics here.</p>
            <button class="btn-primary" onclick={goBack}>
                Start a Session
            </button>
        </div>
    {/if}
</div>

<!-- Session Detail Modal -->
{#if showDetailModal && selectedSession}
    <div class="modal-overlay" role="dialog" tabindex="-1" onclick={closeDetailModal} onkeydown={(e) => e.key === 'Escape' && closeDetailModal()}>
        <div class="modal-content card" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <div>
                    <h2>Session Details</h2>
                    <p class="modal-subtitle">{selectedSession.templateName}</p>
                </div>
                <button class="btn-close" onclick={closeDetailModal}>✕</button>
            </div>
            
            <div class="modal-body">
                <div class="detail-section">
                    <h3>Session Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Session ID:</span>
                            <span class="detail-value">{selectedSession.id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Template:</span>
                            <span class="detail-value">{selectedSession.templateName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Time:</span>
                            <span class="detail-value">{formatDate(selectedSession.startTime)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">End Time:</span>
                            <span class="detail-value">{selectedSession.endTime ? formatDate(selectedSession.endTime) : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">{formatDuration(selectedSession.duration)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Overall Rating:</span>
                            <span class="detail-value">
                                {#if selectedSession.overallRating}
                                    {selectedSession.overallRating}/5 {'⭐'.repeat(selectedSession.overallRating)}
                                {:else}
                                    N/A
                                {/if}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Responses</h3>
                    <div class="responses-list">
                        {#each Object.entries(selectedSession.responses) as [questionId, response]}
                            <div class="response-item card">
                                <div class="response-header">
                                    <span class="question-id">{questionId}</span>
                                </div>
                                <div class="response-content">
                                    {#if response.answer}
                                        <div class="response-field">
                                            <strong>Answer:</strong> {response.answer}
                                        </div>
                                    {/if}
                                    {#if response.rating !== undefined}
                                        <div class="response-field">
                                            <strong>Rating:</strong> {response.rating}/5 {'⭐'.repeat(response.rating)}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" onclick={closeDetailModal}>Close</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .results-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .page-header h1 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 2rem;
    }

    .header-actions {
        display: flex;
        gap: 0.5rem;
    }

    .btn-back {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.6rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .btn-back:hover {
        background: var(--color-bg-primary);
        border-color: var(--color-accent);
    }

    .sessions-table-section {
        padding: 1.5rem;
        margin-top: 2rem;
    }

    .sessions-table-section h3 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.2rem;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 2px solid var(--color-border);
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 0.9rem;
    }

    td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text-secondary);
    }

    tr:hover {
        background: var(--color-bg-secondary);
    }

    .session-number {
        font-weight: 600;
        color: var(--color-accent);
    }

    .template-name {
        color: var(--color-text-primary);
        font-weight: 500;
    }

    .rating-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        color: var(--color-accent);
    }

    .stars {
        font-size: 0.9rem;
    }

    .no-rating {
        color: var(--color-text-secondary);
        opacity: 0.5;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        margin-top: 2rem;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .empty-state h2 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
    }

    .empty-state p {
        margin: 0 0 2rem 0;
        color: var(--color-text-secondary);
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
        align-items: start;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
    }

    .modal-subtitle {
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

    .detail-section {
        margin-bottom: 2rem;
    }

    .detail-section h3 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .detail-value {
        color: var(--color-text-primary);
        font-weight: 600;
    }

    .responses-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .response-item {
        padding: 1rem;
        background: var(--color-bg-primary);
    }

    .response-header {
        margin-bottom: 0.5rem;
    }

    .question-id {
        font-size: 0.85rem;
        color: var(--color-accent);
        font-weight: 600;
        font-family: monospace;
    }

    .response-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .response-field {
        color: var(--color-text-primary);
        font-size: 0.95rem;
    }

    .response-field strong {
        color: var(--color-text-secondary);
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border);
    }

    @media (max-width: 768px) {
        .results-page {
            padding: 1rem;
        }

        .page-header {
            flex-direction: column;
            align-items: flex-start;
        }

        table {
            font-size: 0.85rem;
        }

        th, td {
            padding: 0.5rem;
        }
    }
</style>
