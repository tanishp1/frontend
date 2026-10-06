import { NextRequest, NextResponse } from 'next/server';
import { users, tasks } from '../../../_lib/store';
import { verifyToken, unauthorized, forbidden } from '../../../_lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'admin') return forbidden();
  const { id } = await ctx.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (users[index].id === payload.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  users.splice(index, 1);
  const taskStore = tasks;
  for (let i = taskStore.length - 1; i >= 0; i--) {
    if (taskStore[i].userId === id) taskStore.splice(i, 1);
  }
  return NextResponse.json({ message: 'User deleted' });
}
