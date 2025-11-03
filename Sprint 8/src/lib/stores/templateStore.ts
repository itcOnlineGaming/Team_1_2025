import { writable } from 'svelte/store';
import { type Question } from '$lib/components/EvaluationQuestionnaire.svelte';
interface Template {
	id: string;
	name: string;
	description: string;
	questions: Question[];
}

export const selectedTemplate = writable<Template | null>(null);
export const templates = writable<Template[]>([]);
