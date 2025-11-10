<script lang="ts">
    import Popup from '$lib/components/Popup.svelte';
    import TemplateSelector from '$lib/components/TemplateSelector.svelte';
    import SessionTimer from '$lib/components/SessionTimer.svelte';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import templatesData from '$lib/data/templates.json';
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';


    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }


    const templates: Template[] = templatesData.templates;

    let welcomePage = $state(1);
    let showWelcomePopup = $state(false);  // Changed to false so it doesn't show on initial load
    let showTemplateSelector = $state(false);
    let showGraphs = $state(false);
    let showEndTestPrompt = $state(false);
    let selectedTemplateData: Template | null = $state(null);
    let activeSession = $state<any>(null);


    onMount(() => {
        // Subscribe to active session changes
        const unsubscribe = sessionStore.activeSession.subscribe((session) => {
            activeSession = session;
        });


        // Check URL params for showGraphs
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('showGraphs') === 'true') {
            showWelcomePopup = false;
            showGraphs = true;
            window.history.replaceState({}, '', '/');
        }


        return unsubscribe;
    });


    function handleStartSession() {
        showWelcomePopup = false;
        showTemplateSelector = true;
    }

    function openWelcomePopup() {
        showWelcomePopup = true;
    }


    function handleTemplateSelect(template: Template) {
        selectedTemplateData = template;
        sessionStore.startSession(template);
        showTemplateSelector = false;
    }


    function handleEndSession() {
        goto('/evaluation');
    }


    function handleGraphsClose() {
        showGraphs = false;
        showEndTestPrompt = true;
    }


    function handleStartAnother() {
        showEndTestPrompt = false;
        showTemplateSelector = true;
    }


    function handleFinish() {
        showEndTestPrompt = false;
        showWelcomePopup = false;
        goto('/results');
    }

    function goToViewTemplates() {
        goto('/templates/view');
    }
</script>


<main>
    <div class="nav-buttons">
        <button class="btn-info btn-sm" onclick={goToViewTemplates}>View Templates</button>
        <button class="btn-info btn-sm" onclick={() => goto('/results')}>📊 Results</button>
    </div>
    
    <div class="hero-content">
        {#if activeSession}
            <SessionTimer 
                session={activeSession} 
                onEnd={handleEndSession}
            />
        {:else if !showTemplateSelector && !showGraphs && !showEndTestPrompt}
            <h1>Session Tracker</h1>
            <p class="subtitle">Track your work sessions and provide feedback</p>
            <button class="btn-primary btn-large start-session-btn" onclick={openWelcomePopup}>
                🎯 Start New Session
            </button>
        {/if}
    </div>
</main>


<!-- Welcome Popup -->
<Popup bind:isOpen={showWelcomePopup} title="Welcome to Session Tracker" showCloseButton={false}>
    <div class="popup-inner">
        {#if welcomePage === 1}
            <h2>Welcome, Test Participant!</h2>
            
            <p><strong>Thank you for participating in our user study!</strong></p>
            
            <p>You are an essential part of our final-year research project. We are university students conducting user testing to evaluate the effectiveness of productivity tracking tools in real-world learning scenarios. Your feedback will directly contribute to our academic research and help us improve the application.</p>
            
            <div class="pagination-info">Page 1 of 4</div>
            
            <button class="btn-primary btn-full btn-large" onclick={() => welcomePage = 2}>
                Next →
            </button>
        {:else if welcomePage === 2}
            <h2><strong>Your Testing Scenario</strong></h2>
            
            <p>For this session, imagine you are <strong>studying for your driver's theory test</strong>. You have an exam coming up soon and need to track your study sessions to ensure you're putting in enough focused time.</p>
            
            <p>You want to monitor how long you spend studying, track your progress across multiple sessions, and reflect on what worked well and what didn't after each study block.</p>
            
            <p>This productivity tracker will help you log your study sessions, time how long you work, and provide structured feedback after each session to help you identify patterns and improve your study habits.</p>
            
            <h3><strong>Purpose</strong></h3>
            <p>Track your work sessions and provide valuable feedback that helps both you and our research team understand how students use productivity tools during important study periods.</p>
            
            <div class="pagination-info">Page 2 of 4</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => welcomePage = 1}>
                    ← Back
                </button>
                <button class="btn-primary" onclick={() => welcomePage = 3}>
                    Next →
                </button>
            </div>
        {:else if welcomePage === 3}
            <h2><strong>How It Works</strong></h2>
            
            <ol class="instructions-list">
                <li><strong>Start a new session</strong> and select a template (in this case, you might create or select a "Driver's Test Study" template)</li>
                <li><strong>Study for your driver's test</strong> - the timer will track your session in the background while you focus on learning road signs, rules, and regulations</li>
                <li><strong>Come back and end the session</strong> when you finish your study block or need to take a break</li>
                <li><strong>Complete a brief evaluation questionnaire</strong> - this is crucial for our research! Tell us about your focus level, distractions you faced, what topics you covered, and how productive you felt</li>
                <li><strong>View your session analytics</strong> to see your study patterns over time and track your progress toward your test date</li>
            </ol>
            
            <h3><strong>Time Required</strong></h3>
            <p><strong>1-2 minutes</strong> for the evaluation questionnaire after each session. Your actual study session can be as long or short as you need - we recommend 25-45 minutes for a focused study block.</p>
            
            <div class="pagination-info">Page 3 of 4</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => welcomePage = 2}>
                    ← Back
                </button>
                <button class="btn-primary" onclick={() => welcomePage = 4}>
                    Next →
                </button>
            </div>
        {:else if welcomePage === 4}
            <h2><strong>What We're Testing</strong></h2>
            
            <p>We want to understand:</p>
            <ul>
                <li>How intuitive the session tracking interface is for first-time users</li>
                <li>Whether the questionnaire provides meaningful self-reflection opportunities</li>
                <li>If the analytics help you understand your productivity patterns</li>
                <li>Any pain points or confusing elements you encounter</li>
            </ul>
            
            <h3><strong>Your Data</strong></h3>
            <p>All data collected during this test will be anonymized and used solely for academic research purposes as part of our college project. Your participation is voluntary, and you can stop at any time.</p>
            
            <p class="help-text">Questions or technical issues? Please let the research team know immediately.</p>
            
            <div class="pagination-info">Page 4 of 4</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => welcomePage = 3}>
                    ← Back
                </button>
                <button class="btn-primary btn-large" onclick={handleStartSession}>
                    🎯 Start Your First Study Session
                </button>
            </div>
        {/if}
    </div>
