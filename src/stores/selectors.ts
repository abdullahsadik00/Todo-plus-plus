import { useMemo } from "react";
import { useTaskStore } from './taskStore'

export function useFilteredTasks() {
    const tasks = useTaskStore(state => state.tasks);
    const filter = useTaskStore(state => state.filter);
    const searchQuery = useTaskStore(state => state.searchQuery);
    const selectedCategory = useTaskStore(state => state.selectedCategory);
    const sortBy = useTaskStore(state => state.sortBy);

    return useMemo(() => {
        let filtered = [...tasks];

        // Filter by status
        if (filter === 'active') {
            filtered = filtered.filter(task => task.completed === false);
        } else if (filter === 'completed') {
            filtered = filtered.filter(task => task.completed === true);
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(task => task.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(query) ||
                (task.description?.toLowerCase().includes(query) ?? false)
            )
        }

        // Sort tasks
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'order':
                    // Manual drag order
                    return a.order - b.order;
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'priority': {
                    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                case 'createdAt':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'updatedAt':
                    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                default:
                    return 0;
            }
        })
        return filtered;
    }, [tasks, filter, sortBy, searchQuery, selectedCategory]);
}

export function useTaskStats(){
    const tasks = useTaskStore(state => state.tasks);
    return useMemo(()=>({
        total:     tasks.length,
        active:    tasks.filter((t) => !t.completed).length,
        completed: tasks.filter((t) => t.completed).length,
        overdue:  tasks.filter((t) => t.dueDate && t.dueDate < new Date() && !t.completed).length
    }), [tasks])
}