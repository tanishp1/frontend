import { NextRequest, NextResponse } from 'next/server';

function decodeJwt(token: string): { role?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  let payload: { role?: string; exp?: number } | null = null;
  if (token) {
    payload = decodeJwt(token);
    if (payload?.exp && payload.exp * 1000 < Date.now()) payload = null;
  }

  const isLoggedIn = !!payload;
  const isAdminUser = payload?.role === 'admin';

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdminUser ? '/admin' : '/dashboard', req.url));
  }

  if ((isDashboard || isAdmin) && !isLoggedIn) {
    const url = new URL('/login', req.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && isLoggedIn && !isAdminUser) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/admin/:path*'],
};
