export interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    order: number;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export type FilterStatus = 'all' | 'completed' | 'active';
export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';