'use client';

import { useEffect, useState } from 'react';
import MediaPicker from './MediaPicker';
import { api } from '@/lib/adminClient';

/* ---------- individual field widgets ---------- */

function Label({ f }) {
  return (
    <label>
      {f.label}
      {f.required && <i> *</i>}
    </label>
  );
}

function MediaField({ f, value, onChange, kind }) {
  const [open, setOpen] = useState(false);
  const v = value || '';
  const isVideo = kind === 'video' || /\.(mp4|webm)(\?|$)/i.test(v);
  return (
    <div className="img-f">
      <div className="prev">{v ? isVideo ? <video src={v} muted /> : <img src={v} alt="" /> : 'none'}</div>
      <div className="ctl">
        <input className="in" value={v} placeholder="/uploads/… or https://…" onChange={(e) => onChange(e.target.value)} readOnly={f.readOnly} />
        <div className="row">
          <button className="btn sm" type="button" onClick={() => setOpen(true)}>
            Browse / upload
          </button>
          {v && (
            <>
              <a className="btn sm ghost" href={v} target="_blank" rel="noopener">
                Open
              </a>
              <button className="btn sm ghost d" type="button" onClick={() => onChange('')}>
                Clear
              </button>
            </>
          )}
        </div>
      </div>
      {open && (
        <MediaPicker
          accept={kind === 'video' ? 'video' : kind === 'file' ? '' : 'image'}
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function RelationField({ f, value, onChange }) {
  const [opts, setOpts] = useState([]);
  useEffect(() => {
    api(`/api/admin/${f.resource}?limit=1000`)
      .then((d) => setOpts(d.rows.map((r) => ({ value: r.id, label: r[d.labelField] || `#${r.id}`, parentId: r.parentId }))))
      .catch(() => setOpts([]));
  }, [f.resource]);
  const list = opts;
  return (
    <select className="in" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">{f.allowEmpty || !f.required ? '— none —' : 'Select…'}</option>
      {list.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ListField({ f, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const [collapsed, setCollapsed] = useState({});
  const set = (i, v) => onChange(items.map((it, k) => (k === i ? v : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const titleOf = (it, i) => it?.title || it?.label || it?.name || it?.tab || it?.heading || `Item ${i + 1}`;
  return (
    <div className="list-f">
      {items.map((it, i) => (
        <div key={i} className={`list-item${collapsed[i] ? ' collapsed' : ''}`}>
          <div className="lh">
            <button className="ib" type="button" onClick={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))} title="Collapse">
              {collapsed[i] ? '▸' : '▾'}
            </button>
            <span>
              {i + 1}. {titleOf(it, i)}
            </span>
            <button className="ib" type="button" onClick={() => move(i, -1)} title="Move up">
              ↑
            </button>
            <button className="ib" type="button" onClick={() => move(i, 1)} title="Move down">
              ↓
            </button>
            <button className="ib" type="button" onClick={() => onChange([...items.slice(0, i), { ...it }, ...items.slice(i)])} title="Duplicate">
              ⧉
            </button>
            <button className="ib d" type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} title="Remove">
              ✕
            </button>
          </div>
          <SchemaForm fields={f.fields} value={it || {}} onChange={(v) => set(i, v)} nested />
        </div>
      ))}
      <div>
        <button className="btn sm" type="button" onClick={() => onChange([...items, {}])}>
          + Add {f.label?.replace(/s$/, '').toLowerCase() || 'item'}
        </button>
      </div>
    </div>
  );
}

function TagsField({ value, onChange }) {
  const [text, setText] = useState(Array.isArray(value) ? value.join(', ') : value || '');
  useEffect(() => {
    const joined = Array.isArray(value) ? value.join(', ') : value || '';
    if (joined !== text.split(',').map((s) => s.trim()).filter(Boolean).join(', ')) setText(joined);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className="in"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }}
      placeholder="Comma separated"
    />
  );
}

function HtmlField({ value, onChange }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="row" style={{ marginBottom: 6 }}>
        <button className={`btn sm${!preview ? ' p' : ''}`} type="button" onClick={() => setPreview(false)}>
          HTML
        </button>
        <button className={`btn sm${preview ? ' p' : ''}`} type="button" onClick={() => setPreview(true)}>
          Preview
        </button>
        <span className="help" style={{ fontSize: 12, color: 'var(--muted)' }}>
          Basic HTML tags are supported (paragraphs, headings, lists, links, images).
        </span>
      </div>
      {preview ? (
        <div className="in" style={{ minHeight: 120 }} dangerouslySetInnerHTML={{ __html: value || '' }} />
      ) : (
        <textarea className="in code" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function toDateInput(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function Field({ f, value, onChange }) {
  const ro = !!f.readOnly;
  switch (f.type) {
    case 'textarea':
      return <textarea className="in" value={value ?? ''} onChange={(e) => onChange(e.target.value)} readOnly={ro} />;
    case 'html':
      return <HtmlField value={value} onChange={onChange} />;
    case 'number':
      return <input className="in" type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} readOnly={ro} />;
    case 'boolean':
      return (
        <label className="chk">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} disabled={ro} />
          <span className="sw" />
          <span>{value ? 'Yes' : 'No'}</span>
        </label>
      );
    case 'select':
      return (
        <select className="in" value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={ro}>
          {(f.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'image':
      return <MediaField f={f} value={value} onChange={onChange} kind="image" />;
    case 'video':
      return <MediaField f={f} value={value} onChange={onChange} kind="video" />;
    case 'file':
      return <MediaField f={f} value={value} onChange={onChange} kind="file" />;
    case 'list':
      return <ListField f={f} value={value} onChange={onChange} />;
    case 'object':
      return (
        <div className="list-item">
          <SchemaForm fields={f.fields} value={value || {}} onChange={onChange} nested />
        </div>
      );
    case 'tags':
      return <TagsField value={value} onChange={onChange} />;
    case 'relation':
      return <RelationField f={f} value={value} onChange={onChange} />;
    case 'date':
      return <input className="in" type="date" value={toDateInput(value)} onChange={(e) => onChange(e.target.value || null)} readOnly={ro} />;
    case 'password':
      return <input className="in" type="password" value={value ?? ''} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" />;
    case 'json':
      return <textarea className="in code" value={typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2)} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input className="in" value={value ?? ''} onChange={(e) => onChange(e.target.value)} readOnly={ro} />;
  }
}

/* ---------- form ---------- */

export default function SchemaForm({ fields = [], value = {}, onChange, nested = false }) {
  const set = (name, v) => onChange({ ...value, [name]: v });

  // group fields by `group`; ungrouped first
  const groups = [];
  for (const f of fields) {
    const g = f.group || '';
    let bucket = groups.find((b) => b.name === g);
    if (!bucket) {
      bucket = { name: g, fields: [] };
      groups.push(bucket);
    }
    bucket.fields.push(f);
  }

  const renderFields = (list) =>
    list.map((f) => {
      const val = value?.[f.name] ?? (f.type === 'select' ? f.options?.[0]?.value ?? '' : undefined);
      return (
        <div key={f.name} className={`fld${f.half ? ' half' : ''}`}>
          <Label f={f} />
          <Field f={f} value={val} onChange={(v) => set(f.name, v)} />
          {f.help && <div className="help">{f.help}</div>}
        </div>
      );
    });

  return (
    <div className="frm">
      {groups.map((g, i) =>
        g.name ? (
          <details key={g.name} className="grp-box" open={i < 2}>
            <summary>{g.name}</summary>
            <div className="frm">{renderFields(g.fields)}</div>
          </details>
        ) : (
          renderFields(g.fields)
        )
      )}
    </div>
  );
}
