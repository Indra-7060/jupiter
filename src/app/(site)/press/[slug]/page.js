import { notFound } from 'next/navigation';
import { openGraph } from '@/components/site/SitePage';
import Cta from '@/components/site/Cta';
import PostRow from '@/components/site/PostRow';
import SmartLink from '@/components/site/SmartLink';
import { getPost, getPosts, getSettings } from '@/lib/content';
import { formatDate, sanitizeHtml } from '@/lib/util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const settings = await getSettings();
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  return { title, description, ...openGraph({ title: `${title}${settings.site?.titleSuffix || ''}`, description, image: post.image, site: settings.site, type: 'article' }) };
}

const ICON = { fill: 'none', stroke: '#e79a1c', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 14, height: 14 };

export default async function PostPage({ params }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug, { countView: true }), getSettings()]);
  if (!post) notFound();
  const recent = await getPosts({ limit: 3, excludeId: post.id });

  return (
    <>
      <main>
        <div className="wrap">
          <div className="dhero">
            {post.image && <img src={post.image} alt="" />}
            <div className="ov">
              {post.category && <span className="chip">{post.category}</span>}
              <h1>{post.title}</h1>
              <div className="meta">
                <span>
                  <svg viewBox="0 0 24 24" {...ICON}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>{' '}
                  {formatDate(post.publishedAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {post.author && (
                  <span>
                    <svg viewBox="0 0 24 24" {...ICON}>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                    </svg>{' '}
                    {post.author}
                  </span>
                )}
                <span>
                  <svg viewBox="0 0 24 24" {...ICON}>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>{' '}
                  {post.views + 1} Views
                </span>
              </div>
            </div>
          </div>
          <div className="art" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body || `<p>${post.excerpt || ''}</p>`) }} />
        </div>
        {recent.length > 0 && (
          <section className="recent">
            <div className="wrap">
              <div className="hd">
                <h2>Recent Post Updates</h2>
                <SmartLink href="/press">View all press releases →</SmartLink>
              </div>
              {recent.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Cta settings={settings} />
    </>
  );
}
