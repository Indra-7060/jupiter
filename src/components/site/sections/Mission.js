import Icon from '../Icon';

export default function Mission({ data }) {
  const items = data.items || [];
  return (
    <section className="mis2">
      {data.image && <img src={data.image} alt="Engineers at work" data-px="mis" />}
      <h2 className="rv">{data.heading}</h2>
      <div className="c" style={{ position: 'static' }}>
        <div className="four2">
          {items.map((it, i) => (
            <div key={i} className="rv" style={{ '--d': `${(i * 0.12).toFixed(2)}s` }}>
              <Icon name={it.icon} />
              <h4>{it.title}</h4>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
