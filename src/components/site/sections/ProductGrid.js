import SmartLink from '../SmartLink';
import { getProductCategories } from '@/lib/content';

export default async function ProductGrid({ data }) {
  const cats = await getProductCategories();
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
        {cats.map((c) => (
          <SmartLink key={c.id} className="pc3 rv" href={`/products/${c.slug}`}>
            <div className="im">{c.cardImage && <img src={c.cardImage} alt={c.name} loading="lazy" referrerPolicy="no-referrer" />}</div>
            <h4>{c.name}</h4>
            {c.cardText && <p>{c.cardText}</p>}
            <span className="go">{data.linkLabel || 'Explore range →'}</span>
          </SmartLink>
        ))}
      </div>
    </div>
  );
}
