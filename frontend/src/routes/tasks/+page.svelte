<script lang="ts">
    import Tasks from '$lib/components/Tasks.svelte';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    function goBack() {
        goto(`${base}/`);
    }
</script>

<div class="tasks-page">
    <div class="page-header">
        <button class="btn-back" onclick={goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </button>
        <h1>My Tasks</h1>
    </div>

    <div class="tasks-intro">
        <p>Organize your learning goals into tasks. Each task tracks multiple sessions and collects feedback. Create a new task, start sessions to complete questionnaires, view session results, and mark tasks as complete when you're done.</p>
    </div>

    <Tasks />
</div>

<MobileBottomNav />

<style>
    .tasks-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        padding-bottom: 6rem;
    }

    .page-header {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
        position: relative;
    }

    .page-header h1 {
        margin: 0;
        color: var(--color-text-on-dark);
        font-size: 2rem;
        text-align: center;
    }

    .btn-back {
        position: absolute;
        left: 0;
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

    .tasks-intro {
        background: var(--color-card-bg);
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid var(--color-border);
        margin-bottom: 2rem;
        text-align: center;
    }

    .tasks-intro p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .tasks-page {
            padding: 1rem;
            padding-bottom: 100px;
        }

        .page-header {
            justify-content: center;
        }

        .btn-back {
            display: none;
        }

        .page-header h1 {
            text-align: center;
        }
    }
</style>
