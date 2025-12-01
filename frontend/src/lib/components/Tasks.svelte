<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { taskStore, type Task } from '$lib/stores/taskStore';
    import { sessionStore } from '$lib/stores/sessionStore';
    import TaskCard from './TaskCard.svelte';
    import Popup from './Popup.svelte';
    import TemplateSelectorModal from './TemplateSelectorModal.svelte';
    import type { Session } from '$lib/stores/sessionStore';
    import { evaluationTemplates } from '$lib/data/evaluationTemplates';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    // page state
    let tasks: Task[] = [];
    let loading = true;
    let showCreate = false;
    let showTemplateSelector = false;
    let selectedTask: Task | null = null;
    let newName = '';
    let newGoal = '';
    let nameInput: HTMLInputElement | null = null;
    let createButton: HTMLButtonElement | null = null;
    let starting: Record<string, boolean> = {};
    let draggedItemId: string | null = null;
    let draggedOverItemId: string | null = null;
    let collapsedActiveTasks = false;
    let collapsedCompletedTasks = false;

    // sessions derived lazily
    let allSessions: Session[] = [];

    const unsubscribeTasks = taskStore.subscribe((t) => (tasks = t));
    const unsubscribeSessions = sessionStore.sessions.subscribe((s) => (allSessions = s));

    $: activeTasks = tasks.filter(t => !t.completedAt);
    $: completedTasks = tasks.filter(t => t.completedAt);

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
        // Show template selector instead of starting directly
        selectedTask = task;
        showTemplateSelector = true;
    }

    function handleTemplateSelect(template: any, duration: number) {
        if (!selectedTask) return;
        
        showTemplateSelector = false;
        starting = { ...starting, [selectedTask.id]: true };
        
        try {
            sessionStore.startSession(
                { id: template.id, name: template.name, questions: [] },
                duration,
                { id: selectedTask.id, name: selectedTask.name }
            );
            // Navigate to home page where the active session timer will be displayed
            goto(`${base}/`);
        } catch (err) {
            console.error('Failed to start session for task', err);
        } finally {
            starting = { ...starting, [selectedTask.id]: false };
            selectedTask = null;
        }
    }

    function cancelTemplateSelection() {
        showTemplateSelector = false;
        selectedTask = null;
    }

    function deleteTask(task: Task) {
        if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
            taskStore.removeTask(task.id);
            sessionStore.deleteSessionsByTaskId(task.id);
        }
    }

    function handleDragStart(e: DragEvent, taskId: string) {
        draggedItemId = taskId;
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', '');
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
    }

    function handleDragEnter(e: DragEvent, taskId: string) {
        e.preventDefault();
        if (draggedItemId !== taskId) {
            draggedOverItemId = taskId;
        }
    }

    function handleDragLeave(e: DragEvent) {
        if (e.currentTarget === e.target) {
            draggedOverItemId = null;
        }
    }

    function handleDrop(e: DragEvent, targetTaskId: string) {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedItemId && draggedItemId !== targetTaskId) {
            const draggedIndex = tasks.findIndex(t => t.id === draggedItemId);
            const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const newTasks = [...tasks];
                const [draggedTask] = newTasks.splice(draggedIndex, 1);
                newTasks.splice(targetIndex, 0, draggedTask);
                taskStore.reorderTasks(newTasks);
            }
        }
        
        draggedItemId = null;
        draggedOverItemId = null;
    }

    function handleDragEnd() {
        draggedItemId = null;
        draggedOverItemId = null;
    }
</script>

