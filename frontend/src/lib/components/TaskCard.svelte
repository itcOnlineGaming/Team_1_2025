<script lang="ts">
    import type { Task } from '$lib/stores/taskStore';
    import { sessionStore } from '$lib/stores/sessionStore';
    import type { Session } from '$lib/stores/sessionStore';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    export let task: Task;
    export let loading = false;

    const dispatch = createEventDispatcher();

    function onStart() { dispatch('start', { task }); }
    function onEdit() { goto(`${base}/tasks/${task.id}`); }
    function onDelete() { dispatch('delete', { task }); }

    function truncate(text?: string, max = 120) { if (!text) return ''; return text.length > max ? text.slice(0, max-1) + '…' : text; }

    // derived session stats for this task
    let allSessions: Session[] = [];
    const unsub = sessionStore.sessions.subscribe((s) => (allSessions = s));

    $: sessionsFor = allSessions.filter((s) => s.taskId === task.id);
    $: sessionCount = sessionsFor.length;

    // compute average rating: aggregate ALL response ratings in each session (robust even if overallRating not set)
    $: avgRating = (() => {
        const ratings: number[] = [];
        for (const s of sessionsFor) {
            if (s.responses) {
                for (const resp of Object.values(s.responses)) {
                    if (typeof resp?.rating === 'number' && resp.rating > 0) ratings.push(resp.rating);
                }
            }
        }
        if (ratings.length === 0) return null;
        const sum = ratings.reduce((a, b) => a + b, 0);
        return Math.round((sum / ratings.length) * 10) / 10; // 1 decimal
    })();

    // compute average duration (seconds) -> format to human readable
    function formatDuration(seconds: number | null) {
        if (!seconds && seconds !== 0) return 'N/A';
        seconds = Math.round(seconds);
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, '0')}m`;
        if (mins > 0) return `${mins}m ${String(secs).padStart(2, '0')}s`;
        return `${secs}s`;
    }

    $: avgDuration = (() => {
        if (sessionsFor.length === 0) return null;
        const sum = sessionsFor.reduce((acc, s) => acc + (s.duration || 0), 0);
        return Math.round((sum / sessionsFor.length));
    })();

    // cleanup
    onDestroy(() => unsub());

    let isMobile = typeof window !== 'undefined' ? window.innerWidth <= 720 : false;

    function handleTaskRowClick() {
        if (isMobile) {
            onEdit();
        }
    }

    function handleKeyPress(e: KeyboardEvent) {
        if (isMobile && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onEdit();
        }
    }

</script>

<article class="task-card card" aria-label="Task: {task.name}. Hover to reveal actions">
    <div class="task-row" role="button" tabindex={isMobile ? 0 : -1} on:click={handleTaskRowClick} on:keydown={handleKeyPress}>
        <div class="cell name">
            <div class="task-title">{task.name}</div>
        </div>

        <div class="stats" role="group" aria-label="Task statistics">
            <div class="cell count" role="status" aria-label="Sessions completed">
            <div class="icon" aria-hidden="true">
                <!-- note icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="big">{sessionCount}</div>
        </div>

            <div class="cell rating" aria-label="Average rating">
            <div class="icon" aria-hidden="true">
                <!-- star icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.17L12 18.896 4.664 23.166l1.4-8.17L.13 9.211l8.2-1.192z" stroke="currentColor" stroke-width="0.6" stroke-linejoin="round"/></svg>
            </div>
            {#if avgRating !== null}
                <div class="big">{avgRating}</div>
            {:else}
                <div class="big muted">N/A</div>
            {/if}
        </div>

            <div class="cell avgtime" aria-label="Average session time">
            <div class="icon" aria-hidden="true">
                <!-- clock icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.25"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            {#if avgDuration !== null}
                <div class="big">{formatDuration(avgDuration)}</div>
            {:else}
                <div class="big muted">N/A</div>
            {/if}
            </div>
        </div>
    </div>

    <!-- Overlay actions inside card -->
    <div class="overlay" aria-hidden={!loading}>
        <div class="actions" role="group" aria-label="Task actions">
            {#if !task.completedAt}
                <button class="btn-primary start-btn" on:click={onStart} disabled={loading} aria-busy={loading}>
                    {#if loading}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="white" stroke-opacity="0.3" stroke-width="4"></circle><path d="M22 12A10 10 0 1 1 12 2" stroke="white" stroke-width="4" stroke-linecap="round"></path></svg>
                        &nbsp;Starting…
                    {:else}
                        ▶ Start Session
                    {/if}
                </button>
            {/if}
            <button class="btn-secondary detail-btn" on:click={onEdit}>📋 Details</button>
            {#if !task.completedAt}
                <button class="btn-secondary delete-btn" on:click={onDelete} aria-label="Delete task">🗑 Delete</button>
            {/if}
        </div>
    </div>
</article>

    <style>
        .task-card { display:flex; flex-direction:column; justify-content:space-between; min-height:84px; position:relative; color: var(--color-text-primary); transition: background .25s ease, color .25s ease, border-color .25s ease, box-shadow .25s ease; overflow:hidden; box-shadow: 0 2px 8px rgba(123, 104, 166, 0.15); }

        /* Row grid: name column takes half, stats grouped on right */
        /* bubble sizing - controls the height and scale of contents */
        .task-card { --bubble-h: clamp(64px, 8vmin, 96px); }
        /* keep name constrained so it can't push the stats; avoid layout shifts */
        .task-row { display:grid; grid-template-columns: 1fr auto; gap: 1rem; align-items:center; padding: calc(var(--bubble-h) * 0.12) calc(var(--bubble-h) * 0.12); height: var(--bubble-h); border-radius: calc(var(--bubble-h) * 0.14); }
        /* slightly larger gap so the three descriptors breathe more */
        .stats { display:flex; gap:1.6rem; justify-content:flex-end; align-items:center; }
        .cell { display:flex; flex-direction:column; gap: .15rem; }
        /* center the icon + text inside the three stat cells (count/rating/avgtime) */
        .cell.count, .cell.rating, .cell.avgtime { align-items:center; text-align:center; }
        .cell .big { font-weight:700; font-size: clamp(.85rem, calc(var(--bubble-h) * 0.13), 1.15rem); }
        /* keep the task name visually prominent and left-aligned; scale up to match stat size */
        .cell.name { align-items:flex-start; text-align:left; min-width:0; /* allow shrinking */ }
        .cell.name .task-title {
            font-weight:700;
            margin:0;
            color: var(--color-accent);
            /* responsive but clamped size so it visually matches the stat 'bubble' height */
            font-size: clamp(1rem, 1.6vw + 0.8rem, 1.25rem);
            line-height: 1.05;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .muted { color:var(--color-text-secondary); }

        /* Internal overlay */
        .overlay { position:absolute; inset:0; background:rgba(245,240,232,0); backdrop-filter: none; display:flex; align-items:center; justify-content:center; transition: background .25s ease; pointer-events:none; }
        .overlay .actions { display:flex; gap:.65rem; opacity:0; transform:translateY(6px); transition: opacity .25s ease, transform .25s ease; pointer-events:auto; }
        .task-card:hover .overlay,
        .task-card:focus-visible .overlay { background:rgba(245,240,232,0.78); }
        .task-card:hover .overlay .actions,
        .task-card:focus-visible .overlay .actions { opacity:1; transform:translateY(0); }
        .task-card:hover .icon svg,
        .task-card:focus-visible .icon svg { stroke: var(--color-primary); }
        .task-card:hover .task-title,
        .task-card:focus-visible .task-title { color: var(--color-primary); }
        .start-btn { flex:0 0 auto; padding: .35rem .7rem; font-size: .9rem; }
        .detail-btn { flex:0 0 auto; }
        .delete-btn { flex:0 0 auto; background: #dc2626; border-color: #dc2626; color: white; }
        .delete-btn:hover { background: #b91c1c; border-color: #b91c1c; }

        /* Keep one-row layout even on mobile — compact the stat cells */
        @media (max-width: 720px) {
            .task-row { grid-template-columns: 1fr auto; gap: .5rem; padding: .6rem .75rem; }
            .cell { align-items:center; justify-content:center; }
            .cell.count, .cell.rating, .cell.avgtime { flex-direction:column; gap: .2rem; }
            .cell .icon { margin-bottom:2px; opacity:0.95; display:flex; align-items:center; justify-content:center; }
            .cell .icon svg { width: clamp(16px, calc(var(--bubble-h) * 0.22), 24px); height: clamp(16px, calc(var(--bubble-h) * 0.22), 24px); }
            .overlay { display:none; }
            .task-card:hover .overlay, .task-card:focus-visible .overlay { background:rgba(245,240,232,0); }
            .overlay .actions { flex-direction:column; }
        }
    </style>
