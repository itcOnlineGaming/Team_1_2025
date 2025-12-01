<script lang="ts">
    import type { Task } from '$lib/stores/taskStore';
    import { sessionStore } from '$lib/stores/sessionStore';
    import type { Session } from '$lib/stores/sessionStore';
    import { createEventDispatcher, onDestroy } from 'svelte';

    export let task: Task;
    export let loading = false;

    const dispatch = createEventDispatcher();

    function onStart() { dispatch('start', { task }); }
    function onEdit() { dispatch('edit', { task }); }

    function truncate(text?: string, max = 120) { if (!text) return ''; return text.length > max ? text.slice(0, max-1) + '…' : text; }

    // derived session stats for this task
    let allSessions: Session[] = [];
    const unsub = sessionStore.sessions.subscribe((s) => (allSessions = s));

    $: sessionsFor = allSessions.filter((s) => s.taskId === task.id);
    $: sessionCount = sessionsFor.length;

    // compute average rating for this task robustly
    // look for session.overallRating first, fall back to any rating values present in session.responses
    $: avgRating = (() => {
        const gathered: number[] = [];

        for (const s of sessionsFor) {
            // prefer overallRating if set
            if (typeof s.overallRating === 'number') {
                gathered.push(s.overallRating);
                continue;
            }

            // otherwise, scan responses for a numeric rating (use first found)
            if (s.responses) {
                const r = Object.values(s.responses).find((resp: any) => typeof resp?.rating === 'number');
                if (r && typeof r.rating === 'number') {
                    gathered.push(r.rating);
                }
            }
        }

        if (gathered.length === 0) return null;
        const avg = gathered.reduce((a, b) => a + b, 0) / gathered.length;
        return Math.round(avg * 10) / 10; // one decimal
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

</script>

<article class="task-card card">
    <div class="task-row">
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

</article>

    <div class="card-actions">
        <button class="btn-primary start-btn" on:click={onStart} disabled={loading} aria-busy={loading}>
            {#if loading}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="white" stroke-opacity="0.3" stroke-width="4"></circle><path d="M22 12A10 10 0 1 1 12 2" stroke="white" stroke-width="4" stroke-linecap="round"></path></svg>
                &nbsp;Starting…
            {:else}
                ▶ Start Session
            {/if}
        </button>

        <button class="btn-secondary edit-btn" on:click={onEdit}>✎ Edit</button>
    </div>

    <style>
        .task-card { display:flex; flex-direction:column; justify-content:space-between; min-height:84px; }

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
            /* responsive but clamped size so it visually matches the stat 'bubble' height */
            font-size: clamp(1rem, 1.6vw + 0.8rem, 1.25rem);
            line-height: 1.05;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .muted { color:var(--color-text-secondary); }

        .card-actions { display:flex; gap:.5rem; padding: calc(var(--bubble-h) * 0.08) calc(var(--bubble-h) * 0.12) calc(var(--bubble-h) * 0.12) calc(var(--bubble-h) * 0.12); align-items:center; }
        .start-btn { flex:0 0 auto; padding: .35rem .7rem; font-size: .9rem; }
        .edit-btn { flex:0 0 auto; }

        /* Keep one-row layout even on mobile — compact the stat cells */
        @media (max-width: 720px) {
            .task-row { grid-template-columns: 1fr auto; gap: .5rem; padding: .6rem .75rem; }
            .cell { align-items:center; justify-content:center; }
            .cell.count, .cell.rating, .cell.avgtime { flex-direction:column; gap: .2rem; }
            .cell .icon { margin-bottom:2px; opacity:0.95; display:flex; align-items:center; justify-content:center; }
            .cell .icon svg { width: clamp(16px, calc(var(--bubble-h) * 0.22), 24px); height: clamp(16px, calc(var(--bubble-h) * 0.22), 24px); }
            .card-actions { padding-top: 0.35rem; display:flex; gap:.5rem; justify-content:flex-end; }
        }
    </style>
