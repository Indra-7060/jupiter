export default function IndustriesList({ data }) {
  const items = data.items || [];
  return (
    <section className="mo ind-list">
      {data.ghost && <div className="pg-ghost" style={{ top: '1rem' }}>{data.ghost}</div>}
      <div className="wrap">
        <h2 className="rv">{data.heading}</h2>
        {data.text && <p className="lead">{data.text}</p>}
        {items.length > 0 && (
          <div className="mats rv">
            {items.map((m, i) => [
              <span key={i}>{m}</span>,
              // line break after the 4th chip: first row 4, second row the rest (desktop)
              i === 3 && items.length > 4 ? <i key="br" className="ln" /> : null,
            ])}
          </div>
        )}
        {data.footer && <p className="foot">{data.footer}</p>}
      </div>
    </section>
  );
}
