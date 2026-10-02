'use client';

import { useEffect, useState } from 'react';
import SchemaForm from './SchemaForm';
import { api } from '@/lib/adminClient';
import { SETTINGS_SCHEMA } from '@/lib/resources';
import { useToast } from './Toast';

export default function SettingsEditor() {
  const groups = Object.keys(SETTINGS_SCHEMA);
  const [tab, setTab] = useState(groups[0]);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api('/api/admin/settings').then(setData).catch((e) => toast(e.message, 'err'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setBusy(true);
    try {
      const saved = await api('/api/admin/settings', { method: 'PUT', body: { [tab]: data[tab] } });
      setData(saved);
      toast('Settings saved');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="ad-top">
        <div>
          <h1>Site settings</h1>
          <p>Branding, navigation, contact details, footer and the bottom banner.</p>
        </div>
        <button className="btn p" type="button" onClick={save} disabled={busy || !data}>
          {busy ? 'Saving…' : `Save ${SETTINGS_SCHEMA[tab].label}`}
        </button>
      </div>
      <div className="card">
        <div className="bd">
          <div className="tabs">
            {groups.map((g) => (
              <button key={g} type="button" className={g === tab ? 'on' : ''} onClick={() => setTab(g)}>
                {SETTINGS_SCHEMA[g].label}
              </button>
            ))}
          </div>
          {data ? (
            <SchemaForm fields={SETTINGS_SCHEMA[tab].fields} value={data[tab] || {}} onChange={(v) => setData({ ...data, [tab]: v })} />
          ) : (
            <div className="empty">Loading…</div>
          )}
        </div>
      </div>
    </>
  );
}
