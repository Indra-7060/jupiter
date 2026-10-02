import { sanitizeHtml } from '@/lib/util';

export default function RichText({ data }) {
  return (
    <div className="wrap" style={{ padding: '3rem 24px' }}>
      {data.heading && <h2 className="pg-t rv">{data.heading}</h2>}
      <div className={data.narrow ? 'art' : undefined} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.html || '') }} />
    </div>
  );
}
