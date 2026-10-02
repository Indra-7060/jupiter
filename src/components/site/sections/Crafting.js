export default function Crafting({ data }) {
  const stats = data.stats || [];
  const industries = data.industries || [];
  return (
    <section className="cr">
      <div className="c">
        <h2 className="rv">
          {data.heading}
          {data.headingAccent && <span>{data.headingAccent}</span>}
        </h2>
        {data.subheading && <p className="sb rv">{data.subheading}</p>}
        {stats.length > 0 && (
          <div className="st rv">
            {stats.map((s, i) => (
              <div key={i}>
                <b data-n={s.value} data-s={s.suffix || ''}>
                  {s.value}
                  {s.suffix}
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {data.ghostA && <div className="gw a rv l">{data.ghostA}</div>}
        {data.ghostB && <div className="gw b rv r">{data.ghostB}</div>}
        {(data.mfTitle || data.mfText) && (
          <div className="mf">
            <div className="rv">
              {data.mfSmall && <small>{data.mfSmall}</small>}
              {data.mfTitle && <h3>{data.mfTitle}</h3>}
            </div>
            {data.mfText && (
              <p className="rv" style={{ '--d': '.15s' }}>
                {data.mfText}
              </p>
            )}
          </div>
        )}
        {industries.length > 0 && (
          <div className="ind-rows">
            {industries.map((r, i) => (
              <div key={i} className="erow rv">
                <div className="tx">
                  <div>
                    <small>{String(i + 1).padStart(2, '0')}.</small>
                    <h3>{r.title}</h3>
                  </div>
                  <p>{r.text}</p>
                </div>
                <div className="im">{r.image && <img src={r.image} alt={r.title} />}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
