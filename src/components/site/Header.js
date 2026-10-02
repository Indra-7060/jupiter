import SmartLink from './SmartLink';
import Cb from './Cb';
import ActiveLink from './ActiveLink';

function MegaMenu({ item }) {
  const m = item.mega || {};
  return (
    <div className="mega">
      <div className="mi">
        <div className="mh">
          {m.eyebrow && <small>{m.eyebrow}</small>}
          {m.title && <h3>{m.title}</h3>}
          {m.text && <p>{m.text}</p>}
          {m.ctaLabel && (
            <SmartLink className="mcta" href={m.ctaHref || item.href}>
              {m.ctaLabel}
            </SmartLink>
          )}
        </div>
        <ul className="mg">
          {item.children.map((c) => (
            <li key={c.id}>
              <SmartLink href={c.href}>
                <span className="th">{c.image && <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}</span>
                <span className="tx2">
                  <b title={c.label}>{c.label}</b>
                  {c.description && <small>{c.description}</small>}
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
      {(m.barText || m.barLinkLabel) && (
        <div className="bar">
          <span>{m.barText}</span>
          {m.barLinkLabel && <SmartLink href={m.barLinkHref || '/contact'}>{m.barLinkLabel}</SmartLink>}
        </div>
      )}
    </div>
  );
}

export default function Header({ menu = [], settings = {} }) {
  const site = settings.site || {};
  const header = settings.header || {};

  return (
    <header className="hdr">
      <div className="wrap">
        <SmartLink className="logo" href="/">
          <img src={site.logo || '/images/logo.png'} alt={site.logoAlt || site.name || 'Logo'} />
        </SmartLink>
        <nav className="nav">
          {menu.map((item) =>
            item.kind === 'mega' && item.children?.length ? (
              <div className="nv" key={item.id}>
                <ActiveLink href={item.href}>{item.label}</ActiveLink>
                <MegaMenu item={item} />
              </div>
            ) : (
              <ActiveLink key={item.id} href={item.href}>
                {item.label}
              </ActiveLink>
            )
          )}
          {header.ctaLabel && (
            <ActiveLink className="nav-cta-m" href={header.ctaHref || '/contact'}>
              {header.ctaLabel}
            </ActiveLink>
          )}
        </nav>
        {header.ctaLabel && <Cb className="sm" href={header.ctaHref || '/contact'} label={header.ctaLabel} />}
        <button className="burger" aria-label="Menu" type="button">
          ☰
        </button>
      </div>
    </header>
  );
}
