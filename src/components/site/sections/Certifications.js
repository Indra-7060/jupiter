export default function Certifications({ data }) {
  const cards = data.cards || [];
  return (
    <section className="cq">
      <h2 className="rv">{data.heading}</h2>
      {data.subheading && (
        <p className="sb rv" style={{ '--d': '.1s' }}>
          {data.subheading}
        </p>
      )}
      <div className="cgrid">
        {cards.map((c, i) => (
          <div key={i} className={`cc${i === 0 ? ' first' : ''} rv`} style={{ '--d': `${(0.05 + i * 0.1).toFixed(2)}s` }}>
            {c.badge ? (
              <div className="badge">{c.image && <img src={c.image} alt={c.title} />}</div>
            ) : (
              c.image && <img className="ph2" src={c.image} alt={c.title} />
            )}
            <div className="bd">
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
