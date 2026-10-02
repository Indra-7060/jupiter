'use client';

export async function api(path, { method = 'GET', body, headers, raw } = {}) {
  const res = await fetch(path, {
    method,
    headers: raw ? headers : { 'Content-Type': 'application/json', ...(headers || {}) },
    body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  if (res.status === 401 && typeof window !== 'undefined' && !location.pathname.startsWith('/admin/login')) {
    location.href = `/admin/login?next=${encodeURIComponent(location.pathname)}`;
  }
  if (!res.ok || !json?.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json.data;
}

export async function upload(files, alt) {
  const fd = new FormData();
  [...files].forEach((f) => fd.append('files', f));
  if (alt) fd.append('alt', alt);
  return api('/api/admin/upload', { method: 'POST', body: fd, raw: true });
}
