import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * File storage for uploads (public media) and CVs (private).
 *
 * On Vercel the disk is read-only, so files go to Vercel Blob when it is connected:
 *  - OIDC connection (recommended): Vercel sets BLOB_STORE_ID and the SDK signs requests itself.
 *  - Classic token: BLOB_READ_WRITE_TOKEN.
 * Locally (neither set) files are written to public/uploads and storage/cv.
 *
 * The store can be private or public. Private blobs cannot be linked directly, so media in a private
 * store is served through /api/files/uploads/... ; CVs are only ever read by the authenticated admin.
 */
const useBlob = () => !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
const preferredAccess = () => (process.env.BLOB_ACCESS === 'public' ? 'public' : 'private');
const isPrivateUrl = (url) => /\.private\.blob\.vercel-storage\.com/.test(url);

async function putBlob(pathname, buffer, contentType, extra = {}) {
  const { put } = await import('@vercel/blob');
  const first = preferredAccess();
  try {
    return await put(pathname, buffer, { access: first, contentType, ...extra });
  } catch (err) {
    // the store's access mode is fixed at creation; retry with the other mode if this one was refused
    if (!/access|private|public/i.test(String(err?.message))) throw err;
    return put(pathname, buffer, { access: first === 'private' ? 'public' : 'private', contentType, ...extra });
  }
}

/** Saves an uploaded media file and returns the URL to store in the database and use in <img src>. */
export async function saveMedia(buffer, filename, contentType) {
  if (useBlob()) {
    const blob = await putBlob(`uploads/${filename}`, buffer, contentType, { addRandomSuffix: false });
    return { url: isPrivateUrl(blob.url) ? `/api/files/${blob.pathname}` : blob.url, filename };
  }
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${filename}`, filename };
}

export async function deleteMedia(url, filename) {
  if (useBlob() && (url.startsWith('/api/files/') || /^https?:\/\//.test(url))) {
    const { del } = await import('@vercel/blob');
    const target = url.startsWith('/api/files/') ? url.slice('/api/files/'.length) : url;
    await del(target).catch(() => {});
    return;
  }
  await unlink(path.join(process.cwd(), 'public', 'uploads', path.basename(filename))).catch(() => {});
}

/** Streams a media blob from a private store (used by /api/files/[...path]). */
export async function getMediaBlob(pathname, ifNoneMatch) {
  const { get } = await import('@vercel/blob');
  return get(pathname, { access: 'private', ifNoneMatch: ifNoneMatch || undefined });
}

/** CVs: stored under an unguessable name and only ever served through the authenticated admin route. */
export async function saveCv(buffer, filename, contentType) {
  if (useBlob()) {
    const blob = await putBlob(`cv/${filename}`, buffer, contentType, { addRandomSuffix: true });
    return blob.url; // kept in the database, never shown on the public site
  }
  const dir = path.join(process.cwd(), 'storage', 'cv');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return filename;
}

export async function readCv(ref) {
  if (/^https?:\/\//.test(ref)) {
    if (isPrivateUrl(ref)) {
      const { get } = await import('@vercel/blob');
      const res = await get(ref, { access: 'private' });
      if (!res || res.statusCode !== 200) throw new Error('CV not found in storage');
      return Buffer.from(await new Response(res.stream).arrayBuffer());
    }
    const res = await fetch(ref);
    if (!res.ok) throw new Error('CV not found in storage');
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(process.cwd(), 'storage', 'cv', path.basename(ref)));
}
