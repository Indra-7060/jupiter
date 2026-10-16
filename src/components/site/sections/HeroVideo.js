import Cb from '../Cb';

// Line icons for the quick-highlight columns (24x24, stroke only)
const ICONS = {
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5l1.5 2.4 2.7-.8.9 2.7 2.7.9-.8 2.7 2.4 1.5-2.4 1.5.8 2.7-2.7.9-.9 2.7-2.7-.8L12 21.5l-1.5-2.4-2.7.8-.9-2.7-2.7-.9.8-2.7L2.6 12l2.4-1.5-.8-2.7 2.7-.9.9-2.7 2.7.8z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  factory: (
    <>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M17 18h1M12 18h1M7 18h1" />
    </>
  ),
  robot: (
    <>
      <path d="M3 21h8M7 21v-6l6-6M13 9l4-4 3 3" />
      <circle cx="7" cy="14" r="1.4" />
      <circle cx="13" cy="9" r="1.4" />
      <path d="M17 5l1.5-2M17 5l2.5-.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8" />
    </>
  ),
};
const ORDER = ['gear', 'shield', 'factory', 'robot', 'globe', 'handshake'];

function iconFor(text, i) {
  const t = text.toLowerCase();
  if (/automat/.test(t)) return 'robot';
  if (/^in-house/.test(t)) return 'globe';
  if (/year|experience/.test(t)) return 'gear';
  if (/certif|quality/.test(t)) return 'shield';
  if (/manufactur|facilit/.test(t)) return 'factory';
  if (/trusted|oem|global/.test(t)) return 'handshake';
  return ORDER[i % ORDER.length];
}

// "Bold lead :: rest" (optional "::"), otherwise the first two words are the bold lead
function splitHighlight(h) {
  const parts = String(h).split('::');
  if (parts.length > 1) return [parts[0].trim(), parts.slice(1).join('::').trim()];
  const w = String(h).trim().split(/\s+/);
  let n = w.length < 3 ? 1 : 2;
  if (w[1] && /^[A-Z0-9][A-Z0-9:.-]{2,}$/.test(w[1])) n = 1;
  return [w.slice(0, n).join(' '), w.slice(n).join(' ')];
}

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
            {data.highlights.map((h, i) => {
              const [lead, rest] = splitHighlight(h);
              return (
                <li key={i} style={{ '--i': i }}>
                  <svg className="hl-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[iconFor(String(h), i)]}
                  </svg>
                  <b>{lead}</b>
                  {rest && <span>{rest}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
