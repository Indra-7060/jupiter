'use client';

import { useState } from 'react';

export default function ContactForm({ data }) {
  const units = data.units?.length ? data.units : ['General enquiry'];
  const [state, setState] = useState({ status: 'idle', error: '' });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    setState({ status: 'sending', error: '' });
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send your enquiry.');
      form.reset();
      setState({ status: 'ok', error: '' });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  }

  return (
    <section className="fsec">
      <div className="wrap">
        <div className="fwrap">
          <div className="in rv">
            <h2>{data.heading}</h2>
            {data.text && <p>{data.text}</p>}
            {data.bullets?.length > 0 && (
              <ul>
                {data.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
          <form className="enq rv" onSubmit={onSubmit}>
            <div className="g2">
              <input name="name" required placeholder="Enter full name" />
              <input name="email" required type="email" placeholder="your@email.com" />
              <input name="phone" placeholder="Cell number" />
              <input name="organization" placeholder="Organization name" />
            </div>
            <select name="unit" aria-label="Unit" defaultValue={units[0]}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <textarea name="message" placeholder="Describe the clamps, sizes, and requirements..." />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
            <button className="cb" type="submit" disabled={state.status === 'sending'}>
              <span className="tx">
                <span>
                  <b>{state.status === 'sending' ? 'Sending…' : data.buttonLabel || 'Submit Enquiry'}</b>
                  <b>{state.status === 'sending' ? 'Sending…' : data.buttonLabel || 'Submit Enquiry'}</b>
                </span>
              </span>
              <span className="ar">
                <svg viewBox="0 0 24 24">
                  <path d="M6 18L18 6M7.5 6H18v10.5" />
                </svg>
              </span>
            </button>
            {state.status === 'ok' && <div className="ok" style={{ display: 'block' }}>{data.successMessage || 'Thank you — your enquiry has been received.'}</div>}
            {state.status === 'error' && (
              <div className="ok" style={{ display: 'block', color: '#b42318' }}>
                {state.error}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
