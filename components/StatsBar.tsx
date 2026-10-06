'use client';
import { Stats } from '@/lib/types';

const cards = [
  { label: 'Total Tasks', key: 'total', color: 'from-violet-500 to-purple-600', icon: '📋' },
  { label: 'To Do', key: 'todo', color: 'from-blue-500 to-cyan-600', icon: '📌' },
  { label: 'In Progress', key: 'inProgress', color: 'from-amber-500 to-orange-600', icon: '⚡' },
  { label: 'Completed', key: 'done', color: 'from-emerald-500 to-green-600', icon: '✅' },
];

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, key, color, icon }) => (
        <div key={key} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
          <div className="text-3xl mb-2">{icon}</div>
          <div className="text-3xl font-bold">{stats[key as keyof Stats]}</div>
          <div className="text-sm opacity-80 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
