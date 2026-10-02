'use client';

export default function SiteError({ error, reset }) {
  return (
    <main>
      <div className="wrap pgw" style={{ textAlign: 'center', padding: '6rem 24px' }}>
        <h1 className="pg-t">Something went wrong</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{error?.message || 'Unexpected error'}</p>
        <button className="cb" type="button" onClick={() => reset()}>
          <span className="tx">
            <span>
              <b>Try again</b>
              <b>Try again</b>
            </span>
          </span>
          <span className="ar">
            <svg viewBox="0 0 24 24">
              <path d="M6 18L18 6M7.5 6H18v10.5" />
            </svg>
          </span>
        </button>
      </div>
    </main>
  );
}
