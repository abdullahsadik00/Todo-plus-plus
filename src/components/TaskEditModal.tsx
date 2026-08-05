'use client';

import { useEffect, useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { parseDateInput, toDateInputValue } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskEditModalProps {
    task: Task;
    onClose: () => void;
}

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
    const updateTask = useTaskStore(state => state.updateTask);
    const categories = useTaskStore(state => state.categories);

    // Seeded once from the task, then owned by the form. Edits are only committed
    // to the store on save, so Cancel genuinely discards them.
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? '');
    const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
    const [priority, setPriority] = useState<Task['priority']>(task.priority);
    const [category, setCategory] = useState(task.category);

    // Escape closes the dialog — expected of anything modal.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        updateTask(task.id, {
            title: trimmed,
            description: description.trim() || undefined,
            dueDate: parseDateInput(dueDate),
            priority,
            category,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            // Clicking the backdrop closes; clicks inside the panel must not bubble up.
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded shadow-xl w-full max-w-md"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-task-heading"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="edit-task-heading" className="text-lg font-semibold mb-4">Edit Task</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            id="edit-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                            className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm px-3 py-1.5"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md resize-none shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm px-3 py-1.5"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="edit-due-date" className="block text-sm font-medium text-gray-700">
                            Due Date
                        </label>
                        <input
                            id="edit-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm px-3 py-1.5"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700">
                            Priority
                        </label>
                        <select
                            id="edit-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Task['priority'])}
                            className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm px-3 py-1.5"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            id="edit-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm px-3 py-1.5"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
