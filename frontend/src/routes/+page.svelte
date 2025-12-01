<script lang="ts">
    import Popup from '$lib/components/Popup.svelte';
    import SessionTimer from '$lib/components/SessionTimer.svelte';
    import SessionGraphs from '$lib/components/SessionGraphs.svelte';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { taskStore, type Task } from '$lib/stores/taskStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';

    let welcomePage = $state(1);
    let showWelcomePopup = $state(false);  // Changed to false so it doesn't show on initial load
    let showGraphs = $state(false);
    let showEndTestPrompt = $state(false);
    let activeSession = $state<any>(null);
    let tasks = $state<Task[]>([]);
    let allSessions = $state<any[]>([]);

    onMount(() => {
        // Subscribe to active session changes
        const unsubscribeSession = sessionStore.activeSession.subscribe((session) => {
            activeSession = session;
        });

        // Subscribe to tasks
        const unsubscribeTasks = taskStore.subscribe((t) => {
            tasks = t;
        });

        // Subscribe to sessions
        const unsubscribeSessions = sessionStore.sessions.subscribe((s) => {
            allSessions = s;
        });

        // Check URL params for showGraphs
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('showGraphs') === 'true') {
            showWelcomePopup = false;
            showGraphs = true;
            window.history.replaceState({}, '', '/');
        }

        return () => {
            unsubscribeSession();
            unsubscribeTasks();
            unsubscribeSessions();
        };
    });

    function handleStartSession() {
        showWelcomePopup = false;
        // Start session directly without any template
        sessionStore.startSession({
            id: 'direct',
            name: 'Work Session',
            questions: [] // Questions will be added during evaluation
        });
    }

    function openWelcomePopup() {
        showWelcomePopup = true;
    }

    function handleEndSession() {
        goto(`${base}/evaluation`);
    }

    function handleGraphsClose() {
        showGraphs = false;
        showEndTestPrompt = true;
    }

    function handleStartAnother() {
        showEndTestPrompt = false;
        // Start directly without any template
        sessionStore.startSession({
            id: 'direct',
            name: 'Work Session',
            questions: []
        });
    }

    function handleFinish() {
        showEndTestPrompt = false;
        showWelcomePopup = false;
        goto(`${base}/results`);
    }

    // Get 3 most recent in-progress tasks based on latest session time
    function getRecentInProgressTasks() {
        const inProgressTasks = tasks.filter(t => !t.completedAt);
        
        const tasksWithLatestSession = inProgressTasks.map(task => {
            const taskSessions = allSessions.filter(s => s.taskId === task.id);
            const latestSession = taskSessions.length > 0 
                ? taskSessions.reduce((latest, current) => 
                    current.startTime > latest.startTime ? current : latest
                )
                : null;
            return {
                task,
                latestSessionTime: latestSession?.startTime || 0
            };
        });
        
        return tasksWithLatestSession
            .sort((a, b) => b.latestSessionTime - a.latestSessionTime)
            .slice(0, 3)
            .map(item => item.task);
    }

    function goToTasks() {
        goto(`${base}/tasks`);
    }
</script>

