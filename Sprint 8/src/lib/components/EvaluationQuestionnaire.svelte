<script lang="ts">
    export interface Question {
        id: string;
        label: string;
        type: 'text' | 'select' | 'number';
        options?: string[];
        stars?: boolean;
        starType?: 'stars' | 'slider' | 'emoji' | 'numeric';
    }

    export let template: Question[] = [];
    export let handleSubmit: (responses: Record<string, Response>) => void;

    interface Response {
        answer?: string;
        rating?: number;
    }

    let responses: Record<string, Response> = {};

    const setRating = (questionId: string, rating: number) => {
        responses[questionId] = { ...responses[questionId], rating };
    };

    const updateAnswer = (questionId: string, value: string) => {
        responses[questionId] = { ...responses[questionId], answer: value };
    };

    const submitForm = () => {
        handleSubmit(responses);
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

<form on:submit|preventDefault={submitForm} class="space-y-6">
    <div class="background mx-10 p-4">
        {#each template as q}
            <div class="my-4">
                <div class="card">
                    <label class="mb-2 block font-semibold">{q.label}</label>

                    {#if q.type === 'text' || q.type === 'number'}
                        <input
                            type={q.type}
                            class="input-field w-full"
                            on:input={(e) => updateAnswer(q.id, (e.target as HTMLInputElement).value)}
                        />
                    {:else if q.type === 'select'}
                        <select
                            class="input-field w-full"
                            on:change={(e) => updateAnswer(q.id, (e.target as HTMLSelectElement).value)}
                        >
                            <option value="">Select...</option>
                            {#each q.options ?? [] as opt}
                                <option value={opt}>{opt}</option>
                            {/each}
                        </select>
                    {/if}

                    {#if q.stars}
                        <div class="mt-3">
                            {#if q.starType === 'stars' || !q.starType}
                                <!-- Traditional star rating -->
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
                                <!-- Slider rating -->
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
                                        {#if responses[q.id]?.rating}
                                            - {getRatingLabel(responses[q.id].rating)}
                                        {/if}
                                    </div>
                                </div>

                            {:else if q.starType === 'emoji'}
                                <!-- Emoji rating -->
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
                                <!-- Numeric button rating -->
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
                                {#if responses[q.id]?.rating}
                                    <div class="text-center mt-2 text-sm text-gray-600">
                                        {getRatingLabel(responses[q.id].rating)}
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
        <button type="submit" class="btn-primary w-full">
            Submit
        </button>
    </div>
</form>

<style>
    .background {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
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
</style>
