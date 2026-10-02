import SmartLink from '../SmartLink';

export default function Divisions({ data }) {
  const cards = data.cards || [];
  return (
    <section className="dv">
      <div className="c">
        <h2 className="rv">
          {data.heading}
          {data.headingAccent && <span>{data.headingAccent}</span>}
        </h2>
        <div className="dcards">
          {cards.map((c, i) => (
            <div key={i} className={`dc ${i % 2 ? 'b' : 'a'}${c.wide ? ' wide' : ''} rv ${i % 2 ? 'r' : 'l'}`}>
              <div className="in">
                <h3>{c.title}</h3>
                {c.text && <p>{c.text}</p>}
                {c.tags?.length > 0 && (
                  <div className="tg">
                    {c.tags.map((t, k) => (
                      <SmartLink key={k} href={t.href || c.href || '#'}>
                        {t.label}
                      </SmartLink>
                    ))}
                  </div>
                )}
                <SmartLink className="go" href={c.href || '#'} aria-label={c.title}>
                  <svg viewBox="0 0 24 24">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </SmartLink>
              </div>
              {c.image && <img src={c.image} alt={c.title} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
