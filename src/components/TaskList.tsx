'use client';

import { useFilteredTasks } from "@/stores/selectors";
import { useTaskStore } from "@/stores/taskStore";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskItem } from "./TaskItem";

export function TaskList() {
    const tasks = useFilteredTasks();
    const sortBy = useTaskStore((state) => state.sortBy);
    const reorderTasks = useTaskStore((state) => state.reorderTasks);

    // Manual reordering only makes sense while the list is showing manual order.
    const canReorder = sortBy === 'order';

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // dnd-kit reports what moved; the store owns the data. Pass ids, not indices —
    // this list is filtered and sorted, so its indices don't match the store's array.
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderTasks(String(active.id), String(over.id));
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No task found</p>
                <p className="text-sm">Add a task to get started</p>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
                items={tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                    {tasks.map(task => (
                        <TaskItem key={task.id} task={task} canReorder={canReorder} />
                    ))}
                </ul>

            </SortableContext>

        </DndContext>
    )
}
