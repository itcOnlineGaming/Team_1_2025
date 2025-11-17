<script lang="ts">
    import EvaluationQuestionnaire, {
        type Question
    } from '$lib/components/EvaluationQuestionnaire.svelte';
    import Popup from '$lib/components/Popup.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { ActiveSession } from '$lib/stores/sessionStore';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { base } from '$app/paths';

    let activeSession = $state<ActiveSession | null>(null);
    let isSubmitting = $state(false);
    let loadAttempts = 0;
    let showPostTestQuestionnaire = $state(false);
    let postTestPage = $state(1);
    let postTestResponses = $state({
        overallExperience: 0,
        easeOfUse: 0,
        helpfulness: 0,
        likelyToUse: 0,
        frustrationLevel: 0,
        designRating: 0,
        wouldRecommend: 0,
        feedback: '',
        improvements: '',
        favoriteFeature: '',
        leastFavorite: ''
    });

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

        // Show post-test questionnaire instead of going to graphs
        isSubmitting = false;
        showPostTestQuestionnaire = true;
    };

    function handlePostTestSubmit() {
        // Save post-test responses (you can add this to sessionStore or localStorage)
        console.log('Post-test responses:', postTestResponses);
        localStorage.setItem('postTestResponses', JSON.stringify(postTestResponses));
        
        // Navigate with graphs parameter
        goto(`${base}/?showGraphs=true`);
    }

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

<!-- Post-Test Questionnaire Popup -->
<Popup bind:isOpen={showPostTestQuestionnaire} title="User Study Feedback" showCloseButton={false}>
    <div class="popup-inner">
        {#if postTestPage === 1}
            <h2>Thank You for Completing the Session!</h2>
            
            <p>Your feedback is invaluable to our research. Please take a moment to answer a few questions about your experience with the productivity tracker.</p>
            
            <div class="question-section">
                <div class="question-label">
                    How would you rate your overall experience?
                    <span class="rating-value">{postTestResponses.overallExperience}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.overallExperience}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                </div>
            </div>

            <div class="question-section">
                <div class="question-label">
                    How easy was it to use the application?
                    <span class="rating-value">{postTestResponses.easeOfUse}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.easeOfUse}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Very Difficult</span>
                    <span>Very Easy</span>
                </div>
            </div>

            <div class="question-section">
                <div class="question-label">
                    How helpful was the session tracking feature?
                    <span class="rating-value">{postTestResponses.helpfulness}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.helpfulness}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Not Helpful</span>
                    <span>Very Helpful</span>
                </div>
            </div>

            <div class="pagination-info">Page 1 of 3</div>
            
            <button class="btn-primary btn-full btn-large" onclick={() => postTestPage = 2}>
                Next →
            </button>

        {:else if postTestPage === 2}
            <h2>Your Thoughts</h2>

            <div class="question-section">
                <div class="question-label">
                    How likely are you to use this for your own productivity tracking?
                    <span class="rating-value">{postTestResponses.likelyToUse}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.likelyToUse}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Not Likely</span>
                    <span>Very Likely</span>
                </div>
            </div>

            <div class="question-section">
                <div class="question-label">
                    How frustrating was the experience?
                    <span class="rating-value">{postTestResponses.frustrationLevel}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.frustrationLevel}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Not Frustrating</span>
                    <span>Very Frustrating</span>
                </div>
            </div>

            <div class="question-section">
                <div class="question-label">
                    How would you rate the design and user interface?
                    <span class="rating-value">{postTestResponses.designRating}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.designRating}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                </div>
            </div>

            <div class="question-section">
                <div class="question-label">
                    Would you recommend this to a friend?
                    <span class="rating-value">{postTestResponses.wouldRecommend}/5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    bind:value={postTestResponses.wouldRecommend}
                    class="slider"
                />
                <div class="slider-labels">
                    <span>No</span>
                    <span>Definitely</span>
                </div>
            </div>

            <div class="pagination-info">Page 2 of 3</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => postTestPage = 1}>
                    ← Back
                </button>
                <button class="btn-primary" onclick={() => postTestPage = 3}>
                    Next →
                </button>
            </div>

        {:else if postTestPage === 3}
            <h2>Final Thoughts</h2>

            <div class="question-section">
                <div class="question-label">
                    What was your favorite feature?
                </div>
                <textarea
                    bind:value={postTestResponses.favoriteFeature}
                    class="input-field"
                    placeholder="e.g., The timer, the graphs, the questionnaire..."
                    rows="3"
                ></textarea>
            </div>

            <div class="question-section">
                <div class="question-label">
                    What did you like least or find most confusing?
                </div>
                <textarea
                    bind:value={postTestResponses.leastFavorite}
                    class="input-field"
                    placeholder="Share anything that was unclear or frustrating..."
                    rows="3"
                ></textarea>
            </div>

            <div class="question-section">
                <div class="question-label">
                    Any suggestions for improvements?
                </div>
                <textarea
                    bind:value={postTestResponses.improvements}
                    class="input-field"
                    placeholder="How can we make this better?"
                    rows="3"
                ></textarea>
            </div>

            <div class="question-section">
                <div class="question-label">
                    Additional comments or feedback
                </div>
                <textarea
                    bind:value={postTestResponses.feedback}
                    class="input-field"
                    placeholder="Anything else you'd like to share..."
                    rows="4"
                ></textarea>
            </div>

            <div class="pagination-info">Page 3 of 3</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => postTestPage = 2}>
                    ← Back
                </button>
                <button class="btn-primary btn-large" onclick={handlePostTestSubmit}>
                    🎉 Complete Study
                </button>
            </div>
        {/if}
    </div>
</Popup>

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

    /* Post-test questionnaire styles */
    .popup-inner {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .popup-inner h2 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
    }

    .popup-inner p {
        margin: 0 0 1.5rem 0;
        line-height: 1.6;
        color: var(--color-text-primary);
    }

    .question-section {
        margin-bottom: 1.5rem;
    }

    .question-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
    }

    .rating-value {
        background: var(--color-accent);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 700;
    }

    .slider {
        width: 100%;
        height: 8px;
        border-radius: 5px;
        background: linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #84cc16 75%, #22c55e 100%);
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        border: 3px solid var(--color-accent);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        border: 3px solid var(--color-accent);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .slider::-moz-range-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .input-field {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
        resize: vertical;
    }

    .input-field:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(123, 104, 166, 0.1);
    }

    .pagination-info {
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        margin: 1.5rem 0 1rem;
        font-weight: 500;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .button-group button {
        flex: 1;
    }

    .btn-large {
        padding: 1rem 1.5rem;
        font-size: 1.05rem;
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
