export default function Journey({ data }) {
  const items = data.items || [];
  const style = data.background ? { backgroundImage: `url(${data.background})` } : undefined;
  return (
    <section className="jr" id="journey" style={style}>
      <div className="c">
        <h2 className="rv">{data.heading}</h2>
        <div className="tabs2 rv" style={{ '--d': '.1s' }}>
          {items.map((it, i) => (
            <button key={i} type="button" className={i === 0 ? 'on' : undefined}>
              · {it.tab || it.title}
            </button>
          ))}
        </div>
        <div className="pline">
          <b />
          <i />
        </div>
        <div className="track rv" style={{ '--d': '.2s' }}>
          {items.map((it, i) => (
            <div key={i} className={`tli${i === 0 ? ' on' : ''}`}>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              {it.image && <img src={it.image} alt={it.title} draggable="false" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
