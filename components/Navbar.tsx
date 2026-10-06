'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  view?: string;
  onViewChange?: (v: 'grid' | 'kanban') => void;
  onNewTask?: () => void;
}

export default function Navbar({ view, onViewChange, onNewTask }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            ✓
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Professional Task Manager</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium">
            📋 My Tasks
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium">
              👑 Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          {onViewChange && (
            <div className="hidden sm:flex bg-gray-100 rounded-xl p-1 gap-1">
              <button onClick={() => onViewChange('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'grid' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>
                ⊞ Grid
              </button>
              <button onClick={() => onViewChange('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'kanban' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>
                ☰ Kanban
              </button>
            </div>
          )}

          {/* New task */}
          {onNewTask && (
            <button onClick={onNewTask} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md">
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">New Task</span>
            </button>
          )}

          {/* User menu */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="ml-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
