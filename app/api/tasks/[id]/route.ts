import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '../../_lib/store';
import { verifyToken, unauthorized, forbidden } from '../../_lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const { id } = await ctx.params;
  const task = tasks.find(t => t.id === id);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (payload.role !== 'admin' && task.userId !== payload.id) return forbidden();
  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const { id } = await ctx.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (payload.role !== 'admin' && tasks[index].userId !== payload.id) return forbidden();
  tasks[index] = { ...tasks[index], ...await req.json(), id: tasks[index].id, userId: tasks[index].userId };
  return NextResponse.json(tasks[index]);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const { id } = await ctx.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (payload.role !== 'admin' && tasks[index].userId !== payload.id) return forbidden();
  tasks.splice(index, 1);
  return NextResponse.json({ message: 'Task deleted' });
}
