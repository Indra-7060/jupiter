'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SchemaForm from './SchemaForm';
import QuoteReply from './QuoteReply';
import { api } from '@/lib/adminClient';
import { useToast } from './Toast';

export default function ResourceForm({ name, def, id }) {
  const isNew = id === 'new';
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const [value, setValue] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isNew) {
      const init = {};
      def.fields.forEach((f) => {
        if (f.type === 'boolean') init[f.name] = f.name === 'published' || f.name === 'enabled' || f.name === 'showCta';
        if (f.type === 'select') init[f.name] = f.options?.[0]?.value ?? '';
        if (f.type === 'number' && f.name === 'order') init[f.name] = 0;
        if (f.type === 'date' && f.name === 'publishedAt') init[f.name] = new Date().toISOString().slice(0, 10);
      });
      const cat = sp.get('filter.categoryId');
      if (cat && name === 'product-items') init.categoryId = Number(cat);
      setValue(init);
      return;
    }
    api(`/api/admin/${name}/${id}`)
      .then(setValue)
      .catch((e) => setErr(e.message));
  }, [name, id, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e?.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const saved = isNew ? await api(`/api/admin/${name}`, { method: 'POST', body: value }) : await api(`/api/admin/${name}/${id}`, { method: 'PUT', body: value });
      toast('Saved');
      if (isNew) router.replace(`/admin/${name}/${saved.id}`);
      else setValue(saved);
      router.refresh();
    } catch (e2) {
      setErr(e2.message);
      toast(e2.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      await api(`/api/admin/${name}/${id}`, { method: 'DELETE' });
      toast('Deleted');
      router.replace(`/admin/${name}`);
      router.refresh();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  const title = isNew ? `New ${def.singular.toLowerCase()}` : value?.name || value?.title || value?.label || def.singular;
  const viewHref =
    value &&
    !isNew &&
    ({
      pages: value.slug === 'home' ? '/' : `/${value.slug}`,
      products: `/products/${value.slug}`,
      machines: `/power-press/${value.slug}`,
      posts: `/press/${value.slug}`,
    }[name] || null);

  return (
    <>
    <form onSubmit={save}>
      <div className="ad-top">
        <div>
          <Link href={`/admin/${name}`} style={{ fontSize: 12 }}>
            ← {def.label}
          </Link>
          <h1 style={{ marginTop: 4 }}>{title}</h1>
        </div>
        <div className="row">
          {name === 'pages' && !isNew && (
            <Link className="btn" href={`/admin/pages/${id}/sections`}>
              Edit sections
            </Link>
          )}
          {name === 'products' && !isNew && (
            <Link className="btn" href={`/admin/product-items?filter.categoryId=${id}`}>
              Product items
            </Link>
          )}
          {viewHref && (
            <a className="btn" href={viewHref} target="_blank" rel="noopener">
              View ↗
            </a>
          )}
          {!isNew && !(name === 'pages' && value?.isSystem) && (
            <button className="btn d" type="button" onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn p" disabled={busy || !value}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {err && <div className="err-box">{err}</div>}
      <div className="card">
        <div className="bd">
          {value ? <SchemaForm fields={def.fields} value={value} onChange={setValue} /> : <div className="empty">Loading…</div>}
          {name === 'applications' && value && (
            <div style={{ marginTop: 16 }} className="row">
              {value.cvFile ? (
                <a className="btn p" href={`/api/admin/applications/${value.id}/cv`}>
                  ⬇ Download CV{value.cvName ? ` (${value.cvName})` : ''}
                </a>
              ) : (
                <span className="pill">No CV attached</span>
              )}
              <a className="btn" href={`mailto:${value.email}?subject=${encodeURIComponent(`Re: your application${value.jobTitle ? ` for ${value.jobTitle}` : ''} – Jupiter Industrial Works`)}`}>
                Reply by email
              </a>
            </div>
          )}
          {name === 'enquiries' && value?.message && (
            <div style={{ marginTop: 16 }} className="row">
              <a className="btn" href={`mailto:${value.email}?subject=${encodeURIComponent('Re: your enquiry to Jupiter Industrial Works')}`}>
                Reply by email
              </a>
            </div>
          )}
        </div>
      </div>
    </form>
    {name === 'quotes' && value && !isNew && (
      <QuoteReply
        quote={value}
        onReplied={(q) => {
          setValue(q);
          router.refresh();
        }}
      />
    )}
    </>
  );
}
