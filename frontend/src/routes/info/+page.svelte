<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';

    // Obfuscated email to prevent scraping
    function openContact() {
        const parts = ['C00283423', 'setu', 'ie'];
        const email = parts[0] + '@' + parts[1] + '.' + parts[2];
        window.location.href = 'mailto:' + email;
    }

    function goBack() {
        goto(`${base}/`);
    }

    function clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will delete all sessions and cannot be undone.')) {
            localStorage.clear();
            alert('All data has been cleared. Refreshing page...');
            window.location.reload();
        }
    }
</script>

<div class="info-page">
    <button class="btn-back" onclick={goBack}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
    </button>

    <div class="page-content">
        <div class="page-header">
            <h1>ℹ️ Information & Settings</h1>
            <p class="subtitle">App information, contact, and data management</p>
        </div>

        <div class="info-sections">
            <!-- About Section -->
            <div class="info-card">
                <h2>About This App</h2>
                <p>Activity Tracker is a productivity tool designed to help you monitor work sessions, track patterns, and reflect on your progress.</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Built for:</strong> Academic Research Project</p>
            </div>

            <!-- Contact Section -->
            <div class="info-card contact-card">
                <h2>Contact Us</h2>
                <p>Have questions, feedback, or technical issues?</p>
                <button class="btn-contact" onclick={openContact}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Send Email
                </button>
                <p class="help-text">We'll respond to your inquiry as soon as possible.</p>
            </div>

            <!-- Features Section -->
            <div class="info-card">
                <h2>Key Features</h2>
                <ul class="features-list">
                    <li><strong>Session Tracking:</strong> Monitor your work time with an automatic timer</li>
                    <li><strong>Dynamic Questions:</strong> Add evaluation questions from templates or create your own custom questions during evaluation</li>
                    <li><strong>Ratings & Responses:</strong> Use star ratings (1-5) or text responses to evaluate your sessions</li>
                    <li><strong>Analytics:</strong> View patterns, statistics, and progress over time with interactive charts</li>
                    <li><strong>Search:</strong> Find past sessions quickly by name, group, notes, or responses</li>
                    <li><strong>Groups:</strong> Organize sessions into custom categories for better organization</li>
                    <li><strong>Notes:</strong> Add context and reflections to completed sessions</li>
                    <li><strong>Duplicate:</strong> Reuse questions from previous sessions to maintain consistency</li>
                    <li><strong>Export:</strong> Generate beautiful HTML reports of your session history</li>
                    <li><strong>Rewards Store:</strong> Earn stars from ratings and spend them on rewards</li>
                </ul>
            </div>

            <!-- Privacy Section -->
            <div class="info-card">
                <h2>Privacy & Data</h2>
                <p><strong>Local Storage Only:</strong> All your session data is stored locally in your browser. We never send it to a server or collect it remotely.</p>
                <p><strong>Your Control:</strong> You can clear all data at any time using the button below. This action is permanent and cannot be undone.</p>
                <p><strong>Research Use:</strong> Anonymized feedback from post-session questionnaires may be used for academic research purposes.</p>
            </div>

            <!-- Data Management Section -->
            <div class="info-card danger-card">
                <h2>Data Management</h2>
                <p>Clear all sessions, responses, store purchases, and settings from your browser.</p>
                <button class="btn-danger" onclick={clearAllData}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Clear All Data
                </button>
                <p class="warning-text">⚠️ This action cannot be undone!</p>
            </div>

            <!-- How to Use Section -->
            <div class="info-card">
                <h2>📚 How to Use - Full Task Pipeline</h2>
                <p>Follow this step-by-step guide to get the most out of Activity Tracker by creating tasks, running sessions, and tracking your progress.</p>
                
                <div class="pipeline-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Create a Task</h3>
                            <p>Go to the <strong>Tasks</strong> page. Click the <strong>"+ Create New Task"</strong> button at the bottom.</p>
                            <ul class="sub-list">
                                <li><strong>Name:</strong> Enter your task name (e.g., "Study for Biology Exam")</li>
                                <li><strong>Goal:</strong> Optionally add a goal or target for this task</li>
                                <li>Click <strong>"Create task"</strong> to save</li>
                            </ul>
                            <p class="step-note">💡 Your new task will appear in the "In Progress" section of the Tasks page.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Start a Session</h3>
                            <p>You can start a session in two ways:</p>
                            <ul class="sub-list">
                                <li><strong>From Tasks page:</strong> Hover over a task card and click <strong>"▶ Start Session"</strong></li>
                                <li><strong>From Task Details:</strong> Click <strong>"Details"</strong> on a task, then click the large circular <strong>"▶ Start New Session"</strong> button</li>
                            </ul>
                            <p class="step-note">⏱️ You'll be taken to the home page where the session timer will display. The timer automatically tracks your work time.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Work & End Session</h3>
                            <p>Work on your task while the timer runs in the background.</p>
                            <ul class="sub-list">
                                <li>Take your time - the timer keeps running</li>
                                <li>When finished or taking a break, click <strong>"End Session"</strong> on the timer</li>
                            </ul>
                            <p class="step-note">✨ After ending a session, you'll be taken to the evaluation page.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>Evaluate Your Session</h3>
                            <p>Answer questions about your session to provide feedback:</p>
                            <ul class="sub-list">
                                <li>Choose pre-defined questions from templates (e.g., "How focused were you?")</li>
                                <li>Or create your own custom questions</li>
                                <li>Rate using <strong>1-5 stars</strong> or provide <strong>text responses</strong></li>
                                <li>Add optional <strong>notes</strong> or group sessions by category</li>
                            </ul>
                            <p class="step-note">📝 Your responses are saved with the session for future reference and analytics.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <h3>View Session History</h3>
                            <p>After completing a session, view all your sessions for a task:</p>
                            <ul class="sub-list">
                                <li>Go to the <strong>Tasks</strong> page</li>
                                <li>Click <strong>"Details"</strong> on a task card</li>
                                <li>Scroll to <strong>"Previous Sessions"</strong> section</li>
                                <li>Click any session row to expand and see full questionnaire responses</li>
                            </ul>
                            <p class="step-note">📊 Each session shows the session name, date, and average rating from your responses.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">6</div>
                        <div class="step-content">
                            <h3>Complete a Task</h3>
                            <p>When you've finished working on a task:</p>
                            <ul class="sub-list">
                                <li>Go to the task's <strong>Details</strong> page</li>
                                <li>Click the green <strong>"✓ Finish Task"</strong> button</li>
                                <li>A modal will ask <strong>"How did the task go?"</strong></li>
                                <li>Enter your feedback (e.g., "Passed the exam with 85%") and click <strong>"Mark as Complete"</strong></li>
                            </ul>
                            <p class="step-note">✅ Your task will move to the "Completed" section. You can still view session history but cannot start new sessions.</p>
                        </div>
                    </div>

                    <div class="step">
                        <div class="step-number">7</div>
                        <div class="step-content">
                            <h3>Track Progress & Earn Rewards</h3>
                            <p>Monitor your productivity across all tasks:</p>
                            <ul class="sub-list">
                                <li><strong>Home page:</strong> View your 3 most recent in-progress tasks</li>
                                <li><strong>Tasks page:</strong> See all in-progress and completed tasks with session counts and average ratings</li>
                                <li><strong>Results page:</strong> View detailed analytics and charts of all your sessions</li>
                                <li><strong>Store page:</strong> Earn stars from session ratings and redeem them for rewards</li>
                            </ul>
                            <p class="step-note">📈 All data is saved locally in your browser - nothing is sent to our servers.</p>
                        </div>
                    </div>
                </div>

                <div class="pro-tips-section">
                    <h3>💡 Pro Tips</h3>
                    <ul class="tips-list">
                        <li><strong>Use star ratings:</strong> Higher ratings from evaluations earn more stars for the rewards store</li>
                        <li><strong>Create templates:</strong> Save question sets as templates to reuse across sessions</li>
                        <li><strong>Add session notes:</strong> Include personal notes for context when reviewing past sessions</li>
                        <li><strong>Track patterns:</strong> Use the Results page to identify trends in your productivity</li>
                        <li><strong>Group sessions:</strong> Organize related sessions with consistent categories for better analysis</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<MobileBottomNav />

