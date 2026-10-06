'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchAdminStats, fetchUsers, fetchTasks, updateUserRole, deleteUser, deleteTask, updateTask, createTask } from '@/lib/api';
import { AdminStats, User, Task } from '@/lib/types';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'tasks'>('overview');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [backendError, setBackendError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setBackendError('');
      const [s, u, t] = await Promise.all([fetchAdminStats(), fetchUsers(), fetchTasks()]);
      setStats(s);
      setUsers(u);
      setTasks(t);
    } catch (err: unknown) {
      setBackendError(err instanceof Error ? err.message : 'Cannot connect to backend');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user?.role === 'admin') loadData(); }, [user, loadData]);

  const handleRoleChange = async (id: string, role: string) => {
    await updateUserRole(id, role);
    loadData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Delete this user and all their tasks?')) { await deleteUser(id); loadData(); }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task?')) { await deleteTask(id); loadData(); }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
    loadData();
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    if (editTask) await updateTask(editTask.id, data);
    else await createTask(data);
    setModalOpen(false);
    setEditTask(null);
    loadData();
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'from-violet-500 to-purple-600' },
    { label: 'Total Tasks', value: stats?.totalTasks, icon: '📋', color: 'from-blue-500 to-cyan-600' },
    { label: 'In Progress', value: stats?.inProgress, icon: '⚡', color: 'from-amber-500 to-orange-600' },
    { label: 'Completed', value: stats?.done, icon: '✅', color: 'from-emerald-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">Manage users, tasks and monitor activity</p>
          </div>
          <span className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full border border-violet-200">
            👑 Admin
          </span>
        </div>

        {backendError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <span>⚠️</span> <span>{backendError} — Make sure the backend is running on port 5000.</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-3xl font-bold">{value ?? 0}</div>
              <div className="text-sm opacity-80 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(['overview', 'users', 'tasks'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📋 All Tasks'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Task Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'To Do', value: stats?.todo ?? 0, total: stats?.totalTasks ?? 1, color: 'bg-blue-500' },
                  { label: 'In Progress', value: stats?.inProgress ?? 0, total: stats?.totalTasks ?? 1, color: 'bg-amber-500' },
                  { label: 'Done', value: stats?.done ?? 0, total: stats?.totalTasks ?? 1, color: 'bg-emerald-500' },
                ].map(({ label, value, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['User', 'Email', 'Role', 'Tasks', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          className={`text-xs px-2 py-1 rounded-lg font-medium border-0 cursor-pointer ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'} disabled:opacity-50`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-800">{u.taskCount ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user?.id}
                          className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {tab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{tasks.length} total tasks across all users</p>
              <button onClick={() => { setEditTask(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md">
                + New Task
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tasks.map(task => (
                <div key={task.id}>
                  {task.userName && (
                    <div className="text-xs text-gray-400 mb-1 px-1">👤 {task.userName}</div>
                  )}
                  <TaskCard task={task} onEdit={t => { setEditTask(t); setModalOpen(true); }} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal task={editTask} onSave={handleSaveTask} onClose={() => { setModalOpen(false); setEditTask(null); }} />
      )}
    </div>
  );
}
