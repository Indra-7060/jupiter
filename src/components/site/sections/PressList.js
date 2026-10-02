import { getPosts } from '@/lib/content';
import PostRow from '../PostRow';

export default async function PressList({ data }) {
  const posts = await getPosts({ limit: Number(data.limit) || 0 });
  return (
    <div className="wrap pgw">
      <h1 className="pg-t">{data.title}</h1>
      {(data.headline || data.text) && (
        <div className="press-intro rv">
          {data.kicker && <span className="kick">{data.kicker}</span>}
          {data.headline && <h2>{data.headline}</h2>}
          {data.text && <p>{data.text}</p>}
        </div>
      )}
      {posts.map((p) => (
        <PostRow key={p.id} post={p} />
      ))}
      {!posts.length && <p style={{ textAlign: 'center', color: '#777' }}>No posts yet.</p>}
    </div>
  );
}
