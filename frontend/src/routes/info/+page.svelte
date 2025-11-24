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
                <h2>📱 About This App</h2>
                <p>Session Tracker is a productivity tool designed to help you monitor work sessions, track patterns, and reflect on your progress.</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Built for:</strong> Academic Research Project</p>
            </div>

            <!-- Contact Section -->
            <div class="info-card contact-card">
                <h2>📧 Contact Us</h2>
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
                <h2>✨ Key Features</h2>
                <ul class="features-list">
                    <li>⏱️ <strong>Session Tracking:</strong> Monitor your work time with an automatic timer</li>
                    <li>📝 <strong>Dynamic Questions:</strong> Add evaluation questions from templates or create your own custom questions during evaluation</li>
                    <li>⭐ <strong>Ratings & Responses:</strong> Use star ratings (1-5) or text responses to evaluate your sessions</li>
                    <li>📊 <strong>Analytics:</strong> View patterns, statistics, and progress over time with interactive charts</li>
                    <li>🔍 <strong>Search:</strong> Find past sessions quickly by name, group, notes, or responses</li>
                    <li>🏷️ <strong>Groups:</strong> Organize sessions into custom categories for better organization</li>
                    <li>📋 <strong>Notes:</strong> Add context and reflections to completed sessions</li>
                    <li>🔄 <strong>Duplicate:</strong> Reuse questions from previous sessions to maintain consistency</li>
                    <li>📄 <strong>Export:</strong> Generate beautiful HTML reports of your session history</li>
                    <li>🛍️ <strong>Rewards Store:</strong> Earn stars from ratings and spend them on rewards</li>
                </ul>
            </div>

            <!-- Privacy Section -->
            <div class="info-card">
                <h2>🔒 Privacy & Data</h2>
                <p><strong>Local Storage Only:</strong> All your session data is stored locally in your browser. We never send it to a server or collect it remotely.</p>
                <p><strong>Your Control:</strong> You can clear all data at any time using the button below. This action is permanent and cannot be undone.</p>
                <p><strong>Research Use:</strong> Anonymized feedback from post-session questionnaires may be used for academic research purposes.</p>
            </div>

            <!-- Data Management Section -->
            <div class="info-card danger-card">
                <h2>🗑️ Data Management</h2>
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
                <h2>💡 How to Use</h2>
                <ol class="how-to-list">
                    <li>Click <strong>"Start New Session"</strong> on the home page</li>
                    <li>Work on your task while the timer runs in the background</li>
                    <li>Click <strong>"End Session"</strong> when you're finished</li>
                    <li>Add evaluation questions by selecting from templates or creating custom ones</li>
                    <li>Answer your questions with ratings or text responses</li>
                    <li>Complete the post-session questionnaire (for research)</li>
                    <li>View your analytics, search past sessions, and earn stars from your ratings</li>
                </ol>
                <p><strong>💡 Pro Tips:</strong></p>
                <ul class="tips-list">
                    <li>Use star ratings to earn stars for the rewards store</li>
                    <li>Group related sessions together for easier tracking</li>
                    <li>Add notes to sessions for future reference</li>
                    <li>Duplicate questions from past sessions to maintain consistency</li>
                    <li>Export your data as HTML reports for external review</li>
                </ul>
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
        color: var(--color-text-primary);
        font-size: 2.5rem;
    }

    .subtitle {
        margin: 0;
        color: var(--color-text-primary);
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
    }
</style>
