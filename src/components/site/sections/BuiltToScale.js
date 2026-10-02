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
                <div className="gh">{s.ghost}</div>
                <div className="t">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
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
