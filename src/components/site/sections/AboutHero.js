import Cb from '../Cb';

export default function AboutHero({ data }) {
  const paras = String(data.text || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <section className="a-hero">
      <div className="rv l">
        <h1>{data.title}</h1>
        {data.subtitle && <h4>{data.subtitle}</h4>}
        {paras.length > 0 && (
          <p>
            {paras.map((p, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {i > 0 && <br />}
                {p}
              </span>
            ))}
          </p>
        )}
        {data.buttonLabel && <Cb href={data.buttonHref || '#'} label={data.buttonLabel} />}
      </div>
      <div className="hero-img rv r">{data.image && <img src={data.image} alt={data.title || ''} />}</div>
    </section>
  );
}
