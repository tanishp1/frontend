import { NextRequest, NextResponse } from 'next/server';
import { users, tasks } from '../../_lib/store';
import { verifyToken, unauthorized, forbidden } from '../../_lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'admin') return forbidden();
  return NextResponse.json(users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
    taskCount: tasks.filter(t => t.userId === u.id).length,
  })));
}
