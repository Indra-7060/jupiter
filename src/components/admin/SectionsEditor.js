'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SchemaForm from './SchemaForm';
import { api } from '@/lib/adminClient';
import { SECTION_TYPES, SECTION_TYPE_OPTIONS } from '@/lib/sectionSchemas';
import { useToast } from './Toast';

export default function SectionsEditor({ page }) {
  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState({});
  const [dirty, setDirty] = useState({});
  const [newType, setNewType] = useState(SECTION_TYPE_OPTIONS[0].value);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const load = () => api(`/api/admin/sections?pageId=${page.id}`).then(setSections).catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
  }, [page.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id, patch) => setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function save(sec) {
    setBusy(true);
    try {
      const saved = await api(`/api/admin/sections/${sec.id}`, { method: 'PUT', body: { data: sec.data, enabled: sec.enabled } });
      update(sec.id, saved);
      setDirty((d) => ({ ...d, [sec.id]: false }));
      toast('Section saved');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(sec) {
    try {
      const saved = await api(`/api/admin/sections/${sec.id}`, { method: 'PUT', body: { enabled: !sec.enabled } });
      update(sec.id, saved);
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function remove(sec) {
    if (!confirm(`Remove the "${SECTION_TYPES[sec.type]?.label || sec.type}" section?`)) return;
    try {
      await api(`/api/admin/sections/${sec.id}`, { method: 'DELETE' });
      setSections((s) => s.filter((x) => x.id !== sec.id));
      toast('Section removed');
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
    try {
      await api('/api/admin/sections/reorder', { method: 'PUT', body: { ids: next.map((s) => s.id) } });
    } catch (e) {
      toast(e.message, 'err');
      load();
    }
  }

  async function add() {
    try {
      const created = await api('/api/admin/sections', { method: 'POST', body: { pageId: page.id, type: newType, data: {} } });
      setSections((s) => [...s, created]);
      setOpen((o) => ({ ...o, [created.id]: true }));
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  const viewHref = page.slug === 'home' ? '/' : `/${page.slug}`;

  return (
    <>
      <div className="ad-top">
        <div>
          <Link href="/admin/pages" style={{ fontSize: 12 }}>
            ← Pages
          </Link>
          <h1 style={{ marginTop: 4 }}>{page.title} — sections</h1>
          <p>Open a section to edit it. Use the arrows to reorder and the switch to show or hide it.</p>
        </div>
        <div className="row">
          <Link className="btn" href={`/admin/pages/${page.id}`}>
            Page title & SEO
          </Link>
          <a className="btn" href={viewHref} target="_blank" rel="noopener">
            View page ↗
          </a>
        </div>
      </div>

      {sections.map((sec, i) => {
        const schema = SECTION_TYPES[sec.type];
        const isOpen = !!open[sec.id];
        return (
          <div key={sec.id} className={`card sec${sec.enabled ? '' : ' off'}`}>
            <div className="sh">
              <button className="ib" type="button" onClick={() => setOpen((o) => ({ ...o, [sec.id]: !isOpen }))}>
                {isOpen ? '▾' : '▸'}
              </button>
              <div>
                <div className="ty">
                  {i + 1}. {schema?.label || sec.type}
                </div>
                <b>{sec.data?.title || sec.data?.heading || ''}</b>
              </div>
              <span className="spacer" />
              {dirty[sec.id] && <span className="pill new">unsaved</span>}
              <label className="chk" title="Enabled">
                <input type="checkbox" checked={!!sec.enabled} onChange={() => toggle(sec)} />
                <span className="sw" />
              </label>
              <button className="ib" type="button" onClick={() => move(i, -1)} title="Move up">
                ↑
              </button>
              <button className="ib" type="button" onClick={() => move(i, 1)} title="Move down">
                ↓
              </button>
              <button className="ib d" type="button" onClick={() => remove(sec)} title="Remove">
                ✕
              </button>
            </div>
            {isOpen && (
              <div className="sb">
                {schema ? (
                  <>
                    <SchemaForm
                      fields={schema.fields}
                      value={sec.data || {}}
                      onChange={(data) => {
                        update(sec.id, { data });
                        setDirty((d) => ({ ...d, [sec.id]: true }));
                      }}
                    />
                    <div className="row" style={{ marginTop: 16 }}>
                      <button className="btn p" type="button" disabled={busy} onClick={() => save(sec)}>
                        Save section
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="err-box">Unknown section type "{sec.type}".</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="card">
        <div className="bd row">
          <select className="in" value={newType} onChange={(e) => setNewType(e.target.value)} style={{ maxWidth: 320 }}>
            {SECTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{SECTION_TYPES[newType]?.description}</span>
          <span className="spacer" />
          <button className="btn p" type="button" onClick={add}>
            + Add section
          </button>
        </div>
      </div>
    </>
  );
}
