import { getLocations } from '@/lib/content';

export default async function ContactLocations({ data }) {
  const locations = await getLocations();
  return (
    <section className="cu">
      <div className="wrap">
        <h1 className="pg-t">{data.title}</h1>
        {data.lead && (
          <p className="lead" style={{ textAlign: 'center' }}>
            {data.lead}
          </p>
        )}
        <div className="ugrid">
          {locations.map((l) => {
            const q = encodeURIComponent(l.mapQuery || l.address || l.name);
            return (
              <div key={l.id} className="ucard rv">
                <div className="map">
                  <iframe
                    title={`${l.name} map`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${q}&output=embed`}
                  />
                </div>
                <div className="bd">
                  {l.tag && <span className="tag">{l.tag}</span>}
                  <h3>{l.name}</h3>
                  {l.address && <address>{l.address}</address>}
                  {l.phone && (
                    <a className="r" href={`tel:${l.phone.replace(/[^+\d]/g, '')}`}>
                      <svg viewBox="0 0 24 24">
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
                      </svg>
                      {l.phone}
                    </a>
                  )}
                  {l.email && (
                    <a className="r" href={`mailto:${l.email}`}>
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 7l9 6 9-6" />
                      </svg>
                      {l.email}
                    </a>
                  )}
                  <a className="dir" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
                    {data.directionsLabel || 'Get Directions →'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
