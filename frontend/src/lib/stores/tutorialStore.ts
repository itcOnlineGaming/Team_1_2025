import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface TutorialStep {
	id: string;
	title: string;
	description: string;
	page: string;
	elementId?: string;
	position?: 'top' | 'bottom' | 'left' | 'right';
}

export const tutorialSteps: TutorialStep[] = [
	{
		id: 'home-welcome',
		title: 'Welcome to Activity Tracker! 🎉',
		description:
			"This app helps you track your study sessions and stay motivated with rewards. Let's take a quick tour!",
		page: '/',
		position: 'bottom'
	},
	{
		id: 'home-create-task',
		title: 'Create Your First Task',
		description:
			'Click "Next" and we\'ll navigate you to the Tasks page where you can create and manage your study goals.',
		page: '/',
		elementId: 'create-first-task-btn',
		position: 'top'
	},
	{
		id: 'tasks-page',
		title: 'Tasks Page',
		description:
			"Here you can view all your tasks, create new ones, and track your progress. Let's explore!",
		page: '/tasks',
		position: 'bottom'
	},
	{
		id: 'tasks-create-btn',
		title: 'Create New Task',
		description:
			'This floating button lets you create a new task. You can set a title and goal for tracking your work.',
		page: '/tasks',
		elementId: 'create-task-btn',
		position: 'top'
	},
	{
		id: 'store-page',
		title: 'Reward Store 🌟',
		description:
			'Earn stars by completing sessions! Use them here to unlock rewards and stay motivated.',
		page: '/store',
		position: 'bottom'
	},
	{
		id: 'store-add-reward',
		title: 'Add Your Own Rewards',
		description: 'Create custom rewards that motivate you! Set the star cost and description.',
		page: '/store',
		elementId: 'add-reward-btn',
		position: 'bottom'
	},
	{
		id: 'results-page',
		title: 'Results & Analytics 📊',
		description:
			'View your progress over time with detailed charts and statistics about your study sessions.',
		page: '/results',
		position: 'bottom'
	},
	{
		id: 'home-final',
		title: "You're All Set! 🎯",
		description:
			'You now know the basics! Create tasks, start sessions, earn rewards, and track your progress. Good luck with your studies!',
		page: '/',
		position: 'bottom'
	}
];

interface TutorialState {
	isActive: boolean;
	currentStepIndex: number;
	completedSteps: string[];
	skipped: boolean;
}

const STORAGE_KEY = 'activity-tracker-tutorial-state';

function getInitialState(): TutorialState {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch (e) {
				console.error('Failed to parse tutorial state:', e);
			}
		}
	}
	return {
		isActive: false,
		currentStepIndex: 0,
		completedSteps: [],
		skipped: false
	};
}

function createTutorialStore() {
	const { subscribe, set, update } = writable<TutorialState>(getInitialState());

	function saveState(state: TutorialState) {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		}
	}

	return {
		subscribe,

		startTutorial() {
			update((state) => {
				const newState = { ...state, isActive: true, currentStepIndex: 0, skipped: false };
				saveState(newState);
				return newState;
			});
		},

		nextStep() {
			update((state) => {
				const currentStep = tutorialSteps[state.currentStepIndex];
				const completedSteps = [...state.completedSteps, currentStep.id];
				const currentStepIndex = state.currentStepIndex + 1;
				const isActive = currentStepIndex < tutorialSteps.length;

				const newState = {
					...state,
					currentStepIndex,
					completedSteps,
					isActive
				};
				saveState(newState);
				return newState;
			});
		},

		setStep(stepIndex: number) {
			update((state) => {
				// Mark all steps up to this index as completed
				const completedSteps = tutorialSteps.slice(0, stepIndex).map((step) => step.id);

				const isActive = stepIndex < tutorialSteps.length;

				const newState = {
					...state,
					currentStepIndex: stepIndex,
					completedSteps,
					isActive
				};
				saveState(newState);
				return newState;
			});
		},

		skipTutorial() {
			update((state) => {
				const newState = { ...state, isActive: false, skipped: true };
				saveState(newState);
				return newState;
			});
		},

		resetTutorial() {
			const newState = {
				isActive: false,
				currentStepIndex: 0,
				completedSteps: [],
				skipped: false
			};
			saveState(newState);
			set(newState);
		},

		completeStep(stepId: string) {
			update((state) => {
				if (!state.completedSteps.includes(stepId)) {
					const newState = {
						...state,
						completedSteps: [...state.completedSteps, stepId]
					};
					saveState(newState);
					return newState;
				}
				return state;
			});
		},

		isStepCompleted(stepId: string): boolean {
			const state = get({ subscribe });
			return state.completedSteps.includes(stepId);
		},

		getCurrentStep(): TutorialStep | null {
			const state = get({ subscribe });
			if (state.isActive && state.currentStepIndex < tutorialSteps.length) {
				return tutorialSteps[state.currentStepIndex];
			}
			return null;
		},

		shouldShowTutorial(): boolean {
			const state = get({ subscribe });
			return !state.skipped && state.completedSteps.length === 0;
		}
	};
}

export const tutorialStore = createTutorialStore();
