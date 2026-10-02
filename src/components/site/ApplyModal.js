'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ApplicationForm from './ApplicationForm';

/**
 * Full-screen application dialog. Rendered into <body> through a portal so it is always centred on the
 * screen, whatever animations or transforms its parents have.
 */
export default function ApplyModal({ job, successMessage, onClose }) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => panelRef.current?.querySelector('input:not([type=hidden]):not([type=file])')?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  if (!mounted) return null;

  const meta = [job.department, job.location, job.experience, job.type, job.positions > 1 ? `${job.positions} positions` : null].filter(Boolean);

  return createPortal(
    <div className="apply-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="apply-modal" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="apply-title">
        <header className="apply-head">
          <div>
            <span className="kick">Apply for</span>
            <h3 id="apply-title">{job.title}</h3>
            {meta.length > 0 && (
              <div className="apply-meta">
                {meta.map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            )}
          </div>
          <button className="apply-close" type="button" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="apply-body">
          <ApplicationForm job={job} buttonLabel="Send application" successMessage={successMessage} compact onDone={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
