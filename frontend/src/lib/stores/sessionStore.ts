import { writable, derived } from 'svelte/store';
import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';

export interface SessionResponse {
	question?: string; // The question text
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
	group?: string; // Optional group name for organizing sessions
	notes?: string; // Optional notes about the session
	taskId?: string;
	taskName?: string;
}

export interface ActiveSession {
	id: string;
	templateId: string;
	templateName: string;
	questions: Question[];
	startTime: number;
	plannedDuration: number; // in seconds
	group?: string; // Optional group name
	// optional task reference
	taskId?: string;
	taskName?: string;
}

function createSessionStore() {
	const sessions = writable<Session[]>([]);
	const activeSession = writable<ActiveSession | null>(null);

	// Load sessions from localStorage on init (client-side only)
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('sessions');
		if (stored) {
			try {
				const parsedSessions: Session[] = JSON.parse(stored);
				// Migrate legacy session names to 'Session N' format per task
				const migratedSessions = parsedSessions.map((session, idx) => {
					// If templateName matches the task name, it's legacy; renumber it
					if (session.taskId && session.taskName && session.templateName === session.taskName) {
						// Count how many sessions with the same taskId came before this one
						const priorCount = parsedSessions
							.slice(0, idx)
							.filter((s) => s.taskId === session.taskId).length;
						return { ...session, templateName: `Session ${priorCount + 1}` };
					}
					return session;
				});
				sessions.set(migratedSessions);
			} catch (error) {
				console.error('Error parsing sessions from localStorage:', error);
				localStorage.removeItem('sessions');
			}
		}

		// Load active session from localStorage
		const activeStored = localStorage.getItem('activeSession');
		if (activeStored) {
			try {
				activeSession.set(JSON.parse(activeStored));
			} catch (error) {
				console.error('Error parsing active session from localStorage:', error);
				localStorage.removeItem('activeSession');
			}
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

		// startSession accepts the template, duration in minutes, and optional task reference
		startSession: (template: { id: string; name: string; questions: Question[] }, durationMinutes: number = 1, task?: { id: string; name: string }) => {
			// Determine next session index per task (or global if no task)
			let nextIndex = 1;
			sessions.update((current) => {
				if (task) {
					const countForTask = current.filter((s) => s.taskId === task.id).length;
					nextIndex = countForTask + 1;
				} else {
					nextIndex = current.length + 1;
				}
				return current; // no mutation here
			});

			const session: ActiveSession = {
				id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				templateId: template.id,
				templateName: `Session ${nextIndex}`,
				questions: template.questions,
				startTime: Date.now(),
				plannedDuration: durationMinutes * 60 // convert minutes to seconds
			};

			// attach task info if provided
			if (task) {
				session.taskId = task.id;
				session.taskName = task.name;
			}
			activeSession.set(session);
		},

		endSession: (responses: Record<string, SessionResponse>) => {
			let currentActive: ActiveSession | null = null;
			const unsubscribe = activeSession.subscribe((val) => {
				currentActive = val;
			});
			unsubscribe();

			if (!currentActive) {
				console.error('No active session to end');
				return;
			}

			// TypeScript narrowing - we know it's not null at this point
			const session: ActiveSession = currentActive;
			const endTime = Date.now();
			const duration = Math.floor((endTime - session.startTime) / 1000);

			// Get overall rating from first question if it has stars
			const firstQuestionId = session.questions?.[0]?.id;
			const overallRating = firstQuestionId ? responses[firstQuestionId]?.rating : undefined;

			const completedSession: Session = {
				id: session.id,
				templateId: session.templateId,
				templateName: session.templateName,
				startTime: session.startTime,
				endTime,
				duration,
				responses,
				overallRating
			};

			if (session.taskId) completedSession.taskId = session.taskId;
			if (session.taskName) completedSession.taskName = session.taskName;

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
		},

		updateSession: (sessionId: string, updates: Partial<Session>) => {
			sessions.update((s) =>
				s.map((session) => (session.id === sessionId ? { ...session, ...updates } : session))
			);
		},
		deleteSessionsByTaskId: (taskId: string) => {
			sessions.update((s) => s.filter((session) => session.taskId !== taskId));
		}
	};
}

export const sessionStore = createSessionStore();

// Derived store for session statistics
export const sessionStats = derived(sessionStore.sessions, ($sessions) => {
	if ($sessions.length === 0) return null;

	// Collect all ratings from all questions across all sessions
	const allRatings: number[] = [];
	$sessions.forEach((session) => {
		Object.values(session.responses).forEach((response) => {
			if (response.rating !== undefined && response.rating > 0) {
				allRatings.push(response.rating);
			}
		});
	});

	const avgRating =
		allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;

	const totalDuration = $sessions.reduce((sum, s) => sum + s.duration, 0);
	const avgDuration = totalDuration / $sessions.length;

	return {
		totalSessions: $sessions.length,
		averageRating: avgRating,
		averageDuration: avgDuration,
		totalQuestions: $sessions.reduce((sum, s) => sum + Object.keys(s.responses).length, 0),
		sessions: $sessions
	};
});
