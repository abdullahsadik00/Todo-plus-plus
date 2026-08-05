'use client';

import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { FilterBar } from '@/components/FilterBar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useTaskStats } from '@/stores/selectors';

export default function Home() {
  const stats = useTaskStats();
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl
  mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4
  mb-6">
            <StatCard label="Total"
              value={stats.total} />
            <StatCard label="Active"
              value={stats.active} />
            <StatCard label="Completed"
              value={stats.completed} />
            <StatCard label="Overdue"
              value={stats.overdue} color="red" />
          </div>
          {/* Add Task */}
          <div className="mb-6">
            <AddTaskForm />
          </div>
          {/* Filters */}
          <FilterBar />
          {/* Task List */}
          <TaskList />
        </main>
      </div>
    </div>
  );
}
function StatCard({
  label,
  value,
  color = 'blue'
}: {
  label: string;
  value: number;
  color?: 'blue' | 'red' | 'green';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
  };
  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-75">{label}</p>
    </div>
  );
}