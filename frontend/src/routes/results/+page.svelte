<script lang="ts">
    import { sessionStore, sessionStats } from '$lib/stores/sessionStore';
    import { taskStore, type Task } from '$lib/stores/taskStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { Session } from '$lib/stores/sessionStore';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';
    import SessionDetail from '$lib/components/SessionDetail.svelte';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { base } from '$app/paths';

    let sessions = $state<Session[]>([]);
    let tasks = $state<Task[]>([]);
    let stats = $state<any>(null);
    let expandedTasks = $state<Set<string>>(new Set());
    let expandedSessions = $state<Set<string>>(new Set());
    let searchQuery = $state('');
    let editingSession = $state<Session | null>(null);
    let editGroup = $state('');
    let editNotes = $state('');

    // Search and filter tasks by name or goal only
    let filteredTasks = $derived(() => {
        if (!searchQuery.trim()) return tasks;
        
        const query = searchQuery.toLowerCase();
        return tasks.filter(task => {
            const taskNameMatch = task.name?.toLowerCase().includes(query);
            const taskGoalMatch = task.goal?.toLowerCase().includes(query);
            return taskNameMatch || taskGoalMatch;
        });
    });

    onMount(() => {
        const unsubscribeSessions = sessionStore.sessions.subscribe((s) => {
            sessions = s;
        });

        const unsubscribeStats = sessionStats.subscribe((s) => {
            stats = s;
        });

        const unsubscribeTasks = taskStore.subscribe((t) => {
            tasks = t;
        });

        return () => {
            unsubscribeSessions();
            unsubscribeStats();
            unsubscribeTasks();
        };
    });

    function toggleTask(taskId: string) {
        const newSet = new Set(expandedTasks);
        if (newSet.has(taskId)) {
            newSet.delete(taskId);
        } else {
            newSet.add(taskId);
        }
        expandedTasks = newSet;
    }

    function toggleSession(sessionId: string) {
        const newSet = new Set(expandedSessions);
        if (newSet.has(sessionId)) {
            newSet.delete(sessionId);
        } else {
            newSet.add(sessionId);
        }
        expandedSessions = newSet;
    }

    function expandAllTasks() {
        expandedTasks = new Set(filteredTasks().map(t => t.id));
    }

    function collapseAllTasks() {
        expandedTasks = new Set();
    }

    function openEditSession(session: Session) {
        editingSession = session;
        editGroup = session.group || 'General';
        editNotes = session.notes || '';
    }

    function saveSessionEdit() {
        if (editingSession) {
            sessionStore.updateSession(editingSession.id, {
                group: editGroup === 'General' ? undefined : editGroup,
                notes: editNotes.trim() || undefined
            });
            editingSession = null;
        }
    }

    function cancelEdit() {
        editingSession = null;
    }

    function duplicateSession(session: Session) {
        // Get the questions from the session's responses
        const questions = Object.entries(session.responses).map(([id, response]) => ({
            id: `q-${Date.now()}-${Math.random()}`,
            label: response.question || 'Question',
            text: response.question || '',
            type: response.rating !== undefined ? 'none' as const : 'textarea' as const,
            stars: response.rating !== undefined,
            required: false
        }));

        // Start a new session with the same questions
        sessionStore.startSession({
            id: 'duplicated',
            name: session.templateName,
            questions
        });

        // Navigate to home to show the session timer
        goto(`${base}/`);
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
        const exportDate = new Date().toISOString().split('T')[0];
        
        // Create HTML report
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Report - ${exportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #4f4973;
            color: #2c2541;
            padding: 2rem;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #7b68a6;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #6b5e7c;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .stat-card {
            background: #f5f0e8;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #8b7e9d;
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #7b68a6;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            color: #6b5e7c;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .group-section {
            margin-bottom: 3rem;
        }
        .group-header {
            background: #7b68a6;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
            font-weight: bold;
        }
        .session-card {
            background: #ffffff;
            border: 2px solid #8b7e9d;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
        }
        .session-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 1rem;
            border-bottom: 2px solid #8b7e9d;
            margin-bottom: 1rem;
        }
        .session-title {
            font-size: 1.25rem;
            font-weight: bold;
            color: #2c2541;
            margin-bottom: 0.25rem;
        }
        .session-date {
            color: #6b5e7c;
            font-size: 0.9rem;
        }
        .session-stats {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .stat-pill {
            background: #f5f0e8;
            border: 2px solid #8b7e9d;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .rating-pill {
            background: #7b68a6;
            color: white;
            border: none;
        }
        .responses {
            margin-top: 1rem;
        }
        .response-item {
            background: #f5f0e8;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border-left: 4px solid #7b68a6;
        }
        .question {
            font-weight: 600;
            color: #2c2541;
            margin-bottom: 0.5rem;
        }
        .answer {
            color: #6b5e7c;
            margin-left: 1rem;
        }
        .stars {
            color: #e8b339;
            font-size: 1.2rem;
        }
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #8b7e9d;
            text-align: center;
            color: #6b5e7c;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Session Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalSessions}</div>
                <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${tasks.length}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalQuestions || 0}</div>
                <div class="stat-label">Questions Answered</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageRating.toFixed(1)}/5</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatDuration(Math.round(stats.averageDuration))}</div>
                <div class="stat-label">Avg Duration</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Session Tracker Report • ${exportDate}</p>
        </div>
    </div>
