export default function Expertise({ data }) {
  const rows = data.rows || [];
  return (
    <section className="exp" id="expertise">
      <h2 className="rv">{data.heading}</h2>
      {data.subheading && (
        <p className="sb rv" style={{ '--d': '.1s' }}>
          {data.subheading}
        </p>
      )}
      {rows.map((r, i) => (
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
    </section>
  );
}
