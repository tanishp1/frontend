'use client';
import { useState, useEffect, useCallback } from 'react';
import { Task, Stats } from '@/lib/types';
import { fetchTasks, fetchStats, createTask, updateTask, deleteTask } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import StatsBar from '@/components/StatsBar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import FilterBar from '@/components/FilterBar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'kanban'>('grid');
  const [backendError, setBackendError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setBackendError('');
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [t, s] = await Promise.all([fetchTasks(params), fetchStats()]);
      setTasks(t);
      setStats(s);
    } catch (err: unknown) {
      setBackendError(err instanceof Error ? err.message : 'Cannot connect to backend');
    } finally { setLoading(false); }
  }, [filters.status, filters.priority]);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const filteredTasks = tasks.filter(t =>
    !filters.search || t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleSave = async (data: Partial<Task>) => {
    if (editTask) await updateTask(editTask.id, data);
    else await createTask(data);
    setModalOpen(false);
    setEditTask(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) { await deleteTask(id); loadData(); }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
    loadData();
  };

  const kanbanCols: { key: Task['status']; label: string; color: string }[] = [
    { key: 'todo', label: '📌 To Do', color: 'border-blue-300 bg-blue-50' },
    { key: 'in-progress', label: '⚡ In Progress', color: 'border-amber-300 bg-amber-50' },
    { key: 'done', label: '✅ Done', color: 'border-emerald-300 bg-emerald-50' },
  ];

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Navbar view={view} onViewChange={setView} onNewTask={() => { setEditTask(null); setModalOpen(true); }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name} 👋</p>
        </div>

        {backendError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <span>⚠️</span> <span>{backendError} — Make sure the backend is running on port 5000.</span>
          </div>
        )}
        <StatsBar stats={stats} />
        <FilterBar filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks found</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first task to get started</p>
            <button onClick={() => { setEditTask(null); setModalOpen(true); }} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md">
              + Create Task
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={t => { setEditTask(t); setModalOpen(true); }} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kanbanCols.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.key);
              return (
                <div key={col.key} className={`rounded-2xl border-2 ${col.color} p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                    <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{colTasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onEdit={t => { setEditTask(t); setModalOpen(true); }} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                    ))}
                    {colTasks.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No tasks here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal task={editTask} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTask(null); }} />
      )}
    </div>
  );
}
