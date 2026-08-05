'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useTaskStats } from '@/stores/selectors';
import { cn } from '@/lib/utils';
import type { FilterStatus, SortOption } from '@/types';

const FILTERS: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'createdAt', label: 'Created' },
    { value: 'updatedAt', label: 'Updated' },
    { value: 'dueDate', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
]

export function FilterBar() {
    const filter = useTaskStore(state => state.filter);
    const sortBy = useTaskStore(state => state.sortBy);
    const searchQuery = useTaskStore(state => state.searchQuery);
    const setFilter = useTaskStore(state => state.setFilter);
    const setSortBy = useTaskStore(state => state.setSortBy);
    const setSearchQuery = useTaskStore(state => state.setSearchQuery);
    const clearCompletedTasks = useTaskStore(state => state.clearCompletedTasks);
    const stats = useTaskStats();

    // Local input state keeps typing responsive; pushed to the store on a debounce
    const [query, setQuery] = useState(searchQuery);

    useEffect(() => {
        const timeout = setTimeout(() => setSearchQuery(query), 250);
        return () => clearTimeout(timeout);
    }, [query, setSearchQuery])

    const counts: Record<FilterStatus, number> = {
        all: stats.total,
        active: stats.active,
        completed: stats.completed,
    }

    return (
        <div className="mb-4 space-y-3 p-4 bg-white rounded-lg border shadow-sm">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tasks..."
                    aria-label="Search tasks"
                    className="w-full pl-9 pr-9 py-2 border rounded outline-none focus:border-blue-500"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <div
                    className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg"
                    role="group"
                    aria-label="Filter by status"
                >
                    {FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            aria-pressed={filter === value}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                filter === value
                                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                                    : 'text-gray-600 hover:text-gray-900',
                            )}
                        >
                            {label}
                            <span className="ml-1.5 text-xs text-gray-400">{counts[value]}</span>
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-by" className="text-sm text-gray-600">
                        Sort by
                    </label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="border rounded px-3 py-1.5 text-sm"
                    >
                        {SORT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Completed */}
                <button
                    type="button"
                    onClick={clearCompletedTasks}
                    disabled={stats.completed === 0}
                    className="ml-auto px-3 py-1.5 text-sm text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    Clear completed
                </button>
            </div>
        </div>
    )
}
