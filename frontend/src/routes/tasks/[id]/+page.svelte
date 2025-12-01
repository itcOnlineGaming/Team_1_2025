<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { taskStore, type Task } from '$lib/stores/taskStore';
    import { sessionStore, type Session } from '$lib/stores/sessionStore';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
    import { onMount } from 'svelte';

    let task: Task | null = null;
    let sessions: Session[] = [];
    let loading = true;
    let starting = false;
    let showFinishModal = false;
    let feedbackText = '';
    let expandedSession: string | null = null;

    onMount(() => {
        const taskId = $page.params.id;
        
        // Get task from store
        const unsubscribeTasks = taskStore.subscribe((tasks) => {
            task = tasks.find(t => t.id === taskId) || null;
        });

        // Get sessions for this task
        const unsubscribeSessions = sessionStore.sessions.subscribe((allSessions) => {
            sessions = allSessions.filter(s => s.taskId === taskId);
        });

        loading = false;

        return () => {
            unsubscribeTasks();
            unsubscribeSessions();
        };
    });

    function goBack() {
        goto(`${base}/tasks`);
    }

    function startSession() {
        if (!task) return;
        starting = true;
        try {
            const template = { id: 'direct', name: task.name, questions: [] };
            sessionStore.startSession(template, { id: task.id, name: task.name });
            goto(`${base}/`);
        } catch (err) {
            console.error('Failed to start session', err);
            starting = false;
        }
    }

    function deleteTask() {
        if (!task) return;
        if (confirm(`Are you sure you want to delete "${task.name}" and all its sessions?`)) {
            taskStore.removeTask(task.id);
            sessionStore.deleteSessionsByTaskId(task.id);
            goto(`${base}/tasks`);
        }
    }

    function finishTask() {
        showFinishModal = true;
        feedbackText = '';
    }

    function submitFinish() {
        if (!task) return;
        taskStore.completeTask(task.id, {
            feedback: feedbackText,
            completedAt: Date.now()
        });
        showFinishModal = false;
        goto(`${base}/tasks`);
    }

    function cancelFinish() {
        showFinishModal = false;
        feedbackText = '';
    }

    function getAverageRating(session: Session): number | null {
        if (!session.responses) return null;
        const ratings: number[] = [];
        for (const resp of Object.values(session.responses)) {
            if (typeof resp?.rating === 'number' && resp.rating > 0) {
                ratings.push(resp.rating);
            }
        }
        if (ratings.length === 0) return null;
        return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    }

    function formatSessionName(session: Session): string {
        return session.templateName || `Session ${sessions.indexOf(session) + 1}`;
    }

    function formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function toggleSessionExpand(sessionId: string) {
        expandedSession = expandedSession === sessionId ? null : sessionId;
    }

    function getResponsesArray(session: Session) {
        if (!session.responses) return [];
        return Object.entries(session.responses).map(([key, value]) => ({
            key,
            question: value.question || key,
            answer: value.answer,
            rating: value.rating
        }));
    }
</script>