<style>
    .info-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding: 2rem;
        padding-bottom: 6rem;
        position: relative;
    }

    .btn-back {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        background: var(--color-card-bg);
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
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
    }

    @media (max-width: 768px) {
        .btn-back {
            display: none;
        }
    }

    .page-content {
        max-width: 900px;
        margin: 0 auto;
        padding-top: 4rem;
    }

    .page-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .page-header h1 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-on-dark);
        font-size: 2.5rem;
    }

    .subtitle {
        margin: 0;
        color: var(--color-text-on-dark);
        font-size: 1.1rem;
        opacity: 0.8;
    }

    .info-sections {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .info-card {
        background: var(--color-card-bg);
        border: 2px solid var(--color-border);
        border-radius: 12px;
        padding: 2rem;
        transition: all 0.2s;
    }

    .info-card:hover {
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.15);
    }

    .info-card h2 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
    }

    .info-card p {
        margin: 0.75rem 0;
        color: var(--color-text-primary);
        line-height: 1.6;
    }

    .contact-card {
        border-color: var(--color-success);
    }

    .contact-card:hover {
        border-color: var(--color-success);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    }

    .btn-contact {
        width: 100%;
        background: var(--color-success);
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin: 1rem 0;
    }

    .btn-contact svg {
        width: 20px;
        height: 20px;
    }

    .btn-contact:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
    }

    .features-list li {
        padding: 0.75rem 0;
        color: var(--color-text-primary);
        line-height: 1.6;
        border-bottom: 1px solid var(--color-border);
    }

    .features-list li:last-child {
        border-bottom: none;
    }

    .danger-card {
        border-color: var(--color-danger);
    }

    .danger-card:hover {
        border-color: var(--color-danger);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }

    .btn-danger {
        width: 100%;
        background: var(--color-danger);
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin: 1rem 0;
    }

    .btn-danger svg {
        width: 20px;
        height: 20px;
    }

    .btn-danger:hover {
        background: #b91c1c;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .warning-text {
        color: var(--color-danger);
        font-weight: 600;
        text-align: center;
        margin-top: 0.5rem;
    }

    .help-text {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        font-style: italic;
        margin-top: 0.5rem;
    }

    .how-to-list {
        margin: 1rem 0;
        padding-left: 1.5rem;
        color: var(--color-text-primary);
    }

    .how-to-list li {
        margin: 0.75rem 0;
        line-height: 1.6;
    }

    .tips-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0 0;
    }

    .tips-list li {
        padding: 0.5rem 0;
        color: var(--color-text-primary);
        line-height: 1.6;
        padding-left: 1.5rem;
        position: relative;
    }

    .tips-list li::before {
        content: "→";
        position: absolute;
        left: 0;
        color: var(--color-primary);
        font-weight: bold;
    }

    .info-card strong {
        color: var(--color-text-primary);
    }

    .pipeline-steps {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin: 1.5rem 0;
    }

    .step {
        display: flex;
        gap: 1.5rem;
        background: var(--color-bg-secondary, rgba(123, 104, 166, 0.05));
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid var(--color-primary);
        transition: all 0.2s;
    }

    .step:hover {
        box-shadow: 0 2px 8px rgba(123, 104, 166, 0.1);
    }

    .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--color-primary);
        color: white;
        border-radius: 50%;
        font-weight: 700;
        font-size: 1.2rem;
        flex-shrink: 0;
    }

    .step-content {
        flex: 1;
    }

    .step-content h3 {
        margin: 0 0 0.75rem 0;
        color: var(--color-primary);
        font-size: 1.2rem;
    }

    .step-content p {
        margin: 0 0 0.75rem 0;
        color: var(--color-text-primary);
        line-height: 1.6;
    }

    .sub-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0.75rem 0;
    }

    .sub-list li {
        padding: 0.5rem 0 0.5rem 1.5rem;
        color: var(--color-text-primary);
        position: relative;
        line-height: 1.6;
    }

    .sub-list li::before {
        content: "→";
        position: absolute;
        left: 0;
        color: var(--color-primary);
        font-weight: 600;
    }

    .step-note {
        background: rgba(123, 104, 166, 0.15);
        padding: 0.75rem 1rem;
        border-radius: 6px;
        border-left: 3px solid var(--color-primary);
        margin: 0.75rem 0 0 0 !important;
        font-size: 0.95rem;
        color: var(--color-text-primary);
        line-height: 1.5;
    }

    .pro-tips-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--color-border);
    }

    .pro-tips-section h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary);
        font-size: 1.25rem;
    }

    @media (max-width: 768px) {
        .info-page {
            padding: 1rem;
            padding-bottom: 6rem;
        }

        .page-content {
            padding-top: 3rem;
        }

        .page-header h1 {
            font-size: 1.75rem;
        }

        .subtitle {
            font-size: 1rem;
        }

        .info-card {
            padding: 1.5rem;
        }

        .info-card h2 {
            font-size: 1.25rem;
        }

        .btn-back {
            top: 1rem;
            left: 1rem;
        }

        .step {
            flex-direction: column;
            gap: 1rem;
            padding: 1.25rem;
        }

        .step-number {
            width: 36px;
            height: 36px;
            font-size: 1rem;
        }

        .step-content h3 {
            font-size: 1.1rem;
        }

        .step-content p {
            font-size: 0.95rem;
        }

        .sub-list li {
            padding: 0.4rem 0 0.4rem 1.2rem;
            font-size: 0.9rem;
        }

        .pro-tips-section h3 {
            font-size: 1.1rem;
        }

        .tips-list li {
            font-size: 0.9rem;
        }
    }
</style>
