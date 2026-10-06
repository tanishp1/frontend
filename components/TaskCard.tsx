'use client';
import { Task } from '@/lib/types';

const priorityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-green-100 text-green-700 border border-green-200',
};

const statusStyles: Record<string, string> = {
  'todo': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-orange-100 text-orange-700',
  'done': 'bg-emerald-100 text-emerald-700',
};

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={`font-semibold text-gray-800 text-sm leading-snug flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="Edit">
            ✏️
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
          {task.category}
        </span>
      </div>

      {task.dueDate && (
        <div className="text-xs text-gray-400 mb-3">📅 Due: {new Date(task.dueDate).toLocaleDateString()}</div>
      )}

      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
        className={`w-full text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer ${statusStyles[task.status]}`}
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
