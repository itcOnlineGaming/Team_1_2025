<script lang="ts">
    import { sessionStore, sessionStats } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { Session } from '$lib/stores/sessionStore';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';
    import SessionDetail from '$lib/components/SessionDetail.svelte';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { base } from '$app/paths';

    let sessions = $state<Session[]>([]);
    let stats = $state<any>(null);
    let selectedSession = $state<Session | null>(null);
    let showDetailModal = $state(false);

    onMount(() => {
        // Force load from localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sessions');
            console.log('LocalStorage sessions:', stored);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    console.log('Parsed sessions:', parsed);
                } catch (e) {
                    console.error('Error parsing:', e);
                }
            }
        }

        const unsubscribeSessions = sessionStore.sessions.subscribe((s) => {
            console.log('Sessions from store:', s);
            sessions = s;
        });

        const unsubscribeStats = sessionStats.subscribe((s) => {
            console.log('Stats from store:', s);
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
        goto(`${base}/`);
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
        <button class="btn-back" onclick={goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </button>
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
        <SessionGraphs showTable={false} onViewDetails={viewSessionDetail} />
        
        <!-- Sessions Detail List -->
        <div class="sessions-section">
            <h2>All Sessions</h2>
            {#if sessions.length > 0}
                <div class="sessions-grid">
                    {#each sessions.slice().reverse() as session (session.id)}
                        <SessionDetail {session} />
                    {/each}
                </div>
            {:else}
                <div class="no-sessions">
                    <p>No sessions found.</p>
                </div>
            {/if}
        </div>
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

<MobileBottomNav />

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
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    .btn-back:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateX(-2px);
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
        z-index: 10000;
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
            padding-bottom: 5rem; /* Add padding for bottom nav */
        }

        .page-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .btn-back {
            width: 100%;
            justify-content: center;
        }

    }
</style>
