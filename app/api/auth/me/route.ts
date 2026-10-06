import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../_lib/store';
import { verifyToken, unauthorized } from '../../_lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  const user = users.find(u => u.id === payload.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
