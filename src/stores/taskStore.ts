import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { Task, Category, FilterStatus, SortOption } from "@/types";

/** Tasks whose category is deleted fall back to this category, which can't be deleted. */
export const FALLBACK_CATEGORY_ID = 'personal';

interface TaskState {
    tasks: Task[];
    categories: Category[];
    filter: FilterStatus;
    sortBy: SortOption;
    searchQuery: string;
    selectedCategory: string | null;

    // Actions
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTasks: (id: string) => void;
    reorderTasks: (activeId: string, overId: string) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    setFilter: (filter: FilterStatus) => void;
    setSortBy: (sortBy: SortOption) => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (categoryId: string | null) => void;
    clearCompletedTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        immer((set) => ({
            tasks: [],
            categories: [
                { id: FALLBACK_CATEGORY_ID, name: 'Personal', color: '#3B82F6' },
                { id: 'work', name: 'Work', color: '#10B981' },
                { id: 'shopping', name: 'Shopping', color: '#F59E0B' },
            ],
            filter: 'all',
            sortBy: 'order',
            searchQuery: '',
            selectedCategory: null,

            addTask: (taskData) => {
                set((state) => {
                    const newTask: Task = {
                        ...taskData,
                        id: crypto.randomUUID(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        order: 0
                    };
                    state.tasks.unshift(newTask);
                    state.tasks.forEach((task, index) => {
                        task.order = index;
                    })
                })
            },

            updateTask: (id, updates) => {
                set((state) => {
                    const taskIndex = state.tasks.findIndex(task => task.id === id);
                    if (taskIndex !== -1) {
                        state.tasks[taskIndex] = {
                            ...state.tasks[taskIndex], ...updates,
                            updatedAt: new Date()
                        }
                    }
                })
            },

            deleteTask: (id) => {
                set((state) => {
                    state.tasks = state.tasks.filter(task => task.id !== id);
                    state.tasks.forEach((task, index) => {
                        task.order = index;
                    })
                })
            },

            toggleTasks: (id) => {
                set((state) => {
                    const taskIndex = state.tasks.find(task => task.id === id);
                    if (taskIndex) {
                        taskIndex.completed = !taskIndex.completed;
                        taskIndex.updatedAt = new Date();
                    }
                })
            },

            // Takes ids, not indices: the list the user drags in is filtered and sorted,
            // so its indices don't line up with the full `tasks` array.
            reorderTasks: (activeId, overId) => {
                set((state) => {
                    const from = state.tasks.findIndex(task => task.id === activeId);
                    const to = state.tasks.findIndex(task => task.id === overId);
                    if (from === -1 || to === -1 || from === to) return;

                    const [removed] = state.tasks.splice(from, 1)
                    state.tasks.splice(to, 0, removed)
                    state.tasks.forEach((task, index) => {
                        task.order = index;
                    })
                })
            },

            addCategory: (categoryData) => {
                set((state) => {
                    state.categories.push({
                        ...categoryData,
                        id: crypto.randomUUID()
                    })
                })
            },

            deleteCategory: (id) => {
                if (id === FALLBACK_CATEGORY_ID) return;
                set((state) => {
                    state.categories = state.categories.filter(category => category.id !== id);
                    state.tasks.forEach(task => {
                        if (task.category === id) {
                            task.category = FALLBACK_CATEGORY_ID;
                            task.updatedAt = new Date();
                        }
                    })
                })
            },

            setFilter: (filter) => {
                set({ filter })
            },

            setSortBy: (sortBy) => {
                set({ sortBy })
            },

            setSearchQuery: (searchQuery) => {
                set({ searchQuery })
            },

            setSelectedCategory: (selectedCategory) => {
                set({ selectedCategory })
            },

            clearCompletedTasks: () => {
                set((state) => {
                    state.tasks = state.tasks.filter(task => !task.completed)
                    state.tasks.forEach((task, index) => {
                        task.order = index;
                    })
                })
            }
        })),
        {
            name: 'task-storage',
            partialize: (state) => ({
                tasks: state.tasks,
                categories: state.categories,
            }),

            onRehydrateStorage: () => (state) => {
                state?.tasks.forEach((t) => {
                    t.createdAt = new Date(t.createdAt);
                    t.updatedAt = new Date(t.updatedAt);
                    if (t.dueDate) t.dueDate = new Date(t.dueDate);
                });
            }
        }
    )
)