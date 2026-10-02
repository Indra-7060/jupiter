import Cb from './Cb';
import Icon from './Icon';
import { splitList } from '@/lib/util';

/** Full power-press page content: hero, gallery, features and specification table. */
export default function MachineDetail({ m }) {
  const badgeLines = String(m.badgeText || '').split('|');
  const columns = m.specColumns || [];
  const rows = m.specRows || [];
  return (
    <>
        <section className="vh pp">
          <div className="pg-ghost">{m.kicker || 'Power Press'}</div>
          <div className="wrap">
            <div className="g">
              <div>
                {m.kicker && <span className="kick">{m.kicker}</span>}
                <h1>{m.name}</h1>
                {m.description && <p>{m.description}</p>}
                {(m.ctaPrimaryLabel || m.ctaSecondaryLabel) && (
                  <div className="cbs">
                    {m.ctaPrimaryLabel && <Cb href={m.ctaPrimaryHref || '/contact'} label={m.ctaPrimaryLabel} />}
                    {m.ctaSecondaryLabel && <Cb href={m.ctaSecondaryHref || '#specs'} label={m.ctaSecondaryLabel} variant="o" />}
                  </div>
                )}
              </div>
              <div className="pic rv r">
                <div className="card">{m.image && <img src={m.image} alt={m.name} />}</div>
                {(m.badgeBig || m.badgeText) && (
                  <div className="badge">
                    {m.badgeBig && <b>{m.badgeBig}</b>}
                    {badgeLines.map((l, i) => (
                      <span key={i} style={{ display: 'contents' }}>
                        {i > 0 && <br />}
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {m.gallery?.length > 0 && (
          <section className="gl">
            <div className="wrap">
              <span className="kick">Gallery</span>
              <h2>{m.galleryHeading || 'Machine Gallery'}</h2>
              <div className="glg">
                {m.gallery.map((g, i) => (
                  <a key={i} className="rv" href={g.href || '#'} target={g.href ? '_blank' : undefined} rel={g.href ? 'noopener noreferrer' : undefined}>
                    <div className="im">{g.image && <img src={g.image} alt={g.label || m.name} loading="lazy" referrerPolicy="no-referrer" />}</div>
                    <b>{g.label}</b>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {m.features?.length > 0 && (
          <section className="vk">
            <div className="pg-ghost">Features</div>
            <div className="wrap">
              {m.featuresKicker && <span className="kick">{m.featuresKicker}</span>}
              <h2>{m.featuresHeading || 'Features'}</h2>
              <div className="vkg">
                {m.features.map((f, i) => (
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

        {rows.length > 0 && (
          <section className="specw" id="specs">
            <div className="wrap">
              <h2>{m.specsHeading || 'Technical Specifications'}</h2>
              <div className="sc">
                <table>
                  <tbody>
                    <tr>
                      <th>Item Specifications</th>
                      <th>Code</th>
                      <th>Unit</th>
                      {columns.map((c, i) => (
                        <th key={i}>{c}</th>
                      ))}
                    </tr>
                    {rows.map((r, i) => {
                      const vals = splitList(r.values);
                      return (
                        <tr key={i}>
                          <td>{r.label}</td>
                          <td>{r.code || '--'}</td>
                          <td>{r.unit}</td>
                          {columns.map((_, k) => (
                            <td key={k}>{vals[k] ?? ''}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
    </>
  );
}
