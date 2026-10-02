'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/adminClient';
import { formatDate } from '@/lib/util';
import { useToast } from './Toast';

export default function ResourceList({ name, def }) {
  const sp = useSearchParams();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [relations, setRelations] = useState({});
  const [categories, setCategories] = useState([]);
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const filters = useMemo(() => {
    const out = {};
    for (const [k, v] of sp.entries()) if (k.startsWith('filter.')) out[k] = v;
    return out;
  }, [sp]);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const params = new URLSearchParams({ limit: '1000', ...filters });
      if (q) params.set('q', q);
      const d = await api(`/api/admin/${name}?${params}`);
      setRows(d.rows);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const cid = filters['filter.categoryId'];
    if (cid) setOpenGroups(new Set([Number(cid)]));
  }, [name, q, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const rel = def.columns.filter((c) => c.type === 'relation');
    rel.forEach((c) => {
      api(`/api/admin/${c.resource}?limit=1000`)
        .then((d) => {
          const map = {};
          d.rows.forEach((r) => (map[r.id] = r[d.labelField]));
          setRelations((x) => ({ ...x, [c.resource]: map }));
          if (c.resource === 'products') setCategories(d.rows);
        })
        .catch(() => {});
    });
  }, [def]);

  async function remove(row) {
    if (!confirm(`Delete "${row[def.columns[0].name]}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/${name}/${row.id}`, { method: 'DELETE' });
      setRows((r) => r.filter((x) => x.id !== row.id));
      toast('Deleted');
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  const cell = (row, c) => {
    const v = row[c.name];
    if (c.type === 'boolean') return <span className={`pill ${v ? 'ok' : 'no'}`}>{v ? 'Yes' : 'No'}</span>;
    if (c.type === 'date') return formatDate(v);
    if (c.type === 'relation') return v == null ? <span style={{ color: 'var(--muted)' }}>—</span> : relations[c.resource]?.[v] || `#${v}`;
    if (c.name === 'status') return <span className={`pill ${v === 'new' ? 'new' : 'ok'}`}>{v}</span>;
    if (v == null || v === '') return <span style={{ color: 'var(--muted)' }}>—</span>;
    return String(v);
  };

  const toggleGroup = (id) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const renderRow = (row) => (
    <tr key={row.id}>
      {def.columns
        .filter((c) => c.name !== 'categoryId')
        .map((c, i) => (
          <td key={c.name}>
            {i === 0 ? (
              <Link href={`/admin/${name}/${row.id}`}>
                <b>{cell(row, c)}</b>
              </Link>
            ) : (
              cell(row, c)
            )}
          </td>
        ))}
      <td className="act">
        <Link className="btn sm" href={`/admin/${name}/${row.id}`}>
          Edit
        </Link>{' '}
        <button className="btn sm d" type="button" onClick={() => remove(row)}>
          Delete
        </button>
      </td>
    </tr>
  );

  if (name === 'product-items') {
    const searching = q.trim().length > 0;
    const groups = [...categories]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .map((c) => ({ cat: c, items: rows.filter((r) => r.categoryId === c.id) }));
    const orphans = rows.filter((r) => !categories.some((c) => c.id === r.categoryId));
    if (orphans.length) groups.push({ cat: { id: 0, name: 'Without category', slug: '' }, items: orphans });
    return (
      <>
        <div className="ad-top">
          <div>
            <h1>{def.label}</h1>
            <p>
              {rows.length} item{rows.length === 1 ? '' : 's'} in {groups.filter((g) => g.items.length).length} categories. Click a category to see its items.
            </p>
          </div>
          <div className="row">
            <input className="in" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
            <Link className="btn p" href={`/admin/${name}/new`}>
              + New {def.singular.toLowerCase()}
            </Link>
          </div>
        </div>
        {err && <div className="err-box">{err}</div>}
        {loading && !rows.length && <div className="card empty">Loading…</div>}
        {groups.map(({ cat, items }) => {
          if (searching && !items.length) return null;
          const open = searching || openGroups.has(cat.id);
          return (
            <div key={cat.id} className={`card acc${open ? ' open' : ''}`}>
              <button type="button" className="acc-h" onClick={() => toggleGroup(cat.id)} aria-expanded={open}>
                <span className="acc-arrow">{open ? '▾' : '▸'}</span>
                <span className="acc-title">{cat.name}</span>
                <span className="pill">{items.length} item{items.length === 1 ? '' : 's'}</span>
                <span className="spacer" />
                {cat.id > 0 && (
                  <>
                    <Link className="btn sm" href={`/admin/${name}/new?filter.categoryId=${cat.id}`} onClick={(e) => e.stopPropagation()}>
                      + Add item
                    </Link>
                    <Link className="btn sm ghost" href={`/admin/products/${cat.id}`} onClick={(e) => e.stopPropagation()}>
                      Edit category
                    </Link>
                    {cat.slug && (
                      <a className="btn sm ghost" href={`/products/${cat.slug}`} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                        View ↗
                      </a>
                    )}
                  </>
                )}
              </button>
              {open && (
                <div className="tbl-wrap">
                  {items.length ? (
                    <table className="tbl">
                      <thead>
                        <tr>
                          {def.columns
                            .filter((c) => c.name !== 'categoryId')
                            .map((c) => (
                              <th key={c.name}>{c.label}</th>
                            ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody>{items.map(renderRow)}</tbody>
                    </table>
                  ) : (
                    <div className="empty">No items in this category yet.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  const sorted = rows;

  return (
    <>
      <div className="ad-top">
        <div>
          <h1>{def.label}</h1>
          <p>
            {rows.length} record{rows.length === 1 ? '' : 's'}
            {Object.keys(filters).length ? ' (filtered)' : ''}
          </p>
        </div>
        <div className="row">
          <input className="in" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
          {!def.readOnly && (
            <Link className="btn p" href={`/admin/${name}/new${sp.toString() ? `?${sp}` : ''}`}>
              + New {def.singular.toLowerCase()}
            </Link>
          )}
        </div>
      </div>

      {err && <div className="err-box">{err}</div>}
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {def.columns.map((c) => (
                  <th key={c.name}>{c.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id}>
                  {def.columns.map((c, i) => (
                    <td key={c.name}>
                      {i === 0 ? (
                        <Link href={`/admin/${name}/${row.id}`}>
                          <b>{cell(row, c)}</b>
                        </Link>
                      ) : (
                        cell(row, c)
                      )}
                    </td>
                  ))}
                  <td className="act">
                    {name === 'pages' && (
                      <>
                        <Link className="btn sm" href={`/admin/pages/${row.id}/sections`}>
                          Sections
                        </Link>{' '}
                        <a className="btn sm ghost" href={row.slug === 'home' ? '/' : `/${row.slug}`} target="_blank" rel="noopener">
                          View ↗
                        </a>{' '}
                      </>
                    )}
                    {name === 'products' && (
                      <>
                        <Link className="btn sm" href={`/admin/product-items?filter.categoryId=${row.id}`}>
                          Items
                        </Link>{' '}
                        <a className="btn sm ghost" href={`/products/${row.slug}`} target="_blank" rel="noopener">
                          View ↗
                        </a>{' '}
                      </>
                    )}
                    {name === 'machines' && (
                      <a className="btn sm ghost" href={`/power-press/${row.slug}`} target="_blank" rel="noopener">
                        View ↗
                      </a>
                    )}{' '}
                    {name === 'posts' && (
                      <a className="btn sm ghost" href={`/press/${row.slug}`} target="_blank" rel="noopener">
                        View ↗
                      </a>
                    )}{' '}
                    <Link className="btn sm" href={`/admin/${name}/${row.id}`}>
                      Edit
                    </Link>{' '}
                    {!(name === 'pages' && row.isSystem) && (
                      <button className="btn sm d" type="button" onClick={() => remove(row)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!sorted.length && (
                <tr>
                  <td colSpan={def.columns.length + 1} className="empty">
                    {loading ? 'Loading…' : 'No records.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
