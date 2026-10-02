import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * File storage for uploads (public media) and CVs (private).
 * - With BLOB_READ_WRITE_TOKEN set (Vercel Blob) files go to the cloud: required on Vercel, whose disk is read-only.
 * - Otherwise files are written to the local disk (public/uploads and storage/cv).
 */
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function saveMedia(buffer, filename, contentType) {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${filename}`, buffer, { access: 'public', contentType, addRandomSuffix: false });
    return { url: blob.url, filename };
  }
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${filename}`, filename };
}

export async function deleteMedia(url, filename) {
  if (useBlob() && /^https?:\/\//.test(url)) {
    const { del } = await import('@vercel/blob');
    await del(url).catch(() => {});
    return;
  }
  await unlink(path.join(process.cwd(), 'public', 'uploads', path.basename(filename))).catch(() => {});
}

/** CVs: stored under an unguessable name and only ever served through the authenticated admin route. */
export async function saveCv(buffer, filename, contentType) {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`cv/${filename}`, buffer, { access: 'public', contentType, addRandomSuffix: true });
    return blob.url; // stored in the DB, never shown on the public site
  }
  const dir = path.join(process.cwd(), 'storage', 'cv');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return filename;
}

export async function readCv(ref) {
  if (/^https?:\/\//.test(ref)) {
    const res = await fetch(ref);
    if (!res.ok) throw new Error('CV not found in storage');
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(process.cwd(), 'storage', 'cv', path.basename(ref)));
}
