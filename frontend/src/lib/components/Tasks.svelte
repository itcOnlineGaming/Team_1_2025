<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { taskStore, type Task } from '$lib/stores/taskStore';
    import { sessionStore } from '$lib/stores/sessionStore';
    import TaskCard from './TaskCard.svelte';
    import Popup from './Popup.svelte';
    import type { Session } from '$lib/stores/sessionStore';

    // page state
    let tasks: Task[] = [];
    let loading = true;
    let showCreate = false;
    let newName = '';
    let newGoal = '';
    let nameInput: HTMLInputElement | null = null;
    let createButton: HTMLButtonElement | null = null;
    let starting: Record<string, boolean> = {};

    // sessions derived lazily
    let allSessions: Session[] = [];

    const unsubscribeTasks = taskStore.subscribe((t) => (tasks = t));
    const unsubscribeSessions = sessionStore.sessions.subscribe((s) => (allSessions = s));

    onMount(() => {
        loading = false;
        return () => {
            unsubscribeTasks();
            unsubscribeSessions();
        };
    });


    function openCreate() {
        newName = '';
        newGoal = '';
        showCreate = true;
    }

    function createTask() {
        // simple validation
        if (!newName.trim()) return;
        const t = taskStore.addTask({ name: newName.trim(), goal: newGoal.trim() });
        showCreate = false;
    }

$: if (showCreate) {
    // focus the name input when the modal opens
    tick().then(() => nameInput?.focus());
}

$: if (!showCreate) {
    // when the modal closes, return focus back to the create button for keyboard users
    tick().then(() => createButton?.focus());
}

    function startSessionFromCard(task: Task) {
        // set loading for the clicked task and start a session linked to it
        starting = { ...starting, [task.id]: true };
        try {
            const template = { id: 'direct', name: task.name, questions: [] };
            sessionStore.startSession(template, { id: task.id, name: task.name });
        } catch (err) {
            console.error('Failed to start session for task', err);
        } finally {
            starting = { ...starting, [task.id]: false };
        }
    }
</script>

