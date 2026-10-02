'use client';

import { useEffect, useRef, useState } from 'react';
import { api, upload } from '@/lib/adminClient';

function Thumb({ m }) {
  if ((m.mime || '').startsWith('image/')) return <img src={m.url} alt={m.alt || ''} loading="lazy" />;
  if ((m.mime || '').startsWith('video/')) return <video src={m.url} muted />;
  return <span>{(m.mime || 'file').split('/').pop()}</span>;
}

export default function MediaPicker({ accept = 'image', onSelect, onClose }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    try {
      setItems(await api(`/api/admin/media${accept ? `?type=${accept}` : ''}`));
    } catch (e) {
      setErr(e.message);
    }
  };
  useEffect(() => {
    load();
  }, [accept]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const added = await upload(files);
      setItems((x) => [...added, ...x]);
      if (added.length === 1) onSelect(added[0].url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const list = items.filter((m) => !q || (m.filename + ' ' + (m.alt || '')).toLowerCase().includes(q.toLowerCase()));
  const acceptAttr = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'pdf' ? 'application/pdf' : undefined;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="hd">
          <h3 style={{ margin: 0 }}>Media library</h3>
          <input className="in" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 240 }} />
          <span className="spacer" />
          <input ref={fileRef} type="file" multiple accept={acceptAttr} style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
          <button className="btn p" type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Uploading…' : '↑ Upload'}
          </button>
          <button className="btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="bd">
          {err && <div className="err-box">{err}</div>}
          <div className="row" style={{ marginBottom: 14 }}>
            <input className="in" placeholder="…or paste an external URL (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1 }} />
            <button className="btn" type="button" disabled={!url} onClick={() => onSelect(url.trim())}>
              Use URL
            </button>
          </div>
          <div
            className="drop"
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
            style={{ marginBottom: 14 }}
          >
            Drag & drop files here to upload
          </div>
          {list.length ? (
            <div className="mgrid">
              {list.map((m) => (
                <div key={m.id} className="mcard" onClick={() => onSelect(m.url)} title={m.filename}>
                  <div className="th">
                    <Thumb m={m} />
                  </div>
                  <div className="nm">{m.filename}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No files yet. Upload one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
