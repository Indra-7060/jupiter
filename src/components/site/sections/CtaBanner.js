import Cb from '../Cb';
import Ghost from '../Ghost';

export default function CtaBanner({ data }) {
  const lines = String(data.heading || '').split('|');
  return (
    <section className="cta3 cta-inline">
      <h2>
        {lines.map((l, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <br />}
            {l}
          </span>
        ))}
      </h2>
      {data.em && <em>{data.em}</em>}
      {data.buttons?.length > 0 && (
        <div className="cbs">
          {data.buttons.map((b, i) => (
            <Cb key={i} href={b.href} label={b.label} variant={b.style || ''} />
          ))}
        </div>
      )}
      {data.ghost && <Ghost className="gh2" text={data.ghost} />}
    </section>
  );
}
