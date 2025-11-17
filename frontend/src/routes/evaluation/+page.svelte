<script lang="ts">
    import EvaluationQuestionnaire, {
        type Question
    } from '$lib/components/EvaluationQuestionnaire.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { ActiveSession } from '$lib/stores/sessionStore';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { base } from '$app/paths';

    let activeSession = $state<ActiveSession | null>(null);
    let isSubmitting = $state(false);
    let loadAttempts = 0;

    onMount(() => {
        const loadSession = () => {
            const unsubscribe = sessionStore.activeSession.subscribe((session) => {
                console.log('Active session loaded:', session);
                activeSession = session;
            });

            setTimeout(() => {
                if (!activeSession && loadAttempts < 3) {
                    loadAttempts++;
                    console.log('Retrying to load session, attempt:', loadAttempts);
                    loadSession();
                } else if (!activeSession) {
                    console.error('No active session found after retries');
                    alert('No active session found. Please start a session first.');
                    goto(`${base}/`);
                }
            }, 100);

            return unsubscribe;
        };

        return loadSession();
    });

    const onSubmit = async (responses: Record<string, any>) => {
        if (isSubmitting) return;
        if (!activeSession) {
            alert('Session was lost. Please try again.');
            goto(`${base}/`);
            return;
        }
        
        isSubmitting = true;
        console.log('Questionnaire responses:', responses);
        console.log('Current active session:', activeSession);

        // End the session
        sessionStore.endSession(responses);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate with graphs parameter
        goto(`${base}/?showGraphs=true`);
    };

    function goBack() {
        if (confirm('Are you sure you want to cancel this evaluation? Your session will be lost.')) {
            sessionStore.cancelSession();
            goto(`${base}/`);
        }
    }
</script>

{#if activeSession}
    <div class="page-container">
        <button class="btn-back" onclick={goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Cancel
        </button>
        <div class="page-header">
            <div class="session-badge">
                <span class="badge-icon">⏱️</span>
                Active Session
            </div>
            <h1>{activeSession.templateName}</h1>
            <p class="session-info">
                Started at {new Date(activeSession.startTime).toLocaleTimeString()}
            </p>
        </div>

        <EvaluationQuestionnaire 
            template={activeSession.questions} 
            handleSubmit={onSubmit}
        />

        {#if isSubmitting}
            <div class="submitting-overlay">
                <div class="submitting-content">
                    <div class="spinner"></div>
                    <p>Submitting your responses...</p>
                </div>
            </div>
        {/if}
    </div>
{:else}
    <div class="loading">
        <div class="spinner"></div>
        <p>Loading session...</p>
    </div>
{/if}

<MobileBottomNav />

<style>
    .page-container {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding-bottom: 2rem;
        position: relative;
    }

    .btn-back {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
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
        z-index: 10;
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    .btn-back:hover {
        background: var(--color-danger);
        color: white;
        border-color: var(--color-danger);
        transform: translateX(-2px);
    }

    .page-header {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem 1rem;
        text-align: center;
    }

    .session-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--color-accent);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .badge-icon {
        font-size: 1.1rem;
    }

    .page-header h1 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 2rem;
    }

    .session-info {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        margin: 0;
    }

    .loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        gap: 1rem;
    }

    .loading p {
        font-size: 1.1rem;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .submitting-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    }

    .submitting-content {
        background: var(--color-bg-primary);
        padding: 2rem 3rem;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .submitting-content p {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
        font-weight: 500;
    }

    .spinner {
        border: 3px solid var(--color-bg-secondary);
        border-top: 3px solid var(--color-accent);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .page-container {
            padding-bottom: 6rem; /* Add padding for bottom nav */
        }

        .btn-back {
            position: static;
            width: calc(100% - 2rem);
            margin: 1rem;
            justify-content: center;
        }

        .page-header {
            padding-top: 1rem;
        }

        .page-header h1 {
            font-size: 1.5rem;
        }

        .submitting-content {
            padding: 1.5rem 2rem;
            margin: 1rem;
        }
    }
</style>