</body>
</html>
        `;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-report-${exportDate}.html`;
        link.click();
        URL.revokeObjectURL(url);
    }

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

    function generateGroupedSessionsHTML(): string {
        // TODO: Implement if needed for export
        return '';
    }
</script>

<svelte:head>
    <title>Task Analytics</title>
    <meta name="description" content="Task Analytics: aggregate insights across all tasks" />
    <meta property="og:title" content="Task Analytics" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Activity Tracker" />
    <meta name="robots" content="index,follow" />
</svelte:head>

<div class="results-page">
    <div class="page-header">
        <div class="header-left">
            <button class="btn-back" onclick={goBack}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span class="btn-text">Back</span>
            </button>
            <div class="page-title">
                <h1>Task Analytics</h1>
                {#if stats}
                    <p class="subtitle">{stats.totalSessions} session{stats.totalSessions !== 1 ? 's' : ''} tracked</p>
                {/if}
            </div>
        </div>
        <div class="header-actions">
            <button class="btn-action btn-export" onclick={exportData} title="Export session data">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Export</span>
            </button>
            <button class="btn-action btn-clear" onclick={clearAllData} title="Clear all session data">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Clear</span>
            </button>
        </div>
    </div>

    {#if stats}
        <div class="content-wrapper">
            <SessionGraphs showTable={false} />
            
            <!-- Task History (grouped by task) -->
            <div class="sessions-section">
                <div class="section-header">
                    <h2>Task History</h2>
                    <div class="header-controls">
                        <span class="session-count">{filteredTasks().length} tasks</span>
                        <div class="group-controls">
                            <button class="btn-control" onclick={expandAllTasks} title="Expand all tasks">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="7 13 12 18 17 13"></polyline>
                                    <polyline points="7 6 12 11 17 6"></polyline>
                                </svg>
                            </button>
                            <button class="btn-control" onclick={collapseAllTasks} title="Collapse all tasks">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="17 11 12 6 7 11"></polyline>
                                    <polyline points="17 18 12 13 7 18"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input 
                        type="text" 
                        class="search-input"
                        placeholder="Search tasks by name or goal..."
                        bind:value={searchQuery}
                    />
                    {#if searchQuery}
                        <button class="clear-search" onclick={() => searchQuery = ''} title="Clear search">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    {/if}
                </div>

                {#if searchQuery && filteredTasks().length === 0}
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>No tasks found</h3>
                        <p>Try adjusting your search terms</p>
                        <button class="btn-primary" onclick={() => searchQuery = ''}>Clear Search</button>
                    </div>
                {:else if filteredTasks().length > 0}
                    <div class="sessions-groups">
                        {#each filteredTasks() as t (t.id)}
                            {@const taskSessions = sessions.filter((s) => s.taskId === t.id)}
                            {@const isExpanded = expandedTasks.has(t.id)}
                            <div class="session-group">
                                <button 
                                    class="group-header"
                                    onclick={() => toggleTask(t.id)}
                                    tabindex="0"
                                    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTask(t.id)}
                                    aria-expanded={isExpanded}
                                >
                                    <div class="group-title">
                                        <svg class="chevron" class:expanded={isExpanded} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                        <span class="group-name">{t.name}</span>
                                        <span class="group-count">{taskSessions.length}</span>
                                    </div>
                                </button>
                                
                                {#if isExpanded}
                                    <div class="group-content">
                                        {#each taskSessions as session (session.id)}
                                            {@const isSessionExpanded = expandedSessions.has(session.id)}
                                            <div class="session-wrapper">
                                                <div class="session-header-row">
                                                    <button 
                                                        class="session-toggle"
                                                        onclick={() => toggleSession(session.id)}
                                                        tabindex="0"
                                                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSession(session.id)}
                                                        aria-expanded={isSessionExpanded}
                                                    >
                                                        <svg class="chevron-small" class:expanded={isSessionExpanded} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                            <polyline points="9 18 15 12 9 6"></polyline>
                                                        </svg>
                                                        <span>{session.templateName || 'Work Session'}</span>
                                                    </button>
                                                </div>
                                                {#if isSessionExpanded}
                                                    <div class="session-detail-wrapper">
                                                        <SessionDetail {session} />
                                                    </div>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-sessions">
                        <div class="no-sessions-icon">📋</div>
                        <p>No sessions found.</p>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="empty-state card">
            <div class="empty-icon">📭</div>
            <h2>No Sessions Yet</h2>
            <p>Start your first session to see results and analytics here.</p>
            <button class="btn-primary btn-large" onclick={goBack}>
                🎯 Start a Session
            </button>
        </div>
    {/if}
</div>

<!-- Edit Session Modal -->
{#if editingSession}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-overlay" onclick={cancelEdit}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>Edit Session</h2>
                <button class="btn-close" onclick={cancelEdit}>✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-group">Group</label>
                    <input 
                        id="edit-group"
                        type="text" 
                        class="input-field"
                        bind:value={editGroup}
                        placeholder="General"
                    />
                    <p class="help-text">Leave as "General" for default group</p>
                </div>
                <div class="form-group">
                    <label for="edit-notes">Notes</label>
                    <textarea 
                        id="edit-notes"
                        class="input-field textarea-field"
                        bind:value={editNotes}
                        placeholder="Add notes about this session..."
                        rows="4"
                    ></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick={cancelEdit}>Cancel</button>
                <button class="btn-primary" onclick={saveSessionEdit}>Save Changes</button>
            </div>
        </div>
    </div>
{/if}

<MobileBottomNav />

<style>
    .results-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        padding-bottom: 2rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2.5rem;
        gap: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid var(--color-border);
    }

    .header-left {
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
        flex: 1;
    }

    .page-title h1 {
        margin: 0;
        color: var(--color-text-on-dark);
        font-size: 2.25rem;
        line-height: 1.2;
    }

    .subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--color-text-on-dark);
        font-size: 1rem;
        opacity: 0.8;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
        flex-shrink: 0;
    }

    .btn-back {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 2px solid var(--color-border);
        padding: 0.75rem 1rem;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }

    .btn-back svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .btn-back:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.3);
    }

    .btn-action {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 2px solid var(--color-border);
        padding: 0.75rem 1.25rem;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }

    .btn-action svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .btn-export:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.3);
    }

    .btn-clear:hover {
        background: var(--color-danger);
        color: white;
        border-color: var(--color-danger);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(193, 122, 116, 0.3);
    }

    .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .sessions-section {
        background: transparent;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 0 0.5rem;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .section-header h2 {
        margin: 0;
        color: var(--color-text-on-dark);
        font-size: 1.75rem;
    }

    .header-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .session-count {
        background: var(--color-accent);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
    }

    .group-controls {
        display: flex;
        gap: 0.5rem;
    }

    .btn-control {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 2px solid var(--color-border);
        padding: 0.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-control svg {
        width: 18px;
        height: 18px;
    }

    .btn-control:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateY(-2px);
    }

    .search-bar {
        position: relative;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        width: 20px;
        height: 20px;
        color: var(--color-text-secondary);
        pointer-events: none;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 3rem 0.75rem 3rem;
        border: 2px solid var(--color-border);
        border-radius: 10px;
        font-size: 1rem;
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        transition: all 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(123, 104, 166, 0.1);
    }

    .clear-search {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
    }

    .clear-search svg {
        width: 18px;
        height: 18px;
    }

    .clear-search:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
    }

    .no-results {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--color-card-bg);
        border-radius: 12px;
        border: 2px dashed var(--color-border);
    }

    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .no-results h3 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
    }

    .no-results p {
        margin: 0 0 1.5rem 0;
        color: var(--color-text-secondary);
    }

    .sessions-groups {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .session-group {
        background: transparent;
    }

    .group-header {
        width: 100%;
        background: var(--color-card-bg);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0;
    }

    .group-header:hover {
        background: var(--color-bg-secondary);
        border-color: var(--color-primary);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.2);
    }

    .group-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }

    .chevron {
        width: 24px;
        height: 24px;
        color: var(--color-text-primary);
        transition: transform 0.3s ease;
        flex-shrink: 0;
    }

    .chevron.expanded {
        transform: rotate(90deg);
    }

    .group-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
    }

    .group-count {
        background: var(--color-primary);
        color: white;
        padding: 0.35rem 0.85rem;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 700;
        margin-left: auto;
    }

    .group-content {
        padding: 1rem 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .session-wrapper {
        margin-left: 2rem;
        border-left: 3px solid var(--color-border);
        padding-left: 1rem;
    }

    .session-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.75rem;
    }

    .session-toggle {
        background: var(--color-bg-secondary);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text-primary);
        flex: 1;
    }

    .session-toggle:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateX(4px);
    }

    .chevron-small {
        width: 16px;
        height: 16px;
        transition: transform 0.3s ease;
        flex-shrink: 0;
    }

    .chevron-small.expanded {
        transform: rotate(90deg);
    }

    .session-detail-wrapper {
        animation: slideDown 0.3s ease;
    }

    .no-sessions {
        background: var(--color-card-bg);
        border: 2px dashed var(--color-border);
        border-radius: 12px;
        padding: 3rem 2rem;
        text-align: center;
        color: var(--color-text-secondary);
    }

    .no-sessions-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .no-sessions p {
        margin: 0;
        font-size: 1.1rem;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        margin-top: 2rem;
        background: var(--color-card-bg);
        border-radius: 12px;
        border: 2px solid var(--color-border);
    }

    .empty-icon {
        font-size: 5rem;
        margin-bottom: 1.5rem;
        opacity: 0.8;
    }

    .empty-state h2 {
        margin: 0 0 0.75rem 0;
        color: var(--color-text-primary);
        font-size: 2rem;
    }

    .empty-state p {
        margin: 0 0 2rem 0;
        color: var(--color-text-secondary);
        font-size: 1.1rem;
    }

    .btn-large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }

    @media (max-width: 1024px) {
        .page-header {
            flex-wrap: wrap;
        }

        .header-left {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }

        .btn-back {
            align-self: flex-start;
        }

        .header-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }

    @media (max-width: 768px) {
        .results-page {
            padding: 1rem;
            padding-bottom: 6rem;
        }

        .btn-back {
            display: none;
        }

        .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
        }

        .header-left {
            gap: 1rem;
        }

        .page-title h1 {
            font-size: 1.75rem;
        }

        .subtitle {
            font-size: 0.9rem;
        }

        .btn-back {
            width: 100%;
            justify-content: center;
            padding: 0.9rem 1rem;
        }

        .header-actions {
            width: 100%;
            gap: 0.5rem;
        }

        .btn-action {
            flex: 1;
            justify-content: center;
            padding: 0.75rem 0.75rem;
            font-size: 0.85rem;
        }

        .btn-action span {
            display: none;
        }

        .btn-action svg {
            width: 20px;
            height: 20px;
        }

        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0;
        }

        .section-header h2 {
            font-size: 1.5rem;
        }

        .header-controls {
            width: 100%;
            justify-content: space-between;
        }

        .session-count {
            align-self: flex-start;
        }

        .content-wrapper {
            gap: 1.5rem;
        }

        .group-header {
            padding: 1rem;
        }

        .group-name {
            font-size: 1.1rem;
        }

        .group-count {
            font-size: 0.8rem;
            padding: 0.3rem 0.7rem;
        }

        .session-wrapper {
            margin-left: 0.5rem;
            padding-left: 0.75rem;
        }

        .session-toggle {
            padding: 0.65rem 0.85rem;
            font-size: 0.9rem;
        }

        .session-header-row {
            flex-wrap: wrap;
        }

        .empty-state {
            padding: 3rem 1rem;
        }

        .empty-icon {
            font-size: 4rem;
        }

        .empty-state h2 {
            font-size: 1.5rem;
        }

        .empty-state p {
            font-size: 1rem;
        }

        .modal-content {
            margin: 1rem;
        }

        .modal-footer {
            flex-direction: column;
        }

        .modal-footer .btn-primary,
        .modal-footer .btn-secondary {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .btn-text {
            display: none;
        }

        .btn-back svg {
            margin: 0;
        }

        .group-header {
            padding: 0.85rem;
        }

        .group-title {
            gap: 0.75rem;
        }

        .chevron {
            width: 20px;
            height: 20px;
        }

        .group-name {
            font-size: 1rem;
        }

        .session-wrapper {
            margin-left: 0;
            padding-left: 0.5rem;
            border-left-width: 2px;
        }

        .session-toggle {
            padding: 0.6rem 0.75rem;
            font-size: 0.85rem;
            gap: 0.5rem;
        }

        .chevron-small {
            width: 14px;
            height: 14px;
        }
    }

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: var(--color-card-bg);
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 2px solid var(--color-border);
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 2px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        line-height: 1;
        transition: all 0.2s;
    }

    .btn-close:hover {
        color: var(--color-text-primary);
        transform: scale(1.1);
    }

    .modal-body {
        padding: 1.5rem;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 2px solid var(--color-border);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        font-family: inherit;
        font-size: 0.95rem;
        box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--color-primary);
    }

    .input-field {
        width: 100%;
    }

    .help-text {
        margin: 0.5rem 0 0 0;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
    }

    .textarea-field {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
    }
</style>
