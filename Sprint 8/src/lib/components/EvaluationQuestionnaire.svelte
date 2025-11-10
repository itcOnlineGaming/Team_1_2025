<script lang="ts" context="module">
    export interface Question {
        id: string;
        label: string;
        type: 'text' | 'select' | 'number';
        options?: string[];
        stars?: boolean;
        starType?: 'stars' | 'slider' | 'emoji' | 'numeric';
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        customValidator?: (value: any) => string | null;
    }
</script>

<script lang="ts">
    export let template: Question[] = [];
    export let handleSubmit: (responses: Record<string, Response>) => void;

    interface Response {
        answer?: string;
        rating?: number;
    }

    interface ValidationErrors {
        [key: string]: string;
    }

    let responses: Record<string, Response> = {};
    let errors: ValidationErrors = {};
    let touched: Record<string, boolean> = {};
    let isSubmitting = false;

    const setRating = (questionId: string, rating: number) => {
        responses[questionId] = { ...responses[questionId], rating };
        touched[questionId] = true;
        validateField(questionId);
    };

    const updateAnswer = (questionId: string, value: string) => {
        responses[questionId] = { ...responses[questionId], answer: value };
        touched[questionId] = true;
        validateField(questionId);
    };

    const validateField = (questionId: string): boolean => {
        const question = template.find(q => q.id === questionId);
        if (!question) return true;

        const response = responses[questionId];
        let error = '';

        // Required field validation
        if (question.required) {
            if (question.stars && (!response?.rating || response.rating === 0)) {
                error = 'Please provide a rating';
            } else if (!question.stars && (!response?.answer || response.answer.trim() === '')) {
                error = 'This field is required';
            }
        }

        // Text/number specific validations
        if (!error && response?.answer) {
            const value = response.answer;

            // Length validation
            if (question.minLength && value.length < question.minLength) {
                error = `Minimum ${question.minLength} characters required`;
            }
            if (question.maxLength && value.length > question.maxLength) {
                error = `Maximum ${question.maxLength} characters allowed`;
            }

            // Number validation
            if (question.type === 'number') {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    error = 'Please enter a valid number';
                } else {
                    if (question.min !== undefined && numValue < question.min) {
                        error = `Value must be at least ${question.min}`;
                    }
                    if (question.max !== undefined && numValue > question.max) {
                        error = `Value must not exceed ${question.max}`;
                    }
                }
            }

            // Pattern validation
            if (question.pattern && !question.pattern.test(value)) {
                error = 'Invalid format';
            }

            // Custom validation
            if (question.customValidator) {
                const customError = question.customValidator(response);
                if (customError) error = customError;
            }
        }

        if (error) {
            errors[questionId] = error;
        } else {
            delete errors[questionId];
        }

        errors = errors; // Trigger reactivity
        return !error;
    };

    const validateAllFields = (): boolean => {
        let isValid = true;
        template.forEach(q => {
            touched[q.id] = true;
            if (!validateField(q.id)) {
                isValid = false;
            }
        });
        touched = touched; // Trigger reactivity
        return isValid;
    };

    const submitForm = () => {
        isSubmitting = true;
        
        if (validateAllFields()) {
            handleSubmit(responses);
        } else {
            // Scroll to first error
            const firstErrorId = Object.keys(errors)[0];
            const element = document.getElementById(firstErrorId);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        isSubmitting = false;
    };

    const getEmojiForRating = (rating: number): string => {
        const emojis = ['😢', '🙁', '😐', '🙂', '😊'];
        return emojis[rating - 1] || '😐';
    };

    const getRatingLabel = (rating: number): string => {
        const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return labels[rating - 1] || '';
    };
</script>

<form on:submit|preventDefault={submitForm} class="space-y-6" novalidate>
    <div class="background mx-10 p-4">
        {#each template as q}
            <div class="my-4">
                <div class="card" class:has-error={touched[q.id] && errors[q.id]}>
                    <label for={q.id} class="mb-2 block font-semibold">
                        {q.label}
                        {#if q.required}
                            <span class="required-asterisk">*</span>
                        {/if}
                    </label>

                    {#if q.type === 'text' || q.type === 'number'}
                        <input
                            id={q.id}
                            type={q.type}
                            class="input-field w-full"
                            class:error={touched[q.id] && errors[q.id]}
                            on:input={(e) => updateAnswer(q.id, (e.target as HTMLInputElement).value)}
                            on:blur={() => { touched[q.id] = true; validateField(q.id); }}
                            value={responses[q.id]?.answer ?? ''}
                            aria-invalid={touched[q.id] && errors[q.id] ? 'true' : 'false'}
                            aria-describedby={errors[q.id] ? `${q.id}-error` : undefined}
                        />
                    {:else if q.type === 'select'}
                        <select
                            id={q.id}
                            class="input-field w-full"
                            class:error={touched[q.id] && errors[q.id]}
                            on:change={(e) => updateAnswer(q.id, (e.target as HTMLSelectElement).value)}
                            on:blur={() => { touched[q.id] = true; validateField(q.id); }}
                            value={responses[q.id]?.answer ?? ''}
                            aria-invalid={touched[q.id] && errors[q.id] ? 'true' : 'false'}
                            aria-describedby={errors[q.id] ? `${q.id}-error` : undefined}
                        >
                            <option value="">Select...</option>
                            {#each q.options ?? [] as opt}
                                <option value={opt}>{opt}</option>
                            {/each}
                        </select>
                    {/if}

                    {#if touched[q.id] && errors[q.id]}
                        <div id="{q.id}-error" class="error-message" role="alert">
                            {errors[q.id]}
                        </div>
                    {/if}

                    {#if q.stars}
                        <div class="mt-3">
                            {#if q.starType === 'stars' || !q.starType}
                                <div class="flex space-x-1">
                                    {#each Array(5) as _, i (i)}
                                        <span 
                                            class="cursor-pointer text-2xl hover:scale-110 transition-transform" 
                                            on:click={() => setRating(q.id, i + 1)}
                                            on:keydown={(e) => e.key === 'Enter' && setRating(q.id, i + 1)}
                                            role="button"
                                            tabindex="0"
                                            aria-label={`Rate ${i + 1} out of 5`}
                                        >
                                            {i + 1 <= (responses[q.id]?.rating ?? 0) ? '🌕' : '🌑'}
                                        </span>
                                    {/each}
                                </div>

                            {:else if q.starType === 'slider'}
                                <div class="slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        class="rating-slider w-full"
                                        value={responses[q.id]?.rating ?? 0}
                                        on:input={(e) => setRating(q.id, parseInt((e.target as HTMLInputElement).value))}
                                        aria-label="Rating slider from 0 to 5"
                                    />
                                    <div class="slider-labels">
                                        <span>0</span>
                                        <span>1</span>
                                        <span>2</span>
                                        <span>3</span>
                                        <span>4</span>
                                        <span>5</span>
                                    </div>
                                    <div class="text-center mt-2 font-semibold">
                                        Rating: {responses[q.id]?.rating ?? 0}/5
                                        {#if responses[q.id]?.rating && responses[q.id].rating > 0}
                                            - {getRatingLabel(responses[q.id].rating ?? 0)}
                                        {/if}
                                    </div>
                                </div>

                            {:else if q.starType === 'emoji'}
                                <div class="flex justify-center space-x-2">
                                    {#each Array(5) as _, i (i)}
                                        <button
                                            type="button"
                                            class="emoji-button"
                                            class:selected={i + 1 === responses[q.id]?.rating}
                                            on:click={() => setRating(q.id, i + 1)}
                                            aria-label={`Rate ${getRatingLabel(i + 1)}`}
                                        >
                                            <span class="text-4xl">{getEmojiForRating(i + 1)}</span>
                                            <span class="text-xs block mt-1">{getRatingLabel(i + 1)}</span>
                                        </button>
                                    {/each}
                                </div>

                            {:else if q.starType === 'numeric'}
                                <div class="flex justify-center space-x-2">
                                    {#each Array(5) as _, i (i)}
                                        <button
                                            type="button"
                                            class="numeric-button"
                                            class:selected={i + 1 === responses[q.id]?.rating}
                                            on:click={() => setRating(q.id, i + 1)}
                                            aria-label={`Rate ${i + 1} out of 5`}
                                        >
                                            {i + 1}
                                        </button>
                                    {/each}
                                </div>
                                {#if responses[q.id]?.rating && responses[q.id].rating > 0}
                                    <div class="text-center mt-2 text-sm text-gray-600">
                                        {getRatingLabel(responses[q.id].rating ?? 0)}
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
        <button type="submit" class="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
    </div>
</form>

<style>
    .background {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .card.has-error {
        border-left: 3px solid #ef4444;
    }

    .required-asterisk {
        color: #ef4444;
        margin-left: 0.25rem;
    }

    .input-field.error {
        border-color: #ef4444;
        background-color: #fef2f2;
    }

    .input-field.error:focus {
        outline-color: #ef4444;
        ring-color: #ef4444;
    }

    .error-message {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .error-message::before {
        content: '⚠';
        font-size: 1rem;
    }

    /* Slider styles */
    .slider-container {
        padding: 1rem 0;
    }

    .rating-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        border-radius: 5px;
        background: linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #84cc16 75%, #22c55e 100%);
        outline: none;
        cursor: pointer;
    }

    .rating-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        border: 3px solid #6366f1;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .rating-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        border-color: #4f46e5;
    }

    .rating-slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        border: 3px solid #6366f1;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .rating-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
        border-color: #4f46e5;
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    .emoji-button {
        background: transparent;
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
    }

    .emoji-button:hover {
        transform: scale(1.1);
        border-color: var(--color-accent);
        background: rgba(123, 104, 166, 0.1);
    }

    .emoji-button.selected {
        border-color: var(--color-accent);
        background: rgba(123, 104, 166, 0.2);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.3);
    }

    .numeric-button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid var(--color-border);
        background: white;
        font-size: 1.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--color-text-primary);
    }

    .numeric-button:hover {
        transform: scale(1.1);
        border-color: var(--color-accent);
        background: rgba(123, 104, 166, 0.1);
    }

    .numeric-button.selected {
        background: var(--color-accent);
        color: white;
        border-color: var(--color-accent);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.4);
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
