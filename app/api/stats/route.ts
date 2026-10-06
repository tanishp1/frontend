import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '../_lib/store';
import { verifyToken, unauthorized } from '../_lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const mine = payload.role === 'admin' ? tasks : tasks.filter(t => t.userId === payload.id);
  return NextResponse.json({
    total: mine.length,
    todo: mine.filter(t => t.status === 'todo').length,
    inProgress: mine.filter(t => t.status === 'in-progress').length,
    done: mine.filter(t => t.status === 'done').length,
  });
}