<main>
    <!-- Desktop nav buttons -->
    <nav class="nav-buttons desktop-only">
        <button class="nav-btn" onclick={() => goto(`${base}/store`)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Store
        </button>
        <button class="nav-btn" onclick={() => goto(`${base}/tasks`)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Tasks
        </button>
        <button class="nav-btn" onclick={() => goto(`${base}/results`)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
            </svg>
            Results
        </button>
        <button class="nav-btn contact-btn" onclick={() => goto(`${base}/info`)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Info & Contact
        </button>
    </nav>
    
    <div class="hero-content">
        {#if activeSession}
            <SessionTimer 
                session={activeSession} 
                onEnd={handleEndSession}
            />
        {:else if !showGraphs && !showEndTestPrompt}
            <h1>Activity Tracker</h1>
            <p class="subtitle">Track your work sessions for tasks and provide yourself feedback to help work towards completing your chosen goal</p>
            
            <div class="recent-tasks-section">
                <h2>Your Recent In Progress Tasks</h2>
                {#if getRecentInProgressTasks().length === 0}
                    <div class="empty-state-card">
                        <p>No in-progress tasks yet</p>
                        <p class="empty-subtitle">Create a new task to get started and see your tasks appear here</p>
                        <button class="btn-primary" onclick={goToTasks}>Create Your First Task</button>
                    </div>
                {:else}
                    <div class="recent-tasks-list">
                        {#each getRecentInProgressTasks() as task}
                            <div class="recent-task-item" onclick={() => goto(`${base}/tasks/${task.id}`)}>
                                <h3>{task.name}</h3>
                                {#if task.goal}
                                    <p class="task-goal">{task.goal}</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <div class="view-all-container">
                        <button class="btn-secondary" onclick={goToTasks}>View All Tasks</button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
    
    <MobileBottomNav />
</main>



<!-- Welcome Popup -->
<Popup bind:isOpen={showWelcomePopup} title="Welcome to Activity Tracker" showCloseButton={false}>
    <div class="popup-inner">
        {#if welcomePage === 1}
            <h2>Welcome, Test Participant!</h2>
            
            <p><strong>Thank you for taking part in our user study!</strong></p>
            
            <p>We're university students conducting research on productivity tracking tools for our final-year project. This application helps you monitor work sessions, reflect on your productivity, and track patterns over time.</p>
            
            <h3><strong>Why Your Input Matters</strong></h3>
            <p>Your honest feedback will directly shape our research findings and help us understand how students use productivity tools in real-world scenarios. There are no right or wrong answers - we want to see how you naturally interact with the system.</p>
            
            <p class="help-text"><strong>Time Commitment:</strong> Approximately 1-2 minutes per session for evaluation</p>
            
            <div class="pagination-info">Page 1 of 3</div>
            
            <button class="btn-primary btn-full btn-large" onclick={() => welcomePage = 2}>
                Next →
            </button>
        {:else if welcomePage === 2}
            <h2><strong>How It Works</strong></h2>
            
            <p>For this test, imagine you're <strong>studying for an important exam</strong> or working on a project. You want to track your work sessions and understand your productivity patterns.</p>
            
            <ol class="instructions-list">
                <li><strong>1. Start a session</strong> - click the button and the timer begins tracking your work time</li>
                <li><strong>2. Work on your task</strong> - focus on what you need to do while the timer runs in the background</li>
                <li><strong>3. End the session</strong> when you're done or need a break</li>
                <li><strong>4. Add evaluation questions</strong> - choose from our pre-defined questions or create your own custom questions</li>
                <li><strong>5. Answer your questions</strong> - reflect on your focus, productivity, challenges, and accomplishments</li>
                <li><strong>6. View analytics</strong> - see your patterns over time, search past sessions, and track your progress</li>
            </ol>
            
            <div class="pagination-info">Page 2 of 3</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => welcomePage = 1}>
                    ← Back
                </button>
                <button class="btn-primary" onclick={() => welcomePage = 3}>
                    Next →
                </button>
            </div>
        {:else if welcomePage === 3}
            <h2><strong>What We're Testing</strong></h2>
            
            <p>Your experience will help us evaluate:</p>
            <ul>
                <li><strong>Usability:</strong> How intuitive and easy the interface is to navigate</li>
                <li><strong>Workflow:</strong> Whether the session tracking and evaluation process feels natural</li>
                <li><strong>Features:</strong> If the analytics, search, grouping, and notes are useful</li>
                <li><strong>Pain Points:</strong> Any confusion, frustration, or technical issues you encounter</li>
            </ul>
            
            <h3><strong>Your Privacy & Data</strong></h3>
            <p>All session data is stored <strong>locally in your browser</strong> - we never send it to a server. For research purposes, we'll collect anonymized usage feedback through the post-session questionnaire. Your participation is completely voluntary.</p>
            
            <p class="help-text"><strong>💡 Tip:</strong> Be honest in your feedback! Critical insights are just as valuable as positive ones.</p>
            
            <div class="pagination-info">Page 3 of 3</div>
            
            <div class="button-group">
                <button class="btn-secondary" onclick={() => welcomePage = 2}>
                    ← Back
                </button>
                <button class="btn-primary btn-large" onclick={handleStartSession}>
                    🎯 Start Your First Session
                </button>
            </div>
        {/if}
    </div>
</Popup>



<!-- Analytics Popup -->
{#if showGraphs}
    <div 
        class="modal-overlay" 
        role="button" 
        tabindex="0"
        onclick={handleGraphsClose} 
        onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && handleGraphsClose()}
        aria-label="Close analytics"
    >
        <div 
            class="modal-content card graphs-modal" 
            role="dialog" 
            aria-modal="true" 
            tabindex="0" 
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <h2>Session Analytics</h2>
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
        <p><strong>Great work! Your session has been saved.</strong></p>
        
        <p>Your responses have been recorded. You can view your session history, add notes, group sessions, and track your progress in the Results page.</p>

        <div class="summary-box">
            <h3>What's next?</h3>
            <p>Start another session to continue tracking, or view your analytics to see your patterns and progress.</p>
        </div>

        <div class="action-buttons">
            <button class="btn-secondary btn-full" onclick={handleStartAnother}>
                Start Another Session
            </button>
            <button class="btn-primary btn-full" onclick={handleFinish}>
                View Results & Analytics
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
        color: var(--color-text-on-dark);
        text-align: center;
    }


    .subtitle {
        font-size: 1.2rem;
        color: var(--color-text-on-dark);
        text-align: center;
        margin: 0;
        opacity: 0.9;
    }


    .nav-buttons {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        display: flex;
        gap: 0.75rem;
    }

    .nav-btn {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.65rem 1.25rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .nav-btn svg {
        width: 18px;
        height: 18px;
    }

    .nav-btn:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.3);
    }

    .contact-btn {
        margin-left: auto;
    }

    .contact-btn:hover {
        background: var(--color-success);
        border-color: var(--color-success);
    }

    .desktop-only {
        display: flex;
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

    .feature-highlight {
        background: linear-gradient(135deg, var(--color-primary), var(--color-success));
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
        font-size: 0.95rem;
        line-height: 1.6;
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
        z-index: 10000;
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
        background-color: var(--color-bg-secondary);
    }


    .modal-header h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
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


        .nav-buttons.desktop-only {
            display: none;
        }


        .modal-content {
            max-height: 95vh;
        }


        main {
            padding: 1rem;
            padding-bottom: 5rem; /* Add padding to account for bottom nav */
        }
    }

    .recent-tasks-section {
        width: 100%;
        max-width: 1200px;
        margin-top: 2rem;
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(79, 73, 115, 0.1);
    }

    .recent-tasks-section h2 {
        color: var(--color-accent);
        font-size: 1.5rem;
        margin: 0 0 1.5rem 0;
        text-align: center;
    }

    .empty-state-card {
        background: var(--color-bg-secondary);
        border: 2px dashed var(--color-border);
        border-radius: 8px;
        padding: 2.5rem 2rem;
        text-align: center;
    }

    .empty-state-card p {
        margin: 0.5rem 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
    }

    .empty-state-card .empty-subtitle {
        font-style: italic;
        margin-bottom: 1.5rem;
    }

    .empty-state-card .btn-primary {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
    }

    .recent-tasks-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
        background: var(--color-bg-secondary);
    }

    .recent-task-item {
        background: var(--color-bg-secondary);
        border: none;
        border-bottom: 1px solid var(--color-border);
        border-radius: 0;
        padding: 1rem 1.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1rem;
        align-items: center;
    }

    .recent-task-item:last-child {
        border-bottom: none;
    }

    .recent-task-item:hover {
        background: var(--color-card-bg);
    }

    .recent-task-item h3 {
        margin: 0;
        color: var(--color-accent);
        font-size: 1.05rem;
        grid-column: 1 / -1;
    }

    .recent-task-item .task-goal {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        font-style: italic;
        grid-column: 1 / -1;
    }

    .view-all-container {
        display: flex;
        justify-content: center;
        padding-top: 1rem;
        border-top: 1px solid var(--color-border);
        margin-top: 1rem;
    }

    .view-all-container .btn-secondary {
        padding: 0.6rem 1.5rem;
        font-size: 0.95rem;
    }
</style>
