<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { ActiveSession } from '$lib/stores/sessionStore';

    export let session: ActiveSession;
    export let onEnd: () => void;

    let elapsedSeconds = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    $: hours = Math.floor(elapsedSeconds / 3600);
    $: minutes = Math.floor((elapsedSeconds % 3600) / 60);
    $: seconds = elapsedSeconds % 60;
    $: formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    $: progress = (seconds / 60) * 100;

    function pad(num: number): string {
        return num.toString().padStart(2, '0');
    }

    onMount(() => {
        interval = setInterval(() => {
            elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
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
        <svg class="timer-svg" viewBox="0 0 200 200">
            <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--color-bg-secondary)"
                stroke-width="12"
            />
            
            <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="565.48"
                stroke-dashoffset={565.48 - (565.48 * progress) / 100}
                transform="rotate(-90 100 100)"
                class="progress-ring"
            />
        </svg>
        
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
            You'll add your own questions at the end of this session
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
    }

    .timer-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

     .progress-ring {
        transition: stroke-dashoffset 1s linear;
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

        .time-display {
            font-size: 2.5rem;
        }
    }
</style>
