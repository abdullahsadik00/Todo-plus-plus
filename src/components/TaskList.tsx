import { useFilteredTasks } from "@/stores/selectors";
import { useTaskStore } from "@/stores/taskStore";
import { DndContext,closestCenter,KeyboardSensor,PointerSensor,useSensor,useSensors,DragEndEvent } from "@dnd-kit/core";
import { SortableContext,sortableKeyboardCoordinates,verticalListSortingStrategy } from "@dnd-kit/sortable";
import {TaskItem} from "./TaskItem";