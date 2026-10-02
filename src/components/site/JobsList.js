'use client';

import { useState } from 'react';
import ApplicationForm from './ApplicationForm';
import { sanitizeHtml } from '@/lib/util';

export default function JobsList({ jobs, applyLabel, emptyText, successMessage }) {
  const [open, setOpen] = useState(null);
  const [applying, setApplying] = useState(null);

  if (!jobs.length) return <p className="jobs-empty">{emptyText || 'There are no open positions right now.'}</p>;

  return (
    <>
      <div className="jobs-grid">
        {jobs.map((j) => (
          <article key={j.id} className={`job rv${open === j.id ? ' open' : ''}`}>
            <h3>{j.title}</h3>
            <div className="job-meta">
              {j.department && <span>{j.department}</span>}
              {j.location && <span>📍 {j.location}</span>}
              {j.experience && <span>⏱ {j.experience}</span>}
              {j.type && <span>{j.type}</span>}
              {j.positions > 1 && <span>{j.positions} positions</span>}
            </div>
            {j.qualifications && <p className="job-q">{j.qualifications}</p>}
            {open === j.id && j.description && <div className="job-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(j.description) }} />}
            <div className="job-actions">
              <button className="cb" type="button" onClick={() => setApplying(j)}>
                <span className="tx">
                  <span>
                    <b>{applyLabel}</b>
                    <b>{applyLabel}</b>
                  </span>
                </span>
                <span className="ar">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18L18 6M7.5 6H18v10.5" />
                  </svg>
                </span>
              </button>
              {j.description && (
                <button className="job-more" type="button" onClick={() => setOpen(open === j.id ? null : j.id)}>
                  {open === j.id ? 'Hide details ↑' : 'View details ↓'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {applying && (
        <div className="apply-bg" onClick={() => setApplying(null)}>
          <div className="apply-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="apply-close" type="button" onClick={() => setApplying(null)} aria-label="Close">
              ×
            </button>
            <span className="kick">Apply for</span>
            <h3>{applying.title}</h3>
            <ApplicationForm job={applying} buttonLabel="Send application" successMessage={successMessage} compact />
          </div>
        </div>
      )}
    </>
  );
}
