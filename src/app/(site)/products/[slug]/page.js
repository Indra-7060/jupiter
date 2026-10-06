import { notFound } from 'next/navigation';
import { openGraph } from '@/components/site/SitePage';
import Cb from '@/components/site/Cb';
import Cta from '@/components/site/Cta';
import Icon from '@/components/site/Icon';
import SmartLink from '@/components/site/SmartLink';
import { getProductCategory, getSettings } from '@/lib/content';
import { quoteHref } from '@/lib/util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = await getProductCategory(slug);
  if (!cat) return {};
  const settings = await getSettings();
  const title = cat.metaTitle || cat.name;
  const description = cat.metaDescription || cat.cardText || undefined;
  return { title, description, ...openGraph({ title: `${title}${settings.site?.titleSuffix || ''}`, description, image: cat.heroImage || cat.cardImage, site: settings.site, type: 'website' }) };
}

function Badge({ big, text }) {
  if (!big && !text) return null;
  const lines = String(text || '').split('|');
  return (
    <div className="badge">
      {big && <b>{big}</b>}
      {lines.map((l, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </div>
  );
}

export default async function ProductCategoryPage({ params }) {
  const { slug } = await params;
  const [cat, settings] = await Promise.all([getProductCategory(slug), getSettings()]);
  if (!cat) notFound();
  const products = cat.products || [];
  const catalog = settings.site?.catalogUrl;
  const href = (h) => (h === '#' && catalog ? catalog : h);
  const isHero = cat.layout === 'hero';
  const ghostWord = (cat.title || cat.name).split(' ')[0];

  return (
    <>
      <main>
        {isHero ? (
          <section className="vh">
            <div className="pg-ghost">{ghostWord}</div>
            <div className="wrap">
              <div className="g">
                <div>
                  {cat.kicker && <span className="kick">{cat.kicker}</span>}
                  <h1>{cat.title || cat.name}</h1>
                  {cat.subtitle && <h2>{cat.subtitle}</h2>}
                  {cat.description && <p>{cat.description}</p>}
                  {cat.chips?.length > 0 && (
                    <div className="chips">
                      {cat.chips.map((c, i) => (
                        <span key={i}>{c}</span>
                      ))}
                    </div>
                  )}
                  {(cat.ctaPrimaryLabel || cat.ctaSecondaryLabel) && (
                    <div className="cbs">
                      {cat.ctaPrimaryLabel && <Cb href={href(quoteHref(cat.ctaPrimaryHref || '/contact', cat.name, cat.ctaPrimaryLabel))} label={cat.ctaPrimaryLabel} />}
                      {cat.ctaSecondaryLabel && <Cb href={href(cat.ctaSecondaryHref || '#')} label={cat.ctaSecondaryLabel} variant="o" />}
                    </div>
                  )}
                </div>
                <div className="pic rv r">
                  <div className="card">{(cat.heroImage || cat.cardImage) && <img src={cat.heroImage || cat.cardImage} alt={cat.name} referrerPolicy="no-referrer" />}</div>
                  <Badge big={cat.badgeBig} text={cat.badgeText} />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="wrap pgw" style={{ paddingBottom: '7rem' }}>
            <h1 className="pg-t" style={{ marginBottom: 0 }}>
              {cat.title || cat.name}
            </h1>
            <div className="pg-ghost" style={{ top: '9rem' }}>
              {cat.title || cat.name}
            </div>
            <div className="cgrid">
              {products.map((p) => (
                <div key={p.id} className="ccard rv">
                  {p.image && <img src={p.image} alt="" referrerPolicy="no-referrer" />}
                  <h4>{p.name}</h4>
                  {p.description && <p>{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {cat.features?.length > 0 && (
          <section className="vk">
            <div className="pg-ghost">Features</div>
            <div className="wrap">
              {cat.featuresKicker && <span className="kick">{cat.featuresKicker}</span>}
              <h2>{cat.featuresHeading || 'Key Features'}</h2>
              <div className="vkg">
                {cat.features.map((f, i) => (
                  <div key={i} className="rv">
                    <span className="ic">
                      <Icon name={f.icon} />
                    </span>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {cat.steps?.length > 0 && (
          <section className="vs">
            <div className="pg-ghost">Sealing</div>
            <div className="wrap">
              {cat.stepsKicker && (
                <span className="kick" style={{ color: '#ffc766' }}>
                  {cat.stepsKicker}
                </span>
              )}
              <h2>{cat.stepsHeading}</h2>
              <div className="vsg">
                {cat.steps.map((s, i) => (
                  <div key={i} className="rv">
                    <b>{i + 1}</b>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {isHero && products.length > 0 && (
          <section className="vl">
            <div className="wrap">
              <span className="kick">Our range</span>
              <h2>{`${cat.name} Designs`}</h2>
              <div className="cgrid">
                {products.map((p) => (
                  <SmartLink key={p.id} className="ccard rv" href={p.href || '#'}>
                    <div className="ph2">{p.image && <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" />}</div>
                    <h4>{p.name}</h4>
                    {p.description && <p>{p.description}</p>}
                  </SmartLink>
                ))}
              </div>
            </div>
          </section>
        )}

        {cat.featureTags?.length > 0 && (
          <section className="kf">
            <div className="pg-ghost">Features</div>
            <h2>{cat.featuresHeading || 'Key Features'}</h2>
            <div className="circ">
              {cat.featureTags.map((t, i) => (
                <div key={i}>
                  <Icon name="check" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {cat.materials?.length > 0 && (
          <section className="mo">
            <div className="pg-ghost" style={{ top: '1rem' }}>
              Material
            </div>
            <div className="wrap">
              <h2>Material Options</h2>
              <div className="mats rv">
                {cat.materials.map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {cat.applications?.length > 0 && (
          <section className="apps">
            <div className="wrap">
              <span className="kick">Where it is used</span>
              <h2>Common Applications</h2>
              <div className="apps-grid">
                {cat.applications.map((a, i) => (
                  <div key={i} className="rv">
                    <h4>{a.title}</h4>
                    <p>{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {cat.industries?.length > 0 && (
          <section className="indb">
            <div className="wrap">
              <h2>Industries &amp; Application</h2>
              <div className="indg">
                {cat.industries.map((ind, i) => (
                  <div key={i} className="rv">
                    {ind.image && <img src={ind.image} alt="" />}
                    <b>{ind.label}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Cta settings={settings} />
    </>
  );
}
