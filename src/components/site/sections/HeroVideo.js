import Cb from '../Cb';

export default function HeroVideo({ data }) {
  // An unfilled hero (e.g. just added in the admin) would otherwise show as a blank dark block.
  if (!data.title && !data.subtitle && !data.video && !data.poster) return null;
  return (
    <section className="hv">
      {data.video && (
        <video className="hv-v" autoPlay muted loop playsInline preload="auto" poster={data.poster || undefined}>
          <source src={data.video} type="video/mp4" />
        </video>
      )}
      <div className="hv-sh" />
      <div className="hv-c">
        <h1>{data.title}</h1>
        {data.subtitle && <p>{data.subtitle}</p>}
        {data.tagline && <p className="hv-tag">{data.tagline}</p>}
        {data.text && <p className="hv-intro">{data.text}</p>}
        {data.buttons?.length > 0 && (
          <div className="cbs">
            {data.buttons.map((b, i) => (
              <Cb key={i} href={b.href} label={b.label} variant={b.style || ''} />
            ))}
          </div>
        )}
        {data.highlights?.length > 0 && (
          <ul className="hv-hl">
            {data.highlights.map((h, i) => (
              <li key={i} style={{ '--i': i }}>
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
