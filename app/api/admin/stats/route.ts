import { NextRequest, NextResponse } from 'next/server';
import { users, tasks } from '../../_lib/store';
import { verifyToken, unauthorized, forbidden } from '../../_lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'admin') return forbidden();
  return NextResponse.json({
    totalUsers: users.length,
    totalTasks: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    admins: users.filter(u => u.role === 'admin').length,
  });
}
