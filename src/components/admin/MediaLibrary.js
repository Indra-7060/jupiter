'use client';

import { useEffect, useRef, useState } from 'react';
import { api, upload } from '@/lib/adminClient';
import { useToast } from './Toast';

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const toast = useToast();
  const fileRef = useRef(null);

  const load = () => api('/api/admin/media').then(setItems).catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const added = await upload(files);
      setItems((x) => [...added, ...x]);
      toast(`${added.length} file(s) uploaded`);
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function remove(m) {
    if (!confirm(`Delete ${m.filename}? Pages still referencing it will show a broken image.`)) return;
    try {
      await api(`/api/admin/media/${m.id}`, { method: 'DELETE' });
      setItems((x) => x.filter((i) => i.id !== m.id));
      toast('Deleted');
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('URL copied');
    } catch {
      prompt('Copy URL', url);
    }
  };

  const list = items.filter((m) => !q || m.filename.toLowerCase().includes(q.toLowerCase()));
  const fmt = (n) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);

  return (
    <>
      <div className="ad-top">
        <div>
          <h1>Media library</h1>
          <p>Images, videos and PDF files used on the website.</p>
        </div>
        <div className="row">
          <input className="in" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
          <button className="btn p" type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Uploading…' : '↑ Upload files'}
          </button>
        </div>
      </div>
      <div
        className="drop"
        style={{ marginBottom: 16 }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('on');
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove('on')}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('on');
          onFiles(e.dataTransfer.files);
        }}
      >
        Drag & drop files here (JPG, PNG, WebP, SVG, MP4, PDF · max 25 MB each)
      </div>
      {list.length ? (
        <div className="mgrid">
          {list.map((m) => (
            <div key={m.id} className="mcard" onClick={() => copy(m.url)} title="Click to copy URL">
              <div className="th">
                {(m.mime || '').startsWith('image/') ? <img src={m.url} alt={m.alt || ''} loading="lazy" /> : (m.mime || '').startsWith('video/') ? <video src={m.url} muted /> : <span>{(m.mime || 'file').split('/').pop()}</span>}
              </div>
              <div className="nm">
                {m.filename}
                <br />
                <span style={{ fontSize: 10 }}>{m.size ? fmt(m.size) : ''}</span>
              </div>
              <button
                className="del"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(m);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty">No uploads yet.</div>
      )}
    </>
  );
}
