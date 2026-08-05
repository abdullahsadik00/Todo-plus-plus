import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskStore, FALLBACK_CATEGORY_ID } from './taskStore';
import { useFilteredTasks, useTaskStats } from './selectors';
import type { Task } from '@/types';

const DAY = 24 * 60 * 60 * 1000;
const yesterday = new Date(Date.now() - DAY);
const tomorrow = new Date(Date.now() + DAY);

/**
 * Seeds `tasks` directly rather than going through addTask, so each fixture can pin
 * its own order/priority/dates without fighting the store's insertion logic.
 */
function seed(tasks: Partial<Task>[]) {
    globalThis.localStorage?.clear();
    useTaskStore.setState({
        tasks: tasks.map((t, i) => ({
            id: `id-${i}`,
            title: `Task ${i}`,
            completed: false,
            priority: 'medium',
            category: FALLBACK_CATEGORY_ID,
            createdAt: new Date(2026, 0, 1 + i),
            updatedAt: new Date(2026, 0, 1 + i),
            order: i,
            ...t,
        })),
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

const filteredTitles = () => renderHook(() => useFilteredTasks()).result.current.map(t => t.title);

describe('useFilteredTasks', () => {
    beforeEach(() => seed([]));

    it('returns everything by default', () => {
        seed([{ title: 'A' }, { title: 'B' }]);
        expect(filteredTitles()).toEqual(['A', 'B']);
    });

    describe('status filter', () => {
        it('narrows to active', () => {
            seed([{ title: 'Open' }, { title: 'Done', completed: true }]);
            useTaskStore.setState({ filter: 'active' });
            expect(filteredTitles()).toEqual(['Open']);
        });

        it('narrows to completed', () => {
            seed([{ title: 'Open' }, { title: 'Done', completed: true }]);
            useTaskStore.setState({ filter: 'completed' });
            expect(filteredTitles()).toEqual(['Done']);
        });
    });

    describe('category filter', () => {
        it('narrows to the selected category', () => {
            seed([{ title: 'Home' }, { title: 'Office', category: 'work' }]);
            useTaskStore.setState({ selectedCategory: 'work' });
            expect(filteredTitles()).toEqual(['Office']);
        });
    });

    // The regression: the filter callback used braces without `return`, so it returned
    // undefined and every search produced an empty list.
    describe('search', () => {
        it('matches on title, case-insensitively', () => {
            seed([{ title: 'Buy Milk' }, { title: 'Walk dog' }]);
            useTaskStore.setState({ searchQuery: 'milk' });
            expect(filteredTitles()).toEqual(['Buy Milk']);
        });

        it('matches on description', () => {
            seed([
                { title: 'Errand', description: 'pick up dry cleaning' },
                { title: 'Other' },
            ]);
            useTaskStore.setState({ searchQuery: 'cleaning' });
            expect(filteredTitles()).toEqual(['Errand']);
        });

        it('does not throw on tasks with no description', () => {
            seed([{ title: 'No description here' }]);
            useTaskStore.setState({ searchQuery: 'zzz' });
            expect(filteredTitles()).toEqual([]);
        });
    });

    describe('sorting', () => {
        it('sorts by manual order', () => {
            seed([{ title: 'Third', order: 2 }, { title: 'First', order: 0 }, { title: 'Second', order: 1 }]);
            useTaskStore.setState({ sortBy: 'order' });
            expect(filteredTitles()).toEqual(['First', 'Second', 'Third']);
        });

        it('sorts by priority, high first', () => {
            seed([
                { title: 'Low', priority: 'low' },
                { title: 'High', priority: 'high' },
                { title: 'Medium', priority: 'medium' },
            ]);
            useTaskStore.setState({ sortBy: 'priority' });
            expect(filteredTitles()).toEqual(['High', 'Medium', 'Low']);
        });

        it('sorts by due date, undated last', () => {
            seed([
                { title: 'Undated' },
                { title: 'Later', dueDate: tomorrow },
                { title: 'Sooner', dueDate: yesterday },
            ]);
            useTaskStore.setState({ sortBy: 'dueDate' });
            expect(filteredTitles()).toEqual(['Sooner', 'Later', 'Undated']);
        });

        it('sorts by createdAt, oldest first', () => {
            seed([{ title: 'Older' }, { title: 'Newer' }]);   // createdAt increments per index
            useTaskStore.setState({ sortBy: 'createdAt' });
            expect(filteredTitles()).toEqual(['Older', 'Newer']);
        });
    });

    it('composes filter, search, and sort together', () => {
        seed([
            { title: 'Report draft', category: 'work', priority: 'low' },
            { title: 'Report final', category: 'work', priority: 'high' },
            { title: 'Report done', category: 'work', completed: true, priority: 'high' },
            { title: 'Report personal', priority: 'high' },
        ]);
        useTaskStore.setState({
            filter: 'active',
            selectedCategory: 'work',
            searchQuery: 'report',
            sortBy: 'priority',
        });
        expect(filteredTitles()).toEqual(['Report final', 'Report draft']);
    });

    it('does not mutate the store array while sorting', () => {
        seed([{ title: 'B', order: 1 }, { title: 'A', order: 0 }]);
        const before = useTaskStore.getState().tasks.map(t => t.title);
        renderHook(() => useFilteredTasks());
        expect(useTaskStore.getState().tasks.map(t => t.title)).toEqual(before);
    });
});

describe('useTaskStats', () => {
    it('counts total, active, completed, and overdue', () => {
        seed([
            { title: 'Open' },
            { title: 'Done', completed: true },
            { title: 'Overdue', dueDate: yesterday },
            { title: 'Overdue but done', completed: true, dueDate: yesterday },
            { title: 'Upcoming', dueDate: tomorrow },
        ]);

        const { result } = renderHook(() => useTaskStats());
        expect(result.current).toEqual({
            total: 5,
            active: 3,
            completed: 2,
            overdue: 1,          // completed tasks never count as overdue
        });
    });

    it('handles an empty list', () => {
        seed([]);
        const { result } = renderHook(() => useTaskStats());
        expect(result.current).toEqual({ total: 0, active: 0, completed: 0, overdue: 0 });
    });
});
