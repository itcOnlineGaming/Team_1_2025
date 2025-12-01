<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    let { 
        isOpen = $bindable(false),
        title,
        description,
        position = 'bottom',
        onNext,
        onSkip,
        showSkip = true,
        step,
        totalSteps,
        highlightElement = true
    }: {
        isOpen?: boolean;
        title: string;
        description: string;
        position?: 'top' | 'bottom' | 'left' | 'right';
        onNext?: () => void;
        onSkip?: () => void;
        showSkip?: boolean;
        step?: number;
        totalSteps?: number;
        highlightElement?: boolean;
    } = $props();

    function handleNext() {
        if (onNext) {
            onNext();
        }
    }

    function handleSkip() {
        isOpen = false;
        if (onSkip) {
            onSkip();
        }
    }

    let positionClass = $derived(`tooltip-${position}`);
</script>

{#if isOpen}
    <div 
        class="tutorial-tooltip {positionClass}"
        transition:fly={{ y: position === 'top' ? 20 : -20, duration: 300 }}
        role="dialog"
        aria-labelledby="tooltip-title"
        aria-describedby="tooltip-description"
    >
        <div class="tooltip-content">
            <div class="tooltip-header">
                <h4 id="tooltip-title">{title}</h4>
                {#if step && totalSteps}
                    <span class="step-indicator">{step}/{totalSteps}</span>
                {/if}
            </div>
            <p id="tooltip-description">{description}</p>
            <div class="tooltip-actions">
                {#if showSkip}
                    <button class="btn-skip" onclick={handleSkip}>Skip Tutorial</button>
                {/if}
                {#if onNext}
                    <button class="btn-next" onclick={handleNext}>
                        {step && totalSteps && step < totalSteps ? 'Next →' : 'Got it!'}
                    </button>
                {/if}
            </div>
        </div>
        <div class="tooltip-arrow"></div>
    </div>
{/if}

<style>
    .tutorial-tooltip {
        position: absolute;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 1.5rem;
        max-width: 320px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        color: white;
    }

    .tooltip-top {
        bottom: calc(100% + 15px);
        left: 50%;
        transform: translateX(-50%);
    }

    .tooltip-bottom {
        top: calc(100% + 15px);
        left: 50%;
        transform: translateX(-50%);
    }

    .tooltip-left {
        right: calc(100% + 15px);
        top: 50%;
        transform: translateY(-50%);
    }

    .tooltip-right {
        left: calc(100% + 15px);
        top: 50%;
        transform: translateY(-50%);
    }

    .tooltip-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
    }

    .tooltip-top .tooltip-arrow {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0 10px;
        border-color: #764ba2 transparent transparent transparent;
    }

    .tooltip-bottom .tooltip-arrow {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 10px 10px 10px;
        border-color: transparent transparent #667eea transparent;
    }

    .tooltip-left .tooltip-arrow {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: 10px 0 10px 10px;
        border-color: transparent transparent transparent #764ba2;
    }

    .tooltip-right .tooltip-arrow {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: 10px 10px 10px 0;
        border-color: transparent #667eea transparent transparent;
    }

    .tooltip-content {
        position: relative;
    }

    .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .tooltip-header h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .step-indicator {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .tooltip-content p {
        margin: 0 0 1rem 0;
        line-height: 1.5;
        font-size: 0.95rem;
        opacity: 0.95;
    }

    .tooltip-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }

    .btn-skip,
    .btn-next {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    }

    .btn-skip {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }

    .btn-skip:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .btn-next {
        background: white;
        color: #667eea;
    }

    .btn-next:hover {
        background: #f0f0f0;
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        .tutorial-tooltip {
            max-width: 280px;
            padding: 1rem;
        }

        .tooltip-header h4 {
            font-size: 1rem;
        }

        .tooltip-content p {
            font-size: 0.9rem;
        }
    }
</style>
