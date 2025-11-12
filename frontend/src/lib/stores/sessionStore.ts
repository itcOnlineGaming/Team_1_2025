import { writable, derived } from 'svelte/store';
import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';

export interface SessionResponse {
	answer?: string;
	rating?: number;
}

export interface Session {
	id: string;
	templateId: string;
	templateName: string;
	startTime: number;
	endTime?: number;
	duration: number; // in seconds
	responses: Record<string, SessionResponse>;
	overallRating?: number; // The first question's star rating
}

export interface ActiveSession {
	id: string;
	templateId: string;
	templateName: string;
	questions: Question[];
	startTime: number;
}

function createSessionStore() {
	const sessions = writable<Session[]>([]);
	const activeSession = writable<ActiveSession | null>(null);

	// Load sessions from localStorage on init
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('sessions');
		if (stored) {
			sessions.set(JSON.parse(stored));
		}

		// Load active session from localStorage
		const activeStored = localStorage.getItem('activeSession');
		if (activeStored) {
			activeSession.set(JSON.parse(activeStored));
		}
	}

	// Save to localStorage whenever sessions change
	sessions.subscribe((value) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('sessions', JSON.stringify(value));
		}
	});

	// Save active session to localStorage
	activeSession.subscribe((value) => {
		if (typeof window !== 'undefined') {
			if (value) {
				localStorage.setItem('activeSession', JSON.stringify(value));
			} else {
				localStorage.removeItem('activeSession');
			}
		}
	});

	return {
		sessions: { subscribe: sessions.subscribe },
		activeSession: { subscribe: activeSession.subscribe },

		startSession: (template: { id: string; name: string; questions: Question[] }) => {
			const session: ActiveSession = {
				id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				templateId: template.id,
				templateName: template.name,
				questions: template.questions,
				startTime: Date.now()
			};
			activeSession.set(session);
		},

		endSession: (responses: Record<string, SessionResponse>) => {
			let currentActive: ActiveSession | null = null;
			activeSession.subscribe((val) => (currentActive = val))();

			if (!currentActive) {
				console.error('No active session to end');
				return;
			}

			const endTime = Date.now();
			const duration = Math.floor((endTime - currentActive.startTime) / 1000);

			// Get overall rating from first question if it has stars
			const firstQuestionId = currentActive.questions[0]?.id;
			const overallRating = responses[firstQuestionId]?.rating;

			const completedSession: Session = {
				id: currentActive.id,
				templateId: currentActive.templateId,
				templateName: currentActive.templateName,
				startTime: currentActive.startTime,
				endTime,
				duration,
				responses,
				overallRating
			};

			sessions.update((s) => [...s, completedSession]);
			activeSession.set(null);
		},

		cancelSession: () => {
			activeSession.set(null);
		},

		clearAllSessions: () => {
			sessions.set([]);
			if (typeof window !== 'undefined') {
				localStorage.removeItem('sessions');
			}
		}
	};
}

export const sessionStore = createSessionStore();

// Derived store for session statistics
export const sessionStats = derived(sessionStore.sessions, ($sessions) => {
	if ($sessions.length === 0) return null;

	const ratings = $sessions
		.filter((s) => s.overallRating !== undefined)
		.map((s) => s.overallRating!);

	const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

	const totalDuration = $sessions.reduce((sum, s) => sum + s.duration, 0);
	const avgDuration = totalDuration / $sessions.length;

	return {
		totalSessions: $sessions.length,
		averageRating: avgRating,
		averageDuration: avgDuration,
		sessions: $sessions
	};
});
