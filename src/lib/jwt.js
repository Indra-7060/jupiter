import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE = 'jiw_admin';
const ISSUER = 'jupiter-cms';

function secret() {
  const s = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(s);
}

export async function signToken(payload, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    return payload;
  } catch {
    return null;
  }
}