<section class="tasks-landing">
    <header class="page-header tasks-header">
        <h1>Tasks</h1>
        <div class="tasks-intro">
            <p class="subtitle">Your tasks hold sessions — pick one to start tracking or view its sessions.</p>
        </div>
    </header>

    {#if loading}
        <p>Loading tasks…</p>
    {:else}
        <div class="layout">
            <!-- stacked layout: title/bubble already above, show list then details stacked vertically -->
            <div class="list">
                {#if tasks.length === 0}
                    <div class="empty card">No tasks yet — use the Tasks page to create one.</div>
                {:else}
                    <div class="grid">
                        {#each tasks as task}
                            <div class="grid-item">
                                <TaskCard {task} loading={starting[task.id]} on:start={(ev) => startSessionFromCard(ev.detail.task)} />
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if showCreate}
                    <Popup bind:isOpen={showCreate} title="Create new task" onClose={() => (showCreate = false)}>
                        <form id="task-create-dialog" on:submit|preventDefault={createTask} class="create-form" aria-labelledby="create-task-label">
                            <div class="field">
                                <label for="task-name" id="create-task-label">Name</label>
                                <input id="task-name" type="text" bind:value={newName} maxlength="80" placeholder="e.g. Study for biology exam" bind:this={nameInput} required />
                            </div>

                            <div class="field">
                                <label for="task-goal">Goal</label>
                                <input id="task-goal" type="text" bind:value={newGoal} maxlength="120" placeholder="Short goal or target (optional)" />
                            </div>


                            <div class="actions">
                            <button type="button" class="btn" on:click={() => (showCreate = false)}>Cancel</button>
                                <button type="submit" class="btn primary" disabled={!newName.trim()}>Create task</button>
                            </div>
                        </form>
                    </Popup>
                {/if}
            </div>

            <!-- Always-visible floating create button (bottom-centered) -->
            <div class="create-floating" aria-hidden="false">
                <button class="btn create" bind:this={createButton} on:click={openCreate} aria-haspopup="dialog" aria-controls="task-create-dialog">+ Create New Task</button>
            </div>

        </div>
    {/if}
</section>

<style>
    .tasks-landing { padding:1.25rem; }
    /* stack header elements and center the title */
    .tasks-header { margin-bottom:1rem; display:flex; flex-direction:column; gap:.5rem; align-items:center; justify-content:center; text-align:center; }

    /* Heading and subtitle styling for the Tasks landing */
    .page-header h1 {
        margin: 0 0 .25rem 0;
        color: var(--color-text-on-dark);
        font-size: 2rem;
        flex: none;
        text-align: center; /* center the main title */
    }

    /* header-actions removed (create button is now floating) */
    .btn {
        font-size: .95rem;
        padding: .5rem .75rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        cursor: pointer;
    }
    .btn.primary { background: var(--color-accent); color: white; border-color: transparent; }
    .btn.create { font-weight: 600; }

    /* popup form */
    .create-form { display:flex; flex-direction:column; gap: .75rem; }
    .create-form .field { display:flex; flex-direction:column; gap:.25rem; }
    .create-form label { font-weight:600; font-size: .9rem; color:var(--color-text-primary); }
    .create-form input { padding:.5rem; border-radius:6px; border:1px solid var(--color-border); background:var(--color-card-bg); color:var(--color-text-primary); }
    .create-form .actions { display:flex; justify-content:flex-end; gap:.5rem; margin-top: .5rem; }

    /* Floating create button always visible at bottom center of viewport */
    .create-floating { position: fixed; left: 50%; transform: translateX(-50%); bottom: 18px; z-index: 10001; display:flex; justify-content:center; align-items:center; }
    .create-floating .btn.create { padding: 1rem 1.75rem; font-size:1.05rem; box-shadow: 0 8px 26px rgba(12,12,12,0.28); border-radius: 9999px; border: none; background: var(--color-accent); color: white; font-weight: 700; letter-spacing:.5px; }
    .create-floating .btn.create:focus { outline: 3px solid color-mix(in srgb, var(--color-accent) 20%, transparent); box-shadow: 0 6px 30px rgba(12,12,12,0.25); }

    /* On small screens, adjust button up so it sits above the fixed mobile nav and uses safe-area insets */
    @media (max-width: 768px) {
        /* raise further so it never touches the nav — plenty of gap for large mobile navs */
        .create-floating { bottom: calc(env(safe-area-inset-bottom, 0px) + 96px); z-index: 12000; }
        .create-floating .btn.create { padding: 1.05rem 2rem; font-size:1.15rem; }
        /* give a stronger floating visual so it's obviously separate from nav */
        .create-floating .btn.create { box-shadow: 0 10px 28px rgba(10,10,10,0.25), 0 2px 10px rgba(10,10,10,0.12); }
        .create-floating .btn.create:hover { transform: translateY(-4px); }
        .create-floating .btn.create:active { transform: translateY(-1px); }
    }

    .tasks-intro {
        background: var(--color-card-bg);
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid var(--color-border);
        max-width: 60ch;
    }

    .tasks-intro .subtitle,
    .tasks-header .subtitle {
        margin-top: .25rem;
        color: var(--color-text-secondary);
        font-size: clamp(.9rem, 2vw, 1rem);
        max-width: 70ch;
        margin-bottom: 0.5rem;
    }
    /* stacked layout: modules appear one under the other on all widths */
    .layout { display:flex; flex-direction:column; gap:1rem; align-items:stretch; }
    .list { flex:1; }
    /* list-style: each task occupies its own full-width row */
    .grid { display:flex; flex-direction:column; gap:1rem; }

    @media (min-width: 1200px) {
        .layout { flex-direction:column; }
    }
</style>
