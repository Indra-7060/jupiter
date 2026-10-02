/** Letter-split ghost text (CTA "Integrate", footer "Jupiter Industrial") animated by SiteEffects. */
export default function Ghost({ text = '', className }) {
  return (
    <div className={`${className} split`} aria-label={text}>
      {[...text].map((ch, i) => (
        <i key={i} aria-hidden="true" style={{ '--i': i }}>
          {ch === ' ' ? ' ' : ch}
        </i>
      ))}
    </div>
  );
}