<div class="task-detail-page">
    <div class="page-header">
        <button class="btn-back" onclick={goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Tasks
        </button>
        <button class="btn-delete" onclick={deleteTask} aria-label="Delete task">
            🗑 Delete
        </button>
    </div>

    {#if loading}
        <p>Loading task details...</p>
    {:else if task}
        <div class="task-details">
            <div class="task-header">
                <h1>{task.name}</h1>
                {#if task.goal}
                    <p class="task-goal">{task.goal}</p>
                {/if}
            </div>

            <div class="start-session-container">
                {#if !task.completedAt}
                    <button class="btn-start-session" onclick={startSession} disabled={starting}>
                        {#if starting}
                            <span>Starting...</span>
                        {:else}
                            ▶ Start New Session
                        {/if}
                    </button>
                {/if}
            </div>

            <div class="finish-task-container">
                {#if !task.completedAt}
                    <button class="btn-finish-task" onclick={finishTask}>
                        ✓ Finish Task
                    </button>
                {/if}
            </div>

            <div class="sessions-section">
                <h2>Previous Sessions</h2>
                {#if sessions.length === 0}
                    <p class="no-sessions">No sessions yet for this task</p>
                {:else}
                    <div class="sessions-table">
                        <div class="table-header">
                            <div class="col-session">Session</div>
                            <div class="col-rating">Avg Rating</div>
                        </div>
                        {#each sessions as session, idx (session.id)}
                            <div class="session-item">
                                <button 
                                    class="table-row"
                                    onclick={() => toggleSessionExpand(session.id)}
                                    aria-expanded={expandedSession === session.id}
                                >
                                    <div class="col-session">
                                        <div class="session-name">{formatSessionName(session)}</div>
                                        <div class="session-date">{formatDate(session.startTime)}</div>
                                    </div>
                                    <div class="col-rating">
                                        {#if getAverageRating(session) !== null}
                                            <span class="rating-badge">{getAverageRating(session)} ⭐</span>
                                        {:else}
                                            <span class="rating-badge muted">N/A</span>
                                        {/if}
                                    </div>
                                </button>

                                {#if expandedSession === session.id}
                                    <div class="session-details">
                                        <h3>Questionnaire Responses</h3>
                                        {#if getResponsesArray(session).length === 0}
                                            <p class="no-responses">No responses recorded</p>
                                        {:else}
                                            <div class="responses-list">
                                                {#each getResponsesArray(session) as response}
                                                    <div class="response-item">
                                                        <div class="response-question">{response.question}</div>
                                                        <div class="response-body">
                                                            {#if response.answer}
                                                                <div class="response-answer">{response.answer}</div>
                                                            {/if}
                                                            {#if response.rating}
                                                                <div class="response-rating">{response.rating} ⭐</div>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <p class="error">Task not found</p>
    {/if}
</div>

{#if showFinishModal}
    <div class="modal-overlay" tabindex="0" role="button" onclick={cancelFinish} onkeydown={(e) => e.key === 'Escape' && cancelFinish()}>
        <div class="modal-content" tabindex="0" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()}>
            <h2>How did the task go?</h2>
            
            <div class="form-group">
                <label for="feedback">Result / Feedback</label>
                <textarea 
                    id="feedback"
                    class="input-field feedback-textarea"
                    placeholder="Describe the outcome. For example: 'Studied for 2 hours, felt well prepared for the exam'"
                    bind:value={feedbackText}
                    rows="4"
                ></textarea>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick={cancelFinish}>Cancel</button>
                <button class="btn-primary" onclick={submitFinish}>Mark as Complete</button>
            </div>
        </div>
    </div>
{/if}

<MobileBottomNav />

<style>
    .task-detail-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        padding-bottom: 6rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        position: relative;
    }

    .btn-back {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
    }

    .btn-back:hover {
        background: var(--color-accent);
        color: white;
        border-color: var(--color-accent);
        transform: translateX(-2px);
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    .btn-delete {
        background: #dc2626;
        color: white;
        border: 1px solid #dc2626;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
    }

    .btn-delete:hover {
        background: #b91c1c;
        border-color: #b91c1c;
        transform: translateX(2px);
    }

    .task-details {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .task-header {
        text-align: center;
        padding: 2rem;
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 12px;
    }

    .task-header h1 {
        margin: 0 0 1rem 0;
        color: var(--color-accent);
        font-size: 2.5rem;
    }

    .task-goal {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 1.1rem;
        font-style: italic;
    }

    .start-session-container {
        display: flex;
        justify-content: center;
        padding: 0.5rem 2rem;
    }

    .btn-start-session {
        width: 220px;
        height: 220px;
        border-radius: 50%;
        border: 3px solid var(--color-accent);
        background: var(--color-accent);
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1rem;
        transition: all 0.2s ease;
        box-shadow: 0 8px 24px rgba(123, 104, 166, 0.3);
    }

    .btn-start-session:hover:not(:disabled) {
        transform: scale(1.08);
        box-shadow: 0 12px 32px rgba(123, 104, 166, 0.4);
    }

    .btn-start-session:active:not(:disabled) {
        transform: scale(0.96);
    }

    .btn-start-session:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .finish-task-container {
        display: flex;
        justify-content: center;
        padding: 0.25rem 2rem;
    }

    .btn-finish-task {
        background: var(--color-success);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(123, 156, 110, 0.2);
    }

    .btn-finish-task:hover {
        background: var(--color-success-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(123, 156, 110, 0.3);
    }

    .btn-finish-task:active {
        transform: translateY(0);
    }

    .sessions-section {
        padding: 2rem;
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 12px;
    }

    .sessions-section h2 {
        margin: 0 0 1.5rem 0;
        color: var(--color-accent);
        font-size: 1.5rem;
    }

    .no-sessions {
        text-align: center;
        color: var(--color-text-secondary);
        padding: 2rem;
        font-style: italic;
    }

    .sessions-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .table-header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2rem;
        padding: 1rem;
        background: var(--color-bg-secondary);
        border-radius: 8px;
        font-weight: 600;
        color: var(--color-text-primary);
        border-bottom: 2px solid var(--color-border);
    }

    .table-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2rem;
        padding: 1rem;
        background: var(--color-bg-primary);
        border-radius: 8px;
        border: 1px solid var(--color-border);
        transition: all 0.2s ease;
        border: none;
        background: none;
        cursor: pointer;
        width: 100%;
        text-align: left;
    }

    .session-item {
        border-radius: 8px;
        border: 1px solid var(--color-border);
        overflow: hidden;
        margin-bottom: 0.5rem;
        transition: all 0.2s ease;
    }

    .session-item:last-child {
        margin-bottom: 0;
    }

    .table-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2rem;
        padding: 1rem;
        background: var(--color-bg-primary);
        transition: all 0.2s ease;
    }

    .table-row:hover {
        background: var(--color-bg-secondary);
        border-color: var(--color-accent);
    }

    .session-details {
        padding: 1.5rem;
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border);
        animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 1000px;
        }
    }

    .session-details h3 {
        margin: 0 0 1rem 0;
        color: var(--color-accent);
        font-size: 1.1rem;
    }

    .responses-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .response-item {
        padding: 1rem;
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .response-question {
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.5rem;
    }

    .response-body {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .response-answer {
        color: var(--color-text-secondary);
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .response-rating {
        color: var(--color-accent);
        font-weight: 600;
    }

    .no-responses {
        text-align: center;
        color: var(--color-text-secondary);
        padding: 1rem;
        font-style: italic;
    }

    .col-session {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .session-name {
        color: var(--color-text-primary);
        font-weight: 500;
    }

    .session-date {
        color: var(--color-text-secondary);
        font-size: 0.85rem;
    }

    .col-rating {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 100px;
    }

    .rating-badge {
        background: var(--color-accent);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .rating-badge.muted {
        background: var(--color-bg-secondary);
        color: var(--color-text-secondary);
    }

    .error {
        text-align: center;
        color: var(--color-text-secondary);
        padding: 3rem;
    }

    @media (max-width: 768px) {
        .task-detail-page {
            padding: 1rem;
            padding-bottom: 100px;
        }

        .task-header {
            padding: 1.5rem;
        }

        .task-header h1 {
            font-size: 1.8rem;
        }

        .task-goal {
            font-size: 1rem;
        }

        .btn-start-session {
            width: 160px;
            height: 160px;
            font-size: 0.95rem;
        }

        .btn-finish-task {
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
        }

        .table-header,
        .table-row {
            grid-template-columns: 1fr auto;
            gap: 1rem;
            padding: 0.75rem;
        }

        .session-date {
            font-size: 0.75rem;
        }

        .rating-badge {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }

        .session-details {
            padding: 1rem;
        }

        .session-details h3 {
            font-size: 1rem;
        }

        .response-item {
            padding: 0.75rem;
        }

        .response-question {
            font-size: 0.95rem;
        }

        .response-rating,
        .response-answer {
            font-size: 0.9rem;
        }
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: var(--color-card-bg);
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-content h2 {
        margin: 0 0 1.5rem 0;
        color: var(--color-accent);
        font-size: 1.5rem;
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

    .feedback-textarea {
        resize: vertical;
        font-family: inherit;
        color: var(--color-text-primary);
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }

    .modal-actions button {
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-primary {
        background: var(--color-accent);
        color: white;
    }

    .btn-primary:hover {
        background: var(--color-accent-hover);
    }

    .btn-secondary {
        background: #e5e7eb;
        color: var(--color-text-primary);
    }

    .btn-secondary:hover {
        background: #d1d5db;
    }

    @media (max-width: 768px) {
        .modal-content {
            padding: 1.5rem;
        }

        .modal-content h2 {
            font-size: 1.25rem;
        }

        .modal-actions button {
            width: 100%;
        }
    }
</style>
