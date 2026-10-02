import SmartLink from './SmartLink';
import { formatDate } from '@/lib/util';

export default function PostRow({ post }) {
  return (
    <SmartLink className="prow rv" href={`/press/${post.slug}`}>
      <div className="tx2">
        <h3>{post.title}</h3>
        <div>
          <span className="dt">{formatDate(post.publishedAt)}</span>
          {post.excerpt && <p>{post.excerpt}</p>}
        </div>
      </div>
      <div className="im">{post.image && <img src={post.image} alt="" loading="lazy" />}</div>
    </SmartLink>
  );
}
