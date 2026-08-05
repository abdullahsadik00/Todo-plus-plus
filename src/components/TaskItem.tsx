'use client';

import { useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isToday, isPast, format } from "date-fns";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";
import { TaskEditModal } from "./TaskEditModal";

interface TaskItemProps {
    task: Task;
    canReorder?: boolean;
}

export function TaskItem({ task, canReorder = true }: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);

    // One selector per value. Calling useTaskStore() bare would subscribe this row to
    // the whole store, so every task would re-render on any change — including typing
    // in the search box.
    const toggleTasks = useTaskStore(state => state.toggleTasks);
    const deleteTask = useTaskStore(state => state.deleteTask);
    const categories = useTaskStore(state => state.categories);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, disabled: !canReorder });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const category = categories.find(c => c.id === task.category);
    const isDueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;
    // Due today is already "past" for most of the day, so overdue must exclude it.
    const isOverdue = task.dueDate
        ? isPast(new Date(task.dueDate)) && !isDueToday && !task.completed
        : false;

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
            {/* Drag Handle — only this element starts a drag, not the whole row */}
            <button
                {...listeners}
                {...attributes}
                disabled={!canReorder}
                className={cn(
                    'p-1 rounded',
                    canReorder
                        ? 'cursor-grab active:cursor-grabbing hover:bg-gray-100'
                        : 'cursor-not-allowed opacity-40',
                )}
                aria-label={canReorder ? "Drag to reorder" : "Reordering unavailable while sorted"}
                title={canReorder ? undefined : "Switch Sort by to Manual order to reorder tasks"}>
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

                {/* Due Date — red if overdue, orange if due today, gray otherwise */}
                {task.dueDate && (
                    <p className={cn(
                        'text-xs mt-1',
                        isOverdue
                            ? 'text-red-600 font-medium'
                            : isDueToday
                                ? 'text-orange-600'
                                : 'text-gray-500',
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
                <TaskEditModal
                    task={task}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </li>
    )
}
