import { NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyToken } from './lib/jwt.js';

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/admin');
  const isLogin = pathname === '/admin/login';

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (isLogin) {
    if (session) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
