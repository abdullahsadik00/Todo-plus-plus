'use client';

import { useTaskStore } from "@/stores/taskStore";
import { parseDateInput } from "@/lib/utils";
import { NEW_TASK_INPUT_ID } from "@/hooks/useKeyboardShortcuts";
import { useState } from "react";

export function AddTaskForm() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>("medium");
    const [category, setCategory] = useState<string>('personal');

    // Per-value selectors, so this form doesn't re-render on unrelated store changes.
    const addTask = useTaskStore(state => state.addTask);
    const categories = useTaskStore(state => state.categories);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            title: title.trim(),
            description: description.trim() || undefined,
            dueDate: parseDateInput(dueDate),
            priority,
            category: category,
            completed: false,
        });

        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("medium");
        setCategory("personal");
        setIsExpanded(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isExpanded) {
            e.preventDefault();
            if (title.trim()) {
                handleSubmit(e)
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
                <input
                    id={NEW_TASK_INPUT_ID}
                    type="text"
                    placeholder="Add a new task... (press n)"
                    aria-label="New task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 outline-none text-lg" />
                {!isExpanded && (
                    <button type="button" onClick={() => setIsExpanded(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Add</button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4 pl-8">
                    <textarea value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full p-2 rounded resize-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                    />
                    <div className="flex flex-wrap gap-4">
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                                className="rounded px-3 py-1.5 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>

                            </select>
                        </div>
                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input type="date"
                                value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded px-3 py-1.5 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="rounded px-3 py-1.5 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsExpanded(false);
                                setTitle('');
                                setDescription('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-2 bg-blue-500
text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            Add Task
                        </button>
                    </div>

                </div>
            )}
        </form>
    )
}