import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { tasks, users } from '../_lib/store';
import { verifyToken, unauthorized } from '../_lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const category = searchParams.get('category');
  let filtered = payload.role === 'admin' ? [...tasks] : tasks.filter(t => t.userId === payload.id);
  if (status)   filtered = filtered.filter(t => t.status === status);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (category) filtered = filtered.filter(t => t.category === category);
  return NextResponse.json(filtered.map(t => ({ ...t, userName: users.find(u => u.id === t.userId)?.name || 'Unknown' })));
}

export async function POST(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const { title, description, status = 'todo', priority = 'medium', category = 'General', dueDate } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const task = { id: uuidv4(), title, description, status, priority, category, dueDate, createdAt: new Date().toISOString(), userId: payload.id };
  tasks.push(task);
  return NextResponse.json(task, { status: 201 });
}
