import { GearIcon } from '../Icon';

export default function Marquee({ data }) {
  const items = data.items || [];
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className={`mq${data.reverse ? ' rev' : ''}`}>
      <div className="tk">
        {doubled.map((t, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <b>{t}</b>
            <GearIcon />
          </span>
        ))}
      </div>
    </div>
  );
}