<section class="tasks-landing">
    {#if loading}
        <p>Loading tasks…</p>
    {:else}
        <div class="layout">
            <!-- stacked layout: title/bubble already above, show list then details stacked vertically -->
            <div class="list">
                {#if tasks.length === 0}
                    <div class="empty card">No tasks yet — use the Tasks page to create one.</div>
                {:else}
                    <!-- Active Tasks Section -->
                    {#if activeTasks.length > 0}
                        <div class="tasks-section">
                            <button 
                                class="section-header"
                                onclick={() => collapsedActiveTasks = !collapsedActiveTasks}
                                aria-expanded={!collapsedActiveTasks}
                            >
                                <span class="chevron" class:collapsed={collapsedActiveTasks}>▼</span>
                                <h2>In Progress ({activeTasks.length})</h2>
                            </button>
                            {#if !collapsedActiveTasks}
                                <div class="grid">
                                    {#each activeTasks as task (task.id)}
                                        <!-- svelte-ignore a11y_no_static_element_interactions a11y_interactive_supports_focus -->
                                        <div 
                                            class="grid-item"
                                            draggable="true"
                                            ondragstart={(e) => handleDragStart(e, task.id)}
                                            ondragover={handleDragOver}
                                            ondragenter={(e) => handleDragEnter(e, task.id)}
                                            ondragleave={handleDragLeave}
                                            ondrop={(e) => handleDrop(e, task.id)}
                                            ondragend={handleDragEnd}
                                            class:dragging={draggedItemId === task.id}
                                            class:dragover={draggedOverItemId === task.id}
                                        >
                                            <TaskCard {task} loading={starting[task.id]} on:start={(ev) => startSessionFromCard(ev.detail.task)} on:delete={(ev) => deleteTask(ev.detail.task)} />
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <!-- Completed Tasks Section -->
                    {#if completedTasks.length > 0}
                        <div class="tasks-section">
                            <button 
                                class="section-header"
                                onclick={() => collapsedCompletedTasks = !collapsedCompletedTasks}
                                aria-expanded={!collapsedCompletedTasks}
                            >
                                <span class="chevron" class:collapsed={collapsedCompletedTasks}>▼</span>
                                <h2>Completed ({completedTasks.length})</h2>
                            </button>
                            {#if !collapsedCompletedTasks}
                                <div class="grid">
                                    {#each completedTasks as task (task.id)}
                                        <!-- svelte-ignore a11y_no_static_element_interactions a11y_interactive_supports_focus -->
                                        <div 
                                            class="grid-item"
                                            draggable="true"
                                            ondragstart={(e) => handleDragStart(e, task.id)}
                                            ondragover={handleDragOver}
                                            ondragenter={(e) => handleDragEnter(e, task.id)}
                                            ondragleave={handleDragLeave}
                                            ondrop={(e) => handleDrop(e, task.id)}
                                            ondragend={handleDragEnd}
                                            class:dragging={draggedItemId === task.id}
                                            class:dragover={draggedOverItemId === task.id}
                                        >
                                            <TaskCard {task} loading={starting[task.id]} on:start={(ev) => startSessionFromCard(ev.detail.task)} on:delete={(ev) => deleteTask(ev.detail.task)} />
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/if}

                {#if showCreate}
                    <Popup bind:isOpen={showCreate} title="Create new task" onClose={() => (showCreate = false)}>
                        <form id="task-create-dialog" onsubmit={(e) => { e.preventDefault(); createTask(); }} class="create-form" aria-labelledby="create-task-label">
                            <div class="field">
                                <label for="task-name" id="create-task-label">Name</label>
                                <input id="task-name" type="text" bind:value={newName} maxlength="80" placeholder="e.g. Study for biology exam" bind:this={nameInput} required />
                            </div>

                            <div class="field">
                                <label for="task-goal">Goal</label>
                                <input id="task-goal" type="text" bind:value={newGoal} maxlength="120" placeholder="Short goal or target (optional)" />
                            </div>


                            <div class="actions">
                            <button type="button" class="btn" onclick={() => (showCreate = false)}>Cancel</button>
                                <button type="submit" class="btn primary" disabled={!newName.trim()}>Create task</button>
                            </div>
                        </form>
                    </Popup>
                {/if}

                <TemplateSelectorModal 
                    bind:isOpen={showTemplateSelector}
                    templates={evaluationTemplates}
                    onSelect={handleTemplateSelect}
                    onCancel={cancelTemplateSelection}
                />
            </div>

            <!-- Always-visible floating create button (bottom-centered) -->
            <div class="create-floating" aria-hidden="false">
                <button id="create-task-btn" class="btn create" bind:this={createButton} onclick={openCreate} aria-haspopup="dialog" aria-controls="task-create-dialog">+ Create New Task</button>
            </div>

        </div>
    {/if}
</section>

<style>
    .tasks-landing { padding:1.25rem; }
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

    .layout { display:flex; flex-direction:column; gap:1rem; align-items:stretch; }
    .list { flex:1; }
    /* list-style: each task occupies its own full-width row */
    .grid { 
        display:flex; 
        flex-direction:column; 
        gap:0;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
        background: var(--color-card-bg);
    }

    .tasks-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .tasks-section:last-of-type {
        margin-bottom: 0;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-accent);
        transition: all 0.2s ease;
        width: 100%;
        text-align: left;
    }

    .section-header:hover {
        background: var(--color-bg-secondary);
        border-color: var(--color-accent);
    }

    .section-header h2 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--color-accent);
    }

    .chevron {
        display: inline-flex;
        font-size: 0.9rem;
        transition: transform 0.2s ease;
    }

    .chevron.collapsed {
        transform: rotate(-90deg);
    }

    .grid-item {
        transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
        border-bottom: 1px solid var(--color-border);
    }

    .grid-item:last-child {
        border-bottom: none;
    }

    .grid-item:hover {
        background-color: var(--color-bg-secondary);
    }

    .grid-item.dragging {
        opacity: 0.5;
        transform: scale(0.98);
    }

    .grid-item.dragover {
        border-top: 3px solid var(--color-accent);
        padding-top: calc(1rem - 3px);
    }

    @media (min-width: 1200px) {
        .layout { flex-direction:column; }
    }
</style>