</Popup>


<!-- Template Selection Popup -->
{#if showTemplateSelector}
    <div class="modal-overlay" role="dialog" tabindex="-1" onclick={() => showTemplateSelector = false} onkeydown={(e) => e.key === 'Escape' && (showTemplateSelector = false)}>
        <div class="modal-content card" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>Select a Template</h2>
                <button class="btn-close" onclick={() => showTemplateSelector = false}>✕</button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Choose a template for your session evaluation:</p>
                <TemplateSelector 
                    {templates}
                    selectedId={selectedTemplateData?.id || ''}
                    onSelect={handleTemplateSelect}
                />
            </div>
        </div>
    </div>
{/if}


<!-- Analytics Popup -->
{#if showGraphs}
    <div class="modal-overlay" role="dialog" tabindex="-1" onclick={handleGraphsClose} onkeydown={(e) => e.key === 'Escape' && handleGraphsClose()}>
        <div class="modal-content card graphs-modal" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>📊 Session Analytics</h2>
                <button class="btn-close" onclick={handleGraphsClose}>✕</button>
            </div>
            <div class="modal-body">
                <SessionGraphs showTable={true} />
                <div class="graphs-footer">
                    <button class="btn-primary btn-full" onclick={handleGraphsClose}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}


<!-- End of Test Popup -->
<Popup bind:isOpen={showEndTestPrompt} title="Session Complete! 🎉" showCloseButton={false}>
    <div class="popup-inner">
        <p><strong>Thank you for completing your session!</strong></p>
        
        <p>Your feedback has been recorded and will help us improve the experience.</p>


        <div class="summary-box">
            <h3>What would you like to do next?</h3>
        </div>


        <div class="action-buttons">
            <button class="btn-secondary btn-full" onclick={handleStartAnother}>
                🔄 Start Another Session
            </button>
            <button class="btn-primary btn-full" onclick={handleFinish}>
                ✓ Finish & View Results
            </button>
        </div>
    </div>
</Popup>


<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
    }

    .hero-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 100%;
        max-width: 1200px;
    }

    .hero-content h1 {
        font-size: 3rem;
        margin: 0;
        color: var(--color-text-primary);
        text-align: center;
    }

    .subtitle {
        font-size: 1.2rem;
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0;
    }

    .nav-buttons {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
    }

    .start-session-btn {
        margin-top: 1rem;
        padding: 1.25rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .popup-inner {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .popup-inner p {
        margin: 0;
        line-height: 1.6;
        color: var(--color-text-primary);
    }

    .popup-inner strong {
        color: var(--color-text-primary);
    }

    .instructions-list {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
        color: var(--color-text-primary);
    }

    .instructions-list li {
        margin: 0.5rem 0;
        line-height: 1.5;
    }

    .btn-large {
        padding: 1.25rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .summary-box {
        background: var(--color-bg-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--color-border);
        text-align: center;
    }

    .summary-box h3 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
    }

    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(79, 52, 34, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
    }

    .graphs-modal {
        max-width: 1200px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
    }

    .modal-description {
        margin: 0 0 1rem 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .btn-close:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .graphs-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--color-border);
    }

    .pagination-info {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9em;
        margin: 1.5rem 0 1rem;
    }
    
    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .button-group button {
        flex: 1;
    }

    .popup-inner ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
        color: var(--color-text-primary);
		list-style-type: disc;  
    }

    .popup-inner ul li {
        margin: 0.5rem 0;
        line-height: 1.6;
        padding-left: 0.5rem;
		display: list-item;
    }

    .popup-inner ul li::marker {
        color: var(--color-primary);
    }

    @media (max-width: 768px) {
        .hero-content h1 {
            font-size: 2rem;
        }

        .subtitle {
            font-size: 1rem;
        }

        .nav-buttons {
            top: 0.5rem;
            right: 0.5rem;
            flex-direction: column;
        }

        .modal-content {
            max-height: 95vh;
        }

        main {
            padding: 1rem;
        }
    }
</style>

