import ApplicationForm from '../ApplicationForm';

export default function CvForm({ data }) {
  const wa = String(data.whatsapp || '').replace(/[^\d]/g, '');
  return (
    <section className="fsec cvsec" id="send-cv">
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
            {(data.phone || wa || data.email) && (
              <div className="cv-contact">
                {data.phone && (
                  <a href={`tel:${data.phone.replace(/[^+\d]/g, '')}`}>
                    <svg viewBox="0 0 24 24">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
                    </svg>
                    {data.phone}
                  </a>
                )}
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" />
                      <path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.4 1.7c-4 .5-8.1-3.6-7.6-7.6L10.2 7l1 2z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
                {data.email && (
                  <a href={`mailto:${data.email}`}>
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    {data.email}
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="rv">
            <ApplicationForm buttonLabel={data.buttonLabel || 'Submit'} successMessage={data.successMessage} />
          </div>
        </div>
      </div>
    </section>
  );
}
