import { writable } from 'svelte/store';

export interface Task {
    id: string;
    name: string;
    goal?: string;
    createdAt: number;
    completedAt?: number;
    result?: Record<string, any>;
}

function createTaskStore() {
    const key = 'tasks';
    const { subscribe, set, update } = writable<Task[]>([]);

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const raw: any[] = JSON.parse(stored);
                // strip legacy description field if present
                const cleaned = raw.map(({ description, ...rest }) => rest);
                set(cleaned);
            } catch (err) {
                console.error('Failed parsing tasks from localStorage:', err);
                localStorage.removeItem(key);
            }
        }
    }

    subscribe((value) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    });

    return {
        subscribe,
        addTask: (task: Omit<Task, 'id' | 'createdAt'>) => {
            const t: Task = { id: `task-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, createdAt: Date.now(), ...task };
            update((list) => [t, ...list]);
            return t;
        },
        updateTask: (taskId: string, updates: Partial<Task>) =>
            update((list) => list.map((t) => (t.id === taskId ? { ...t, ...updates } : t))),
        removeTask: (taskId: string) => update((list) => list.filter((t) => t.id !== taskId)),
        reorderTasks: (reorderedTasks: Task[]) => set(reorderedTasks),
        completeTask: (taskId: string, result?: Record<string, any>) =>
            update((list) => list.map((t) => (t.id === taskId ? { ...t, completedAt: Date.now(), result } : t))),
        clearAll: () => set([])
    };
}

export const taskStore = createTaskStore();
