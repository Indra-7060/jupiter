import { getMediaBlob } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Public URL for media kept in a private Vercel Blob store: /api/files/uploads/<file>.
 * Only the uploads/ folder is served; CVs (cv/) are never reachable here.
 */
export async function GET(req, { params }) {
  const { path: parts = [] } = await params;
  const pathname = parts.map(decodeURIComponent).join('/');
  if (!pathname.startsWith('uploads/') || pathname.includes('..')) return new Response('Not found', { status: 404 });
  try {
    const res = await getMediaBlob(pathname, req.headers.get('if-none-match'));
    if (!res) return new Response('Not found', { status: 404 });
    const headers = { ETag: res.blob.etag, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' };
    if (res.statusCode === 304) return new Response(null, { status: 304, headers });
    return new Response(res.stream, { headers: { ...headers, 'Content-Type': res.blob.contentType || 'application/octet-stream' } });
  } catch (err) {
    console.error('[files]', err?.message);
    return new Response('Not found', { status: 404 });
  }
}
