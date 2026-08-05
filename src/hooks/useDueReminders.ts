'use client';

import { useEffect, useMemo, useState } from 'react';
import { isToday, isPast } from 'date-fns';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';

export interface DueReminders {
    dueToday: Task[];
    overdue: Task[];
    /** True when there is anything worth showing the user. */
    hasReminders: boolean;
}

/**
 * Derives the "needs attention today" buckets from the task list.
 *
 * Note the `tick` state: `isToday` / `isPast` are evaluated against the wall clock,
 * which React has no way to know has changed. Without a timer, a tab left open
 * overnight would keep insisting yesterday's tasks are "due today". Re-rendering
 * every minute keeps the buckets honest.
 */
export function useDueReminders(intervalMs = 60_000): DueReminders {
    const tasks = useTaskStore(state => state.tasks);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return useMemo(() => {
        const pending = tasks.filter(task => !task.completed && task.dueDate);

        const dueToday = pending.filter(task => isToday(new Date(task.dueDate!)));
        const overdue = pending.filter(
            task => isPast(new Date(task.dueDate!)) && !isToday(new Date(task.dueDate!)),
        );

        return {
            dueToday,
            overdue,
            hasReminders: dueToday.length > 0 || overdue.length > 0,
        };
        // `tick` is a deliberate dependency and the lint rule can't see why: it is the
        // only thing that makes the clock-based predicates above re-evaluate.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, tick]);
}
