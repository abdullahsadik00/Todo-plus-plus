'use client';

import { useState } from 'react';
import { AlertTriangle, CalendarClock, X } from 'lucide-react';
import { useDueReminders } from '@/hooks/useDueReminders';
import { useTaskStore } from '@/stores/taskStore';

/**
 * In-app reminder strip. Deliberately not the browser Notification API — that needs a
 * permission prompt and only fires when the tab is backgrounded, neither of which is
 * useful for a local task list.
 */
export function DueReminderBanner() {
    const { dueToday, overdue, hasReminders } = useDueReminders();
    const setFilter = useTaskStore(state => state.setFilter);
    const setSortBy = useTaskStore(state => state.setSortBy);

    // Dismissal is per-session only — it isn't in `persist`, so a reload brings it back.
    const [dismissed, setDismissed] = useState(false);

    if (!hasReminders || dismissed) return null;

    const showDueSoon = () => {
        setFilter('active');
        setSortBy('dueDate');
    };

    return (
        <div
            className="mb-6 flex flex-wrap items-center gap-3 p-4 bg-amber-50 rounded-lg shadow-sm"
            role="status"
            aria-live="polite"
        >
            {overdue.length > 0 ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            ) : (
                <CalendarClock className="w-5 h-5 shrink-0 text-amber-600" />
            )}

            <p className="text-sm text-amber-900">
                {overdue.length > 0 && (
                    <span className="font-medium">
                        {overdue.length} {overdue.length === 1 ? 'task is' : 'tasks are'} overdue
                    </span>
                )}
                {overdue.length > 0 && dueToday.length > 0 && ' · '}
                {dueToday.length > 0 && (
                    <span>
                        {dueToday.length} {dueToday.length === 1 ? 'task is' : 'tasks are'} due today
                    </span>
                )}
            </p>

            <button
                type="button"
                onClick={showDueSoon}
                className="px-3 py-1.5 text-sm font-medium text-amber-900 rounded hover:bg-amber-100"
            >
                Show them
            </button>

            <button
                type="button"
                onClick={() => setDismissed(true)}
                className="ml-auto p-1.5 rounded hover:bg-amber-100"
                aria-label="Dismiss reminders"
            >
                <X className="w-4 h-4 text-amber-700" />
            </button>
        </div>
    );
}
