'use client';

import { useState } from 'react';
import { Inbox, Plus, Trash2, X } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';

const NEW_CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function Sidebar() {
    const tasks = useTaskStore(state => state.tasks);
    const categories = useTaskStore(state => state.categories);
    const selectedCategory = useTaskStore(state => state.selectedCategory);
    const setSelectedCategory = useTaskStore(state => state.setSelectedCategory);
    const addCategory = useTaskStore(state => state.addCategory);
    const deleteCategory = useTaskStore(state => state.deleteCategory);

    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');

    // Only open tasks are worth counting in the nav
    const countFor = (categoryId: string) =>
        tasks.filter(task => task.category === categoryId && !task.completed).length;

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        addCategory({
            name: trimmed,
            color: NEW_CATEGORY_COLORS[categories.length % NEW_CATEGORY_COLORS.length],
        });
        setName('');
        setIsAdding(false);
    }

    return (
        <aside className="w-64 shrink-0 p-4 border-r bg-white min-h-screen">
            <nav aria-label="Categories">
                <h2 className="px-3 mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Categories
                </h2>

                <ul className="space-y-1">
                    {/* All Tasks */}
                    <li>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            aria-current={selectedCategory === null ? 'page' : undefined}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                                selectedCategory === null
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100',
                            )}
                        >
                            <Inbox className="w-4 h-4 shrink-0" />
                            <span className="flex-1 text-left truncate">All Tasks</span>
                            <span className="text-xs text-gray-400">
                                {tasks.filter(task => !task.completed).length}
                            </span>
                        </button>
                    </li>

                    {categories.map(category => {
                        const isSelected = selectedCategory === category.id;
                        return (
                            <li key={category.id} className="group flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory(category.id)}
                                    aria-current={isSelected ? 'page' : undefined}
                                    className={cn(
                                        'flex-1 min-w-0 flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                                        isSelected
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1 text-left truncate">{category.name}</span>
                                    <span className="text-xs text-gray-400">{countFor(category.id)}</span>
                                </button>

                                {/* 'personal' is the fallback category tasks are moved to, so it stays */}
                                {category.id !== 'personal' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) setSelectedCategory(null);
                                            deleteCategory(category.id);
                                        }}
                                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 focus:opacity-100"
                                        aria-label={`Delete category ${category.name}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Add Category */}
                {isAdding ? (
                    <form onSubmit={handleAddCategory} className="mt-3 flex items-center gap-1">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name"
                            aria-label="New category name"
                            autoFocus
                            className="flex-1 min-w-0 px-3 py-1.5 text-sm border rounded outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setName('');
                                setIsAdding(false);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            aria-label="Cancel"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4" />
                        Add category
                    </button>
                )}
            </nav>
        </aside>
    )
}
