import { NextResponse } from 'next/server';
import { getSession } from './auth.js';

export function ok(data, init = {}) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function created(data) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/** Wrap an admin API handler: 401 when there's no valid session, 500 on crash. */
export function withAdmin(handler, { roles } = {}) {
  return async (req, ctx) => {
    const session = await getSession();
    if (!session) return fail('Unauthorized', 401);
    if (roles && !roles.includes(session.role)) return fail('Forbidden', 403);
    try {
      const params = ctx?.params ? await ctx.params : {};
      return await handler(req, { ...ctx, params, session });
    } catch (err) {
      console.error('[admin api]', err);
      const msg =
        err?.name === 'SequelizeUniqueConstraintError'
          ? 'A record with the same unique value (e.g. slug or email) already exists.'
          : err?.message || 'Server error';
      return fail(msg, 500);
    }
  };
}

export function withPublic(handler) {
  return async (req, ctx) => {
    try {
      const params = ctx?.params ? await ctx.params : {};
      return await handler(req, { ...ctx, params });
    } catch (err) {
      console.error('[public api]', err);
      return fail('Server error', 500);
    }
  };
}
