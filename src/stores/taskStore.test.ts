import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore, FALLBACK_CATEGORY_ID } from './taskStore';
import type { Task } from '@/types';

/** The store is a singleton, so each test starts from a known state. */
function resetStore() {
    // Optional-chained so these tests also run under a plain `node` environment,
    // where `persist` has no storage to talk to.
    globalThis.localStorage?.clear();
    useTaskStore.setState({
        tasks: [],
        categories: [
            { id: FALLBACK_CATEGORY_ID, name: 'Personal', color: '#3B82F6' },
            { id: 'work', name: 'Work', color: '#10B981' },
        ],
        filter: 'all',
        sortBy: 'order',
        searchQuery: '',
        selectedCategory: null,
    });
}

/** Only the fields addTask requires — id/createdAt/updatedAt/order are generated. */
function draft(overrides: Partial<Task> = {}) {
    return {
        title: 'Task',
        completed: false,
        priority: 'medium' as const,
        category: FALLBACK_CATEGORY_ID,
        ...overrides,
    };
}

const titles = () => useTaskStore.getState().tasks.map(t => t.title);

describe('taskStore', () => {
    beforeEach(resetStore);

    describe('addTask', () => {
        it('prepends new tasks and generates metadata', () => {
            useTaskStore.getState().addTask(draft({ title: 'First' }));
            useTaskStore.getState().addTask(draft({ title: 'Second' }));

            expect(titles()).toEqual(['Second', 'First']);

            const [newest] = useTaskStore.getState().tasks;
            expect(newest.id).toBeTruthy();
            expect(newest.createdAt).toBeInstanceOf(Date);
            expect(newest.updatedAt).toBeInstanceOf(Date);
        });

        it('keeps order contiguous from zero', () => {
            useTaskStore.getState().addTask(draft({ title: 'A' }));
            useTaskStore.getState().addTask(draft({ title: 'B' }));
            useTaskStore.getState().addTask(draft({ title: 'C' }));

            expect(useTaskStore.getState().tasks.map(t => t.order)).toEqual([0, 1, 2]);
        });
    });

    describe('toggleTasks', () => {
        it('flips completed', () => {
            useTaskStore.getState().addTask(draft());
            const { id } = useTaskStore.getState().tasks[0];

            useTaskStore.getState().toggleTasks(id);
            expect(useTaskStore.getState().tasks[0].completed).toBe(true);

            useTaskStore.getState().toggleTasks(id);
            expect(useTaskStore.getState().tasks[0].completed).toBe(false);
        });
    });

    describe('updateTask', () => {
        it('merges updates and bumps updatedAt', () => {
            useTaskStore.getState().addTask(draft({ title: 'Old', priority: 'low' }));
            const original = useTaskStore.getState().tasks[0];

            useTaskStore.getState().updateTask(original.id, { title: 'New' });

            const updated = useTaskStore.getState().tasks[0];
            expect(updated.title).toBe('New');
            expect(updated.priority).toBe('low');            // untouched fields survive
            expect(updated.createdAt).toEqual(original.createdAt);
            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
                original.updatedAt.getTime(),
            );
        });

        it('is a no-op for an unknown id', () => {
            useTaskStore.getState().addTask(draft({ title: 'Only' }));
            useTaskStore.getState().updateTask('does-not-exist', { title: 'Nope' });
            expect(titles()).toEqual(['Only']);
        });
    });

    describe('deleteTask', () => {
        it('removes the task and reindexes order', () => {
            ['A', 'B', 'C'].forEach(title => useTaskStore.getState().addTask(draft({ title })));
            // Insertion prepends, so the list reads C, B, A
            const b = useTaskStore.getState().tasks.find(t => t.title === 'B')!;

            useTaskStore.getState().deleteTask(b.id);

            expect(titles()).toEqual(['C', 'A']);
            expect(useTaskStore.getState().tasks.map(t => t.order)).toEqual([0, 1]);
        });
    });

    describe('reorderTasks', () => {
        it('moves a task by id, not by index', () => {
            ['A', 'B', 'C'].forEach(title => useTaskStore.getState().addTask(draft({ title })));
            // Current order: C, B, A
            const { tasks } = useTaskStore.getState();
            const a = tasks.find(t => t.title === 'A')!;
            const c = tasks.find(t => t.title === 'C')!;

            useTaskStore.getState().reorderTasks(a.id, c.id);

            expect(titles()).toEqual(['A', 'C', 'B']);
            expect(useTaskStore.getState().tasks.map(t => t.order)).toEqual([0, 1, 2]);
        });

        // The regression this fixes: the visible list is filtered/sorted, so callers
        // used to hand over indices that pointed at the wrong tasks.
        it('is unaffected by what the visible list contains', () => {
            ['A', 'B', 'C'].forEach(title => useTaskStore.getState().addTask(draft({ title })));
            const { tasks } = useTaskStore.getState();
            const before = titles();

            useTaskStore.getState().reorderTasks(tasks[0].id, tasks[0].id);   // same id
            expect(titles()).toEqual(before);

            useTaskStore.getState().reorderTasks('ghost', tasks[1].id);       // unknown id
            expect(titles()).toEqual(before);
        });
    });

    describe('deleteCategory', () => {
        it('reassigns orphaned tasks to the fallback category', () => {
            useTaskStore.getState().addTask(draft({ title: 'Work task', category: 'work' }));
            useTaskStore.getState().addTask(draft({ title: 'Personal task' }));

            useTaskStore.getState().deleteCategory('work');

            expect(useTaskStore.getState().categories.map(c => c.id)).toEqual([
                FALLBACK_CATEGORY_ID,
            ]);
            expect(
                useTaskStore.getState().tasks.every(t => t.category === FALLBACK_CATEGORY_ID),
            ).toBe(true);
        });

        it('refuses to delete the fallback category', () => {
            useTaskStore.getState().deleteCategory(FALLBACK_CATEGORY_ID);
            expect(
                useTaskStore.getState().categories.some(c => c.id === FALLBACK_CATEGORY_ID),
            ).toBe(true);
        });
    });

    describe('addCategory', () => {
        it('appends with a generated id', () => {
            useTaskStore.getState().addCategory({ name: 'Errands', color: '#EF4444' });

            const added = useTaskStore.getState().categories.at(-1)!;
            expect(added.name).toBe('Errands');
            expect(added.id).toBeTruthy();
        });
    });

    describe('clearCompletedTasks', () => {
        it('drops completed tasks and reindexes order', () => {
            ['A', 'B', 'C'].forEach(title => useTaskStore.getState().addTask(draft({ title })));
            const b = useTaskStore.getState().tasks.find(t => t.title === 'B')!;
            useTaskStore.getState().toggleTasks(b.id);

            useTaskStore.getState().clearCompletedTasks();

            expect(titles()).toEqual(['C', 'A']);
            expect(useTaskStore.getState().tasks.map(t => t.order)).toEqual([0, 1]);
        });
    });
});
