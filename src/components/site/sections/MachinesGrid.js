import SmartLink from '../SmartLink';
import { getMachines } from '@/lib/content';

export default async function MachinesGrid({ data }) {
  const machines = await getMachines();
  return (
    <div className="wrap pgw" style={{ paddingBottom: '7rem' }}>
      <h1 className="pg-t" style={{ marginBottom: 0 }}>
        {data.title}
      </h1>
      {data.ghost && (
        <div className="pg-ghost" style={{ top: '9rem' }}>
          {data.ghost}
        </div>
      )}
      {data.text && <p className="pg-lead">{data.text}</p>}
      <div className="pr3">
        {machines.map((m) => (
          <SmartLink key={m.id} className="pc3 rv" href={`/power-press/${m.slug}`}>
            <div className="im">{m.image && <img src={m.image} alt={m.name} loading="lazy" referrerPolicy="no-referrer" />}</div>
            <h4>{m.name}</h4>
            {(m.cardText || m.description) && <p>{m.cardText || `${m.description.slice(0, 110)}…`}</p>}
            <span className="go">{data.linkLabel || 'View machine →'}</span>
          </SmartLink>
        ))}
      </div>
    </div>
  );
}
