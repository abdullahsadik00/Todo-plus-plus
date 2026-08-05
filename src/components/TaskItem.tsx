import { useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isToday, isPast, format } from "date-fns";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { toggleTasks, deleteTask, updateTask } = useTaskStore();
    const categories = useTaskStore(state => state.categories);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const category = categories.find(c => c.id === task.category);
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed
    const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    }
    return (
        <li
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm',
                'transition-all duration-200',
                isDragging && 'opacity-50 shadow-lg',
                task.completed && 'opacity-60',
            )}>
            {/* Drag Handle */}
            <button
                {...listeners}
                {...attributes} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded" aria-label="Drag to reorder">
                <GripVertical className="w-4 h-4 text-gray-400" />
            </button>

            {/* Checkbox */}
            <button onClick={() => toggleTasks(task.id)} className={cn(
                'w-5 h-5 rounded-full ring-2 ring-inset shrink-0',
                'flex items-center justify-center transition-colors',
                task.completed ? 'bg-green-500 ring-green-500 text-white' : 'ring-gray-300 hover:ring-green-500',
            )} aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}>
                {task.completed && <Check className="w-3 h-3" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'font-medium truncate',
                            task.completed && 'line-through text-gray-500',
                        )}>
                        {task.title}
                    </span>
                    {/* Category Badge */}
                    {category && (
                        <span className="px-2 py-0.5 text-xs rounded-full"
                            style={{
                                backgroundColor: `${category.color}20`,
                                color: `${category.color}`
                            }}>
                            {category.name}
                        </span>
                    )}
                    {/* Priority Badge */}
                    <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        priorityColors[task.priority]
                    )}>
                        {task.priority}
                    </span>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-sm text-gray-500 truncate mt-1" >
                        {task.description}
                    </p>
                )}

                {/* Due Date */}
                {task.dueDate && (
                    <p className={cn(
                        'text-xs mt-1',
                        isOverdue && 'text-red-600 font-medium',
                        'text-orange-600',
                        isDueToday && !isOverdue &&
                        !isOverdue && !isDueToday &&
                        'text-gray-500'
                    )}>
                        {isOverdue && '⚠ '}
                        Due: {format(new Date(task.dueDate),
                            'MMM d, yyyy')}
                        {isDueToday && ' (Today)'}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded" aria-label="Edit task">
                    <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-red-100 rounded"
                    aria-label="Delete task"
                >
                    <Trash2 className="w-4 h-4 text-red-500"
                    />
                </button>
            </div>
            {/* Edit Modal */}
            {isEditing && (
                // <TaskEditModal
                //     task={task}
                //     onClose={() => setIsEditing(false)}
                // />
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
                        {/* Form fields for editing the task */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Handle form submission and update the task
                            setIsEditing(false);
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" defaultValue={task.title} className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea defaultValue={task.description} className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input type="date" defaultValue={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''} className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select defaultValue={task.priority} className="mt-1 block w-full rounded-md shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </li>
    )
}