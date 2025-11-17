<script lang="ts">
    import Popup from '$lib/components/Popup.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { ActiveSession } from '$lib/stores/sessionStore';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { base } from '$app/paths';

    interface EvaluationQuestion {
        id: string;
        text: string;
        type: 'text' | 'rating' | 'textarea';
        response?: string;
        rating?: number;
    }

    // Predefined question templates that users can add
    const questionTemplates = [
        { text: 'How productive did you feel during this session?', type: 'rating' as const },
        { text: 'What went well during this session?', type: 'textarea' as const },
        { text: 'What challenges did you face?', type: 'textarea' as const },
        { text: 'What could be improved?', type: 'textarea' as const },
        { text: 'How focused were you? (1-5)', type: 'rating' as const },
        { text: 'What did you accomplish?', type: 'textarea' as const },
        { text: 'How satisfied are you with your progress?', type: 'rating' as const },
        { text: 'Any distractions?', type: 'text' as const },
        { text: 'Energy level? (1-5)', type: 'rating' as const },
        { text: 'Notes for next session', type: 'textarea' as const }
    ];

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

    // Dynamic questions state
    let questions = $state<EvaluationQuestion[]>([]);
    let selectedQuestionIndex = $state<number | null>(null);
    let customQuestionText = $state('');
    let customQuestionType = $state<'text' | 'rating' | 'textarea'>('text');

    onMount(() => {
        const loadSession = () => {
            const unsubscribe = sessionStore.activeSession.subscribe((session) => {
                activeSession = session;
                
                // Load questions from active session if they exist
                if (session && session.questions && session.questions.length > 0) {
                    questions = session.questions.map(q => ({
                        id: q.id,
                        text: q.label || '',
                        type: q.stars ? 'rating' as const : (q.type === 'textarea' ? 'textarea' as const : 'text' as const),
                        response: '',
                        rating: q.stars ? 0 : undefined
                    }));
                }
            });

            setTimeout(() => {
                if (!activeSession && loadAttempts < 3) {
                    loadAttempts++;
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

    function addPredefinedQuestion() {
        if (selectedQuestionIndex !== null) {
            const template = questionTemplates[selectedQuestionIndex];
            const newQuestion: EvaluationQuestion = {
                id: `q-${Date.now()}-${Math.random()}`,
                text: template.text,
                type: template.type,
                response: '',
                rating: template.type === 'rating' ? 0 : undefined
            };
            questions = [...questions, newQuestion];
            selectedQuestionIndex = null;
        }
    }

    function addCustomQuestion() {
        if (customQuestionText.trim()) {
            const newQuestion: EvaluationQuestion = {
                id: `q-${Date.now()}-${Math.random()}`,
                text: customQuestionText.trim(),
                type: customQuestionType,
                response: '',
                rating: customQuestionType === 'rating' ? 0 : undefined
            };
            questions = [...questions, newQuestion];
            customQuestionText = '';
            customQuestionType = 'text';
        }
    }

    function removeQuestion(id: string) {
        questions = questions.filter(q => q.id !== id);
    }

    function updateResponse(id: string, value: string) {
        questions = questions.map(q => 
            q.id === id ? { ...q, response: value } : q
        );
    }

    function updateRating(id: string, value: number) {
        questions = questions.map(q => 
            q.id === id ? { ...q, rating: value } : q
        );
    }

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        if (!activeSession) {
            alert('Session was lost. Please try again.');
            goto(`${base}/`);
            return;
        }
        
        // Validate that at least one question is added
        if (questions.length === 0) {
            alert('Please add at least one evaluation question before submitting.');
            return;
        }
        
        // Validate that all questions are answered
        const unanswered = questions.filter(q => {
            if (q.type === 'rating') {
                return !q.rating || q.rating === 0;
            } else {
                return !q.response || q.response.trim() === '';
            }
        });
        
        if (unanswered.length > 0) {
            alert(`Please answer all questions before submitting. ${unanswered.length} question(s) still need responses.`);
            return;
        }
        
        isSubmitting = true;
        
        // Convert questions to response format
        const responses: Record<string, any> = {};
        questions.forEach(q => {
            if (q.type === 'rating') {
                responses[q.id] = { question: q.text, rating: q.rating || 0 };
            } else {
                responses[q.id] = { question: q.text, answer: q.response || '' };
            }
        });

        // End the session
        sessionStore.endSession(responses);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Show post-test questionnaire instead of going to graphs
        isSubmitting = false;
        showPostTestQuestionnaire = true;
    };

    function handlePostTestSubmit() {
        // Validate that all rating questions have been answered (not 0)
        if (postTestResponses.overallExperience === 0) {
            alert('Please rate your overall experience before submitting.');
            postTestPage = 1;
            return;
        }
        if (postTestResponses.easeOfUse === 0) {
            alert('Please rate how easy it was to use the application.');
            postTestPage = 1;
            return;
        }
        if (postTestResponses.helpfulness === 0) {
            alert('Please rate how helpful the session tracking feature was.');
            postTestPage = 1;
            return;
        }
        if (postTestResponses.likelyToUse === 0) {
            alert('Please rate how likely you are to use this tool.');
            postTestPage = 2;
            return;
        }
        if (postTestResponses.frustrationLevel === 0) {
            alert('Please rate your frustration level.');
            postTestPage = 2;
            return;
        }
        if (postTestResponses.designRating === 0) {
            alert('Please rate the design and layout.');
            postTestPage = 2;
            return;
        }
        if (postTestResponses.wouldRecommend === 0) {
            alert('Please rate whether you would recommend this tool.');
            postTestPage = 2;
            return;
        }
        
        // Validate text responses
        if (!postTestResponses.feedback || postTestResponses.feedback.trim() === '') {
            alert('Please provide your overall feedback before submitting.');
            postTestPage = 3;
            return;
        }
        if (!postTestResponses.improvements || postTestResponses.improvements.trim() === '') {
            alert('Please share what could be improved.');
            postTestPage = 3;
            return;
        }
        
        // Save post-test responses
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
            <h1>Session Evaluation</h1>
            <p class="session-info">
                Started at {new Date(activeSession.startTime).toLocaleTimeString()}
            </p>
        </div>

        <form onsubmit={onSubmit} class="evaluation-form">
            <!-- Add Questions Section -->
            <div class="add-questions-section">
                <h2>Add Evaluation Questions</h2>
                <p class="instruction-text">Add as many or as few questions as you'd like for this evaluation.</p>
                
                <!-- Predefined Questions Dropdown -->
                <div class="question-adder">
                    <div class="dropdown-container">
                        <select 
                            bind:value={selectedQuestionIndex}
                            onchange={addPredefinedQuestion}
                            class="question-select"
                        >
                            <option value={null}>+ Select a question to add...</option>
                            {#each questionTemplates as template, i}
                                <option value={i}>
                                    {template.text} ({template.type === 'rating' ? 'Rating' : template.type === 'textarea' ? 'Long text' : 'Short text'})
                                </option>
                            {/each}
                        </select>
                    </div>

                    <!-- Custom Question Input -->
                    <div class="custom-question">
                        <div class="or-divider">
                            <span>OR</span>
                        </div>
                        <h3>Add a Custom Question</h3>
                        <div class="custom-inputs">
                            <input 
                                type="text"
                                bind:value={customQuestionText}
                                placeholder="Enter your custom question..."
                                class="custom-input"
                            />
                            <div class="type-selector">
                                <label>
                                    <input type="radio" bind:group={customQuestionType} value="text" />
                                    Short Text
                                </label>
                                <label>
                                    <input type="radio" bind:group={customQuestionType} value="textarea" />
                                    Long Text
                                </label>
                                <label>
                                    <input type="radio" bind:group={customQuestionType} value="rating" />
                                    Rating (1-5)
                                </label>
                            </div>
                            <button 
                                type="button"
                                onclick={addCustomQuestion}
                                class="btn-add-custom"
                                disabled={!customQuestionText.trim()}
                            >
                                + Add Custom Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Questions List -->
            {#if questions.length > 0}
                <div class="questions-list">
                    <h2>Your Evaluation ({questions.length} question{questions.length !== 1 ? 's' : ''})</h2>
                    {#each questions as question, index (question.id)}
                        <div class="question-card">
                            <div class="question-header">
                                <span class="question-number">Question {index + 1}</span>
                                <button 
                                    type="button"
                                    onclick={() => removeQuestion(question.id)}
                                    class="btn-remove"
                                    aria-label="Remove question"
                                >
                                    ✕
                                </button>
                            </div>
                            <div class="question-label">{question.text}</div>
                            
                            {#if question.type === 'rating'}
                                <div class="rating-input">
                                    <div class="stars">
                                        {#each Array(5) as _, i}
                                            <button
                                                type="button"
                                                class="star"
                                                class:filled={i < (question.rating || 0)}
                                                onclick={() => updateRating(question.id, i + 1)}
                                                aria-label={`Rate ${i + 1} out of 5`}
                                            >
                                                {i < (question.rating || 0) ? '★' : '☆'}
                                            </button>
                                        {/each}
                                    </div>
                                    <span class="rating-value">
                                        {question.rating || 0}/5
                                    </span>
                                </div>
                            {:else if question.type === 'textarea'}
                                <textarea
                                    bind:value={question.response}
                                    oninput={(e) => updateResponse(question.id, (e.target as HTMLTextAreaElement).value)}
                                    placeholder="Your answer..."
                                    rows="4"
                                    class="response-textarea"
                                ></textarea>
                            {:else}
                                <input
                                    type="text"
                                    bind:value={question.response}
                                    oninput={(e) => updateResponse(question.id, (e.target as HTMLInputElement).value)}
                                    placeholder="Your answer..."
                                    class="response-input"
                                />
                            {/if}
                        </div>
                    {/each}
                </div>

                <div class="submit-section">
                    <button type="submit" class="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Complete Evaluation'}
                    </button>
                </div>
            {:else}
                <div class="empty-state">
                    <p>No questions added yet. Add at least one question to complete your evaluation.</p>
                </div>
            {/if}
        </form>

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
        color: var(--color-text-on-dark);
        font-size: 2rem;
    }

    .session-info {
        color: var(--color-text-on-dark);
        font-size: 0.95rem;
        margin: 0;
    }

    .evaluation-form {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .add-questions-section {
        background: var(--color-card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border: 2px dashed var(--color-border);
    }

    .add-questions-section h2 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
        font-size: 1.4rem;
    }

    .instruction-text {
        color: var(--color-text-secondary);
        margin: 0 0 1.5rem 0;
        font-size: 0.95rem;
    }

    .question-adder {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .dropdown-container {
        width: 100%;
    }

    .question-select {
        width: 100%;
        padding: 0.8rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-input-bg);
        color: var(--color-text-primary);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    @media (max-width: 768px) {
        .dropdown-container {
            width: 100%;
        }

        .question-select {
            font-size: 0.9rem;
            padding: 0.7rem 0.8rem;
        }
    }

    .question-select:hover {
        border-color: var(--color-accent);
    }

    .question-select:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .or-divider {
        text-align: center;
        margin: 1rem 0;
        position: relative;
    }

    .or-divider::before,
    .or-divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        background: var(--color-border);
    }

    .or-divider::before {
        left: 0;
    }

    .or-divider::after {
        right: 0;
    }

    .or-divider span {
        background: var(--color-card-bg);
        padding: 0 1rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .custom-question h3 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
    }

    .custom-inputs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .custom-input {
        width: 100%;
        padding: 0.8rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-input-bg);
        color: var(--color-text-primary);
        font-size: 1rem;
        transition: all 0.2s;
    }

    .custom-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .type-selector {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .type-selector label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text-primary);
        cursor: pointer;
        font-size: 0.95rem;
    }

    .type-selector input[type="radio"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
    }

    .btn-add-custom {
        padding: 0.8rem 1.5rem;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-add-custom:hover:not(:disabled) {
        background: var(--color-accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-add-custom:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .questions-list {
        margin-bottom: 2rem;
    }

    .questions-list h2 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.4rem;
    }

    .question-card {
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.2s;
    }

    .question-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.8rem;
    }

    .question-number {
        color: var(--color-accent);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .btn-remove {
        background: transparent;
        color: var(--color-danger);
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
    }

    .btn-remove:hover {
        background: var(--color-danger);
        color: white;
    }

    .question-label {
        display: block;
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 1.05rem;
        margin-bottom: 1rem;
    }

    .rating-input {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .stars {
        display: flex;
        gap: 0.5rem;
    }

    .star {
        background: transparent;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--color-text-secondary);
        padding: 0;
    }

    .star.filled {
        color: var(--color-warning, #FFD700);
    }

    .star:hover {
        transform: scale(1.2);
    }

    .rating-value {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 1.1rem;
    }

    .response-input,
    .response-textarea {
        width: 100%;
        padding: 0.8rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-input-bg);
        color: var(--color-text-primary);
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.2s;
    }

    .response-input:focus,
    .response-textarea:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .response-textarea {
        resize: vertical;
        min-height: 100px;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--color-text-on-dark);
        font-size: 1.05rem;
    }

    .submit-section {
        text-align: center;
        margin: 2rem 0;
    }

    .btn-submit {
        padding: 1rem 3rem;
        background: var(--color-success);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
        background: var(--color-success-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
        background: var(--color-card-bg);
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
        background: linear-gradient(to right, var(--color-danger) 0%, var(--color-warning) 50%, var(--color-success) 100%);
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
        background: var(--color-card-bg);
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
        background: var(--color-card-bg);
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
        background: var(--color-input-bg);
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
