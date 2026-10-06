'use client';

import { useCallback, useState } from 'react';
import ApplyModal from './ApplyModal';
import { sanitizeHtml } from '@/lib/util';

export default function JobsList({ jobs, applyLabel, emptyText, successMessage }) {
  const [open, setOpen] = useState(null);
  const [applying, setApplying] = useState(null);
  const closeModal = useCallback(() => setApplying(null), []);

  if (!jobs.length) return <p className="jobs-empty">{emptyText || 'There are no open positions right now.'}</p>;

  return (
    <>
      <div className="jobs-grid">
        {/* className stays constant: the scroll-reveal observer adds "in" to .rv elements, and a React
            className update would overwrite it and hide the card again. Open state goes in a data attribute. */}
        {jobs.map((j) => (
          <article key={j.id} className="job rv" data-open={open === j.id ? 'true' : undefined}>
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
                <button className="job-more" type="button" aria-expanded={open === j.id} onClick={() => setOpen(open === j.id ? null : j.id)}>
                  {open === j.id ? 'Hide details ↑' : 'View details ↓'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {applying && <ApplyModal job={applying} successMessage={successMessage} onClose={closeModal} />}
    </>
  );
}
