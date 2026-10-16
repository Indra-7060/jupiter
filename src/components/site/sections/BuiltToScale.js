export default function BuiltToScale({ data }) {
  const slides = data.slides || [];
  if (!slides.length) return null;
  return (
    <section className="bs">
      <div className="c">
        <h2 className="rv">
          {data.heading}
          {data.headingAccent && <span>{data.headingAccent}</span>}
        </h2>
        <div className="vw rv">
          <div className="rl">
            {slides.map((s, i) => (
              <div key={i} className="sd">
                <div className="t">
                  <span className="no">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.title}</h3>
                  <i className="bar" />
                  {s.text && <p>{s.text}</p>}
                  {s.sub && <h4 className="sub">{s.sub}</h4>}
                  {s.more &&
                    String(s.more)
                      .split(/\n\s*\n/)
                      .filter((x) => x.trim())
                      .map((para, k) => (
                        <p key={k} className="more">
                          {para.trim()}
                        </p>
                      ))}
                  {s.points?.length > 0 && (
                    <ul className="pts">
                      {s.points.map((pt, k) => (
                        <li key={k}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="pic">{s.image && <img className={s.contain ? 'ct' : undefined} src={s.image} alt={s.title} />}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ctl">
          {slides.map((s, i) => (
            <button key={i} type="button">
              • {s.title}
            </button>
          ))}
        </div>
        <div className="pl">
          <i />
        </div>
      </div>
    </section>
  );
}
