<script lang="ts">
	export interface Question {
		id: string;
		label: string;
		type: 'text' | 'select' | 'number';
		options?: string[];
		stars?: boolean;
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
</script>

<form on:submit|preventDefault={submitForm} class="space-y-6">
	<div class="background mx-10 p-4">
		{#each template as q}
			<div class="my-4">
				<div class="rounded-lg border p-4 shadow-sm">
					<label class="mb-2 block font-semibold">{q.label}</label>

					{#if q.type === 'text' || q.type === 'number'}
						<input
							type={q.type}
							class="w-full rounded border p-2"
							on:input={(e) => updateAnswer(q.id, (e.target as HTMLInputElement).value)}
						/>
					{:else if q.type === 'select'}
						<select
							class="w-full rounded border p-2"
							on:change={(e) => updateAnswer(q.id, (e.target as HTMLSelectElement).value)}
						>
							<option value="">Select...</option>
							{#each q.options ?? [] as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					{/if}

					{#if q.stars}
						<div class="mt-3 flex space-x-1">
							{#each Array(5) as _, i (i)}
								<span class="cursor-pointer text-2xl" on:click={() => setRating(q.id, i + 1)}>
									{i + 1 <= (responses[q.id]?.rating ?? 0) ? '🌕' : '🌑'}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
		{#if template.filter((x) => x.stars === true).length <= 0}
			<!-- TODO: If no rating, add a rating options for the entire session -->
		{/if}
		<button
			type="submit"
			class="w-full rounded bg-blue-600 p-2 px-4 py-2 text-white"
			on:submit={submitForm}
		>
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
</style>
