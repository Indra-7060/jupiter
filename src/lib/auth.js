import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { AUTH_COOKIE, signToken, verifyToken } from './jwt.js';
import { db } from './db.js';

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.sub) return null;
  const { AdminUser } = db();
  const user = await AdminUser.findByPk(Number(session.sub), {
    attributes: ['id', 'name', 'email', 'role', 'lastLoginAt'],
  });
  return user ? user.get({ plain: true }) : null;
}

export async function createSessionCookie(user) {
  const token = await signToken({ sub: String(user.id), email: user.email, role: user.role, name: user.name });
  return {
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
