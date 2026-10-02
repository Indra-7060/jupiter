'use client';

import { useState } from 'react';

const MAX = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function Field({ label, required, children }) {
  return (
    <label className="af-field">
      <span>
        {label}
        {required && <i aria-hidden="true"> *</i>}
      </span>
      {children}
    </label>
  );
}

export default function ApplicationForm({ job = null, buttonLabel = 'Submit', successMessage, compact = false, onDone }) {
  const [state, setState] = useState({ status: 'idle', error: '' });
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);

  function pick(f) {
    if (!f) return;
    if (f.size > MAX) return setState({ status: 'error', error: 'The CV must be smaller than 5 MB.' });
    setState({ status: 'idle', error: '' });
    setFile(f);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!file) return setState({ status: 'error', error: 'Please attach your CV (PDF or Word).' });
    const fd = new FormData(form);
    fd.set('cv', file);
    if (job) fd.set('jobId', String(job.id));
    setState({ status: 'sending', error: '' });
    try {
      const res = await fetch('/api/applications', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send your application.');
      form.reset();
      setFile(null);
      setState({ status: 'ok', error: '' });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  }

  if (state.status === 'ok') {
    return (
      <div className="af-done">
        <span className="af-done-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h4>Application sent</h4>
        <p>{successMessage || 'Thank you — your application has been received.'}</p>
        {onDone && (
          <button type="button" className="af-done-btn" onClick={onDone}>
            Close
          </button>
        )}
      </div>
    );
  }

  const sending = state.status === 'sending';
  return (
    <form className={`apply-form${compact ? ' compact' : ''}`} onSubmit={onSubmit} noValidate={false}>
      <div className="af-grid">
        <Field label="Full name" required>
          <input name="name" required autoComplete="name" placeholder="e.g. Anita Deshmukh" />
        </Field>
        <Field label="E-mail" required>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field label="Phone" required>
          <input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" />
        </Field>
        <Field label="Current city">
          <input name="city" autoComplete="address-level2" placeholder="e.g. Thane" />
        </Field>
        <Field label="Current company">
          <input name="company" autoComplete="organization" placeholder="Optional" />
        </Field>
        <Field label="Total experience">
          <input name="experience" placeholder="e.g. 4 yrs" />
        </Field>
        {!job && (
          <div className="af-wide">
            <Field label="Role or department of interest">
              <input name="interest" placeholder="e.g. Quality, Production, Sales" />
            </Field>
          </div>
        )}
        <div className="af-wide">
          <Field label={job ? 'Why are you a good fit for this role?' : 'A few lines about yourself'}>
            <textarea name="message" rows={4} placeholder="Optional" />
          </Field>
        </div>
        <div className="af-wide">
          <span className="af-label">
            CV<i aria-hidden="true"> *</i>
          </span>
          <label
            className={`af-drop${drag ? ' drag' : ''}${file ? ' has' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pick(e.dataTransfer.files?.[0]);
            }}
          >
            <input type="file" accept={ACCEPT} onChange={(e) => pick(e.target.files?.[0])} />
            <span className="af-drop-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
              </svg>
            </span>
            {file ? (
              <span className="af-drop-t">
                <b>{file.name}</b>
                <small>{(file.size / 1024 / 1024).toFixed(2)} MB · click to change</small>
              </span>
            ) : (
              <span className="af-drop-t">
                <b>Upload your CV</b>
                <small>Drag & drop or click · PDF or Word · max 5 MB</small>
              </span>
            )}
          </label>
        </div>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
      {state.status === 'error' && <div className="af-error">{state.error}</div>}
      <div className="af-actions">
        <button className="cb" type="submit" disabled={sending}>
          <span className="tx">
            <span>
              <b>{sending ? 'Sending…' : buttonLabel}</b>
              <b>{sending ? 'Sending…' : buttonLabel}</b>
            </span>
          </span>
          <span className="ar">
            <svg viewBox="0 0 24 24">
              <path d="M6 18L18 6M7.5 6H18v10.5" />
            </svg>
          </span>
        </button>
        <small className="af-note">Your details are only shared with our HR team.</small>
      </div>
    </form>
  );
}
