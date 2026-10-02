import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionCookie, verifyPassword } from '@/lib/auth';
import { fail, readJson } from '@/lib/api';

const attempts = new Map();

export async function POST(req) {
  const { email, password } = await readJson(req);
  if (!email || !password) return fail('Email and password are required.');

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const a = attempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60 * 1000) Object.assign(a, { n: 0, t: Date.now() });
  if (a.n >= 10) return fail('Too many attempts. Try again in 15 minutes.', 429);

  const { AdminUser } = db();
  const user = await AdminUser.findOne({ where: { email: String(email).toLowerCase().trim() } });
  const okPw = user ? await verifyPassword(String(password), user.passwordHash) : false;
  if (!okPw) {
    a.n++;
    attempts.set(ip, a);
    return fail('Invalid email or password.', 401);
  }
  attempts.delete(ip);
  user.lastLoginAt = new Date();
  await user.save();

  const cookie = await createSessionCookie(user);
  const res = NextResponse.json({ ok: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set(cookie);
  return res;
}
