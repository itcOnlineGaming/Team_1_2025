<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { page } from '$app/stores';
    import { tutorialStore, tutorialSteps, type TutorialStep } from '$lib/stores/tutorialStore';
    import TutorialTooltip from './TutorialTooltip.svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    let currentStep = $state<TutorialStep | null>(null);
    let isActive = $state(false);
    let currentStepIndex = $state(0);
    let tooltipOpen = $state(false);
    let currentPage = $state('/');
    let targetElement: HTMLElement | null = null;
    let tooltipPosition = $state<{ top: number; left: number } | null>(null);

    // Subscribe to tutorial store
    onMount(() => {
        const unsubscribe = tutorialStore.subscribe((state) => {
            isActive = state.isActive;
            currentStepIndex = state.currentStepIndex;
            if (state.isActive && state.currentStepIndex < tutorialSteps.length) {
                currentStep = tutorialSteps[state.currentStepIndex];
            } else {
                currentStep = null;
            }
        });

        const unsubscribePage = page.subscribe((p) => {
            currentPage = p.url.pathname.replace(base, '') || '/';
        });

        return () => {
            unsubscribe();
            unsubscribePage();
        };
    });

    // Watch for changes in current step and page
    $effect(() => {
        if (currentStep && isActive) {
            handleStepChange();
        } else {
            tooltipOpen = false;
            targetElement = null;
        }
    });

    async function handleStepChange() {
        await tick();
        
        if (!currentStep) {
            tooltipOpen = false;
            return;
        }

        // Check if we're on the right page
        const stepPage = currentStep.page.replace(/\[id\]/g, '.*');
        const pageRegex = new RegExp(`^${stepPage}$`);
        const isOnCorrectPage = pageRegex.test(currentPage);

        if (!isOnCorrectPage) {
            // Navigate to the correct page if we're not there
            if (!currentStep.page.includes('[id]')) {
                await goto(`${base}${currentStep.page}`);
                await tick();
            }
        }

        // Wait a bit for the page to render
        await new Promise(resolve => setTimeout(resolve, 300));

        // Find the target element
        if (currentStep.elementId) {
            targetElement = document.getElementById(currentStep.elementId);
            if (targetElement) {
                // Calculate tooltip position relative to the element
                const rect = targetElement.getBoundingClientRect();
                tooltipPosition = {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX
                };

                // Scroll element into view
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight the element
                targetElement.classList.add('tutorial-highlight');
            } else {
                // Element not found, show tooltip at center of screen
                tooltipPosition = null;
            }
        } else {
            // No specific element, show at top center
            targetElement = null;
            tooltipPosition = null;
        }

        tooltipOpen = true;
    }

    function handleNext() {
        // Remove highlight from current element
        if (targetElement) {
            targetElement.classList.remove('tutorial-highlight');
        }

        // Move to next step without auto-clicking
        // Users can click the highlighted element themselves if they want
        tutorialStore.nextStep();
    }

    function handleSkip() {
        // Remove highlight from current element
        if (targetElement) {
            targetElement.classList.remove('tutorial-highlight');
        }
        
        tutorialStore.skipTutorial();
        tooltipOpen = false;
    }

    // Get wrapper style for positioning tooltip
    function getTooltipWrapperStyle() {
        if (!tooltipPosition || !targetElement) {
            return 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10001; pointer-events: auto;';
        }

        const rect = targetElement.getBoundingClientRect();
        const position = currentStep?.position || 'bottom';
        
        let style = 'position: absolute; z-index: 10001; pointer-events: auto;';
        
        switch (position) {
            case 'bottom':
                style += `top: ${tooltipPosition.top + rect.height}px; left: ${tooltipPosition.left + rect.width / 2}px;`;
                break;
            case 'top':
                style += `top: ${tooltipPosition.top}px; left: ${tooltipPosition.left + rect.width / 2}px;`;
                break;
            case 'left':
                style += `top: ${tooltipPosition.top + rect.height / 2}px; left: ${tooltipPosition.left}px;`;
                break;
            case 'right':
                style += `top: ${tooltipPosition.top + rect.height / 2}px; left: ${tooltipPosition.left + rect.width}px;`;
                break;
        }
        
        return style;
    }
</script>

{#if isActive && currentStep && tooltipOpen}
    <!-- Backdrop overlay -->
    <div class="tutorial-backdrop"></div>
    
    <!-- Tooltip positioned wrapper -->
    <div style={getTooltipWrapperStyle()}>
        <TutorialTooltip
            bind:isOpen={tooltipOpen}
            title={currentStep.title}
            description={currentStep.description}
            position={currentStep.position || 'bottom'}
            onNext={handleNext}
            onSkip={handleSkip}
            showSkip={true}
            step={currentStepIndex + 1}
            totalSteps={tutorialSteps.length}
        />
    </div>
{/if}

<style>
    .tutorial-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        backdrop-filter: blur(2px);
        pointer-events: none; /* Allow clicks through except on highlighted elements */
    }

    :global(.tutorial-highlight) {
        position: relative;
        z-index: 10002 !important;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.4) !important;
        border-radius: 8px;
        animation: pulse 2s infinite;
        pointer-events: auto !important; /* Re-enable clicks on highlighted elements */
    }

    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.4);
        }
        50% {
            box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.6);
        }
    }
</style>
