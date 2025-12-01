import { writable } from 'svelte/store';

export interface Task {
    id: string;
    name: string;
    description?: string;
    goal?: string;
    createdAt: number;
}

function createTaskStore() {
    const key = 'tasks';
    const { subscribe, set, update } = writable<Task[]>([]);

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                set(JSON.parse(stored));
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
        clearAll: () => set([])
    };
}

export const taskStore = createTaskStore();
