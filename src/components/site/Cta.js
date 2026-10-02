import Cb from './Cb';
import Ghost from './Ghost';

export default function Cta({ settings = {} }) {
  const cta = settings.cta || {};
  const site = settings.site || {};
  if (!cta.heading && !cta.buttons?.length) return null;
  const lines = String(cta.heading || '').split('|');
  const resolveHref = (b) => (b.label?.toLowerCase().includes('catalog') && b.href === '#' && site.catalogUrl ? site.catalogUrl : b.href);
  return (
    <section className="cta3">
      <h2>
        {lines.map((l, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <br />}
            {l}
          </span>
        ))}
      </h2>
      {cta.em && <em>{cta.em}</em>}
      {cta.buttons?.length > 0 && (
        <div className="cbs">
          {cta.buttons.map((b, i) => (
            <Cb key={i} href={resolveHref(b)} label={b.label} variant={b.style || ''} />
          ))}
        </div>
      )}
      {cta.ghost && <Ghost className="gh2" text={cta.ghost} />}
    </section>
  );
}
