'use client';

import { useState } from 'react';

const MAX = 5 * 1024 * 1024;

export default function ApplicationForm({ job = null, buttonLabel = 'Submit', successMessage, compact = false }) {
  const [state, setState] = useState({ status: 'idle', error: '' });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get('cv');
    if (file && file.size > MAX) return setState({ status: 'error', error: 'The CV must be smaller than 5 MB.' });
    if (job) fd.set('jobId', String(job.id));
    setState({ status: 'sending', error: '' });
    try {
      const res = await fetch('/api/applications', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send your application.');
      form.reset();
      setState({ status: 'ok', error: '' });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  }

  if (state.status === 'ok') {
    return <div className="ok" style={{ display: 'block' }}>{successMessage || 'Thank you — your application has been received.'}</div>;
  }

  return (
    <form className={`enq apply${compact ? ' compact' : ''}`} onSubmit={onSubmit}>
      <div className="g2">
        <input name="name" required placeholder="Your name" />
        <input name="email" required type="email" placeholder="Your e-mail" />
        <input name="phone" required placeholder="Your phone" />
        <input name="city" placeholder="Current city" />
        <input name="company" placeholder="Current company" />
        <input name="experience" placeholder="Total experience (e.g. 4 yrs)" />
      </div>
      {!job && <input name="interest" placeholder="Role or department you are interested in" />}
      <textarea name="message" placeholder={job ? 'Why are you a good fit for this role?' : 'A few lines about yourself (optional)'} />
      <label className="cv-field">
        <span>Attach CV (PDF or Word, max 5 MB)</span>
        <input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
      <button className="cb" type="submit" disabled={state.status === 'sending'}>
        <span className="tx">
          <span>
            <b>{state.status === 'sending' ? 'Sending…' : buttonLabel}</b>
            <b>{state.status === 'sending' ? 'Sending…' : buttonLabel}</b>
          </span>
        </span>
        <span className="ar">
          <svg viewBox="0 0 24 24">
            <path d="M6 18L18 6M7.5 6H18v10.5" />
          </svg>
        </span>
      </button>
      {state.status === 'error' && (
        <div className="ok" style={{ display: 'block', color: '#b42318' }}>
          {state.error}
        </div>
      )}
    </form>
  );
}
