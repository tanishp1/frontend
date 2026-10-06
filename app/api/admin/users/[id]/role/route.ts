import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../_lib/store';
import { verifyToken, unauthorized, forbidden } from '../../../../_lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'admin') return forbidden();
  const { id } = await ctx.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  users[index].role = (await req.json()).role;
  return NextResponse.json({ message: 'Role updated' });
}
