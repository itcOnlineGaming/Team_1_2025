<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { ActiveSession } from '$lib/stores/sessionStore';

    export let session: ActiveSession;
    export let onEnd: () => void;

    // Use the planned duration from the session (in seconds)
    const COUNTDOWN_DURATION = session.plannedDuration;
    let remainingSeconds = COUNTDOWN_DURATION;
    let interval: ReturnType<typeof setInterval> | undefined;

    $: minutes = Math.floor(remainingSeconds / 60);
    $: seconds = remainingSeconds % 60;
    $: formattedTime = `${pad(minutes)}:${pad(seconds)}`;

    function pad(num: number): string {
        return num.toString().padStart(2, '0');
    }

    onMount(() => {
        interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
            remainingSeconds = Math.max(0, COUNTDOWN_DURATION - elapsed);
            
            // Auto-end when countdown reaches zero
            if (remainingSeconds === 0) {
                if (interval) clearInterval(interval);
                onEnd();
            }
        }, 1000);
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<div class="session-timer-container">
    <div class="session-info">
        <h3>Active Session</h3>
        <p class="template-name">Work Session</p>
    </div>

    <div class="timer-wrapper">
        <span class="pulse pulse-1" aria-hidden="true"></span>

        <button class="timer-button" on:click={onEnd}>
            <div class="timer-content">
                <div class="time-display">{formattedTime}</div>
                <div class="end-text">Click to End</div>
            </div>
        </button>
    </div>

    <div class="session-details">
        <p class="detail-item">
            <span class="detail-icon">📅</span>
            Started: {new Date(session.startTime).toLocaleTimeString()}
        </p>
        <p class="detail-item">
            <span class="detail-icon">⏱️</span>
            Time remaining: {formattedTime}
        </p>
        <p class="detail-item">
            You'll answer the evaluation question when the timer ends
        </p>
    </div>
</div>

<style>
    .session-timer-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    .session-info h3 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-on-dark);
        font-size: 1.5rem;
    }

    .template-name {
        color: var(--color-text-on-dark);
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 2rem 0;
    }

    .timer-wrapper {
        position: relative;
        width: 300px;
        height: 300px;
        margin: 0 auto 2rem;
        overflow: hidden;
    }

    .timer-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 240px;
        height: 240px;
        border-radius: 50%;
        border: none;
        background: var(--color-card-bg);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 2;
    }

    .timer-button:hover {
        transform: translate(-50%, -50%) scale(1.05);
        box-shadow: 0 6px 30px rgba(123, 104, 166, 0.5);
        background: var(--color-bg-secondary);
    }

    .timer-button:active {
        transform: translate(-50%, -50%) scale(0.98);
    }

    .timer-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .time-display {
        font-size: 3rem;
        font-weight: 700;
        color: var(--color-accent);
        font-variant-numeric: tabular-nums;
        line-height: 1;
        margin-bottom: 0.5rem;
    }

    .end-text {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .session-details {
        margin-top: 2rem;
    }

    .detail-item {
        margin: 0.5rem 0;
        color: var(--color-text-on-dark);
        font-size: 0.95rem;
    }

    .detail-icon {
        margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
        .timer-wrapper {
            width: 250px;
            height: 250px;
        }

        .timer-button {
            width: 200px;
            height: 200px;
        }

        .pulse { 
            width: 200px; 
            height: 200px; 
        }

        .time-display {
            font-size: 2.5rem;
        }
    }

    .pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0.001);
        border: 12px solid var(--timer-ring-color, var(--color-accent));
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        will-change: transform, opacity;
    }

    .pulse-1 {
        animation: pulseSpread 1.5s cubic-bezier(1,1,1,1) infinite;
    }

    @keyframes pulseSpread {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.5; }
        50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.12; }
        100% { transform: translate(-50%, -50%) scale(2.6); opacity: 1; }
    }
</style>
