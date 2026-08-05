'use client';

import { CheckCircle2, ListTodo } from 'lucide-react';
import { useTaskStats } from '@/stores/selectors';

export function Header() {
    const stats = useTaskStats();
    const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

    return (
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <ListTodo className="w-6 h-6 text-blue-500" />
                <h1 className="text-lg font-semibold text-gray-900">Todo++</h1>
            </div>

            {/* Progress */}
            <div className="ml-auto flex items-center gap-3">
                <div
                    className="hidden sm:block w-32 h-2 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Tasks completed"
                >
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="flex items-center gap-1.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {stats.completed} of {stats.total} done
                </p>

                {stats.overdue > 0 && (
                    <p className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                        {stats.overdue} overdue
                    </p>
                )}
            </div>
        </header>
    )
}
