import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_secret_2025';

export interface JwtPayload { id: string; email: string; role: string; name: string; }

export function verifyToken(req: NextRequest): JwtPayload | null {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; }
  catch { return null; }
}

export function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
export function forbidden()    { return NextResponse.json({ error: 'Forbidden' },    { status: 403 }); }
