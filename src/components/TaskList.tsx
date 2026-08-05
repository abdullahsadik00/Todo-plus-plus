import { useFilteredTasks } from "@/stores/selectors";
import { useTaskStore } from "@/stores/taskStore";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskItem } from "./TaskItem";

export function TaskList() {
    const tasks = useFilteredTasks();
    const reorderTasks = useTaskStore((state) => state.reorderTasks);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex(task => task.id === active.id);
            const newIndex = tasks.findIndex(task => task.id === over.id);
            reorderTasks(oldIndex, newIndex);
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
                        <TaskItem key={task.id} task={task} />
                    ))}
                </ul>

            </SortableContext>

        </DndContext>
    )
}